import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decrypt, encrypt, isLegacyFormat } from '@/lib/whatsapp/encryption'
import { getMediaUrl, downloadMedia, sendTextMessage } from '@/lib/whatsapp/meta-api'
import { normalizePhone } from '@/lib/whatsapp/phone-utils'
import { findExistingContact, isUniqueViolation } from '@/lib/contacts/dedupe'
import { verifyMetaWebhookSignature } from '@/lib/whatsapp/webhook-signature'
import { runAutomationsForTrigger } from '@/lib/automations/engine'
import { dispatchInboundToFlows } from '@/lib/flows/engine'
import {
  handleTemplateWebhookChange,
  isTemplateWebhookField,
} from '@/lib/whatsapp/template-webhook'
import { handleRideHailingBooking } from '@/lib/whatsapp/rides-handler'
import {
  extractLoginToken,
  phonesMatch,
} from '@/lib/auth/whatsapp-login-security'
import crypto from 'crypto'

// Lazy-initialized to avoid build-time crash when env vars are missing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

interface WhatsAppMessage {
  id: string
  from: string
  timestamp: string
  type: string
  text?: { body: string }
  image?: { id: string; mime_type: string; caption?: string }
  video?: { id: string; mime_type: string; caption?: string }
  document?: { id: string; mime_type: string; filename?: string; caption?: string }
  audio?: { id: string; mime_type: string }
  sticker?: { id: string; mime_type: string }
  location?: { latitude: number; longitude: number; name?: string; address?: string }
  reaction?: { message_id: string; emoji: string }
  /**
   * Set when the customer taps a button or list row on an interactive
   * message we sent. `button_reply.id` / `list_reply.id` is whatever id
   * we put on the button/row when sending — the Flows engine uses this
   * to advance the per-contact run.
   */
  interactive?: {
    type: 'button_reply' | 'list_reply'
    button_reply?: { id: string; title: string }
    list_reply?: { id: string; title: string; description?: string }
  }
  /** Present when the customer swipe-replies to one of our messages. */
  context?: { id: string }
}

interface WhatsAppWebhookEntry {
  id: string
  changes: Array<{
    value: {
      messaging_product: string
      metadata: {
        display_phone_number: string
        phone_number_id: string
      }
      contacts?: Array<{
        profile: { name: string }
        wa_id: string
      }>
      messages?: WhatsAppMessage[]
      statuses?: Array<{
        id: string
        status: string
        timestamp: string
        recipient_id: string
      }>
    }
    field: string
  }>
}

// GET - Webhook verification
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const challenge = searchParams.get('hub.challenge')
    const verifyToken = searchParams.get('hub.verify_token')

    if (mode !== 'subscribe' || !challenge || !verifyToken) {
      return NextResponse.json(
        { error: 'Missing verification parameters' },
        { status: 400 }
      )
    }

    const { data: config } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('verify_token')
      .eq('verify_token', verifyToken)
      .maybeSingle()

    const isVerified =
      verifyToken === process.env.META_VERIFY_TOKEN ||
      verifyToken === 'Aishlee' ||
      config?.verify_token === verifyToken

    if (isVerified) {
      // Return challenge as plain text
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    return NextResponse.json(
      { error: 'Verification token mismatch' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Error in webhook GET verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Receive messages
export async function POST(request: Request) {
  // Read raw body first so we can HMAC-verify the exact bytes Meta
  // signed. request.json() would re-encode and break the signature.
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')

  if (!verifyMetaWebhookSignature(rawBody, signature)) {
    // 401 (not 200) — we want Meta's delivery dashboard to show failures
    // loudly if a misconfiguration causes signatures to stop matching,
    // rather than silently eating events.
    console.warn('[webhook] rejected request with invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: { entry?: WhatsAppWebhookEntry[] }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Await processing before acking so Vercel doesn't freeze the lambda
  // before the database operations finish.
  await processWebhook(body).catch((error) => {
    console.error('Error processing webhook:', error)
  })

  return NextResponse.json({ status: 'received' }, { status: 200 })
}

async function processWebhook(body: { entry?: WhatsAppWebhookEntry[] }) {
  if (!body.entry) return

  for (const entry of body.entry) {
    for (const change of entry.changes) {
      // Template-lifecycle events (status / quality / components
      // updates from Meta) come in on a different change.field and
      // have a different value shape — route them through the
      // dedicated handler. Skip the messaging branches below so we
      // don't try to read message-shaped fields off a template event.
      if (isTemplateWebhookField(change.field)) {
        await handleTemplateWebhookChange(
          { field: change.field, value: change.value as unknown },
          supabaseAdmin(),
        )
        continue
      }

      const value = change.value

      // Handle status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await handleStatusUpdate(status)
        }
      }

      // Handle incoming messages
      if (!value.messages || !value.contacts) continue

      const phoneNumberId = value.metadata.phone_number_id

      let { data: config } = await supabaseAdmin()
        .from('whatsapp_config')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .maybeSingle()

      if (!config) {
        // Fallback: auto-seed config for primary admin profile
        const { data: adminProfile } = await supabaseAdmin()
          .from('profiles')
          .select('id, account_id')
          .or('phone.eq.9486335870,phone.eq.919486335870,email.eq.aishleetechnology@gmail.com,role.eq.admin')
          .limit(1)
          .maybeSingle()

        if (adminProfile) {
          const acctId = adminProfile.account_id || adminProfile.id
          const encryptedToken = encrypt(process.env.META_ACCESS_TOKEN || '')

          const { data: seededConfig } = await supabaseAdmin()
            .from('whatsapp_config')
            .upsert(
              {
                account_id: acctId,
                user_id: adminProfile.id,
                phone_number_id: phoneNumberId,
                waba_id: process.env.META_WABA_ID || '',
                verify_token: process.env.META_VERIFY_TOKEN || 'Aishlee',
                access_token: encryptedToken,
                status: 'connected',
                registered_at: new Date().toISOString(),
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'account_id' }
            )
            .select('*')
            .maybeSingle()

          if (seededConfig) {
            config = seededConfig
          } else {
            config = {
              account_id: acctId,
              user_id: adminProfile.id,
              phone_number_id: phoneNumberId,
              waba_id: process.env.META_WABA_ID || '',
              verify_token: process.env.META_VERIFY_TOKEN || 'Aishlee',
              access_token: encryptedToken,
              status: 'connected',
            } as any
          }
        }
      }

      if (!config) {
        console.error('No config found for phone_number_id:', phoneNumberId)
        continue
      }

      let decryptedAccessToken: string
      try {
        decryptedAccessToken = decrypt(config.access_token)
      } catch (err) {
        console.error('[webhook] Decryption failed for phone_number_id:', phoneNumberId)
        continue
      }

      for (let i = 0; i < value.messages.length; i++) {
        const message = value.messages[i]
        const contact = value.contacts[i] || value.contacts[0]

        await processMessage(
          message,
          contact,
          // Tenancy — drives every contact / conversation lookup
          // and the engines' active-row dispatch.
          config.account_id,
          // Audit / sender-of-record — used as the user_id on row
          // inserts that need it for NOT NULL FK compliance. Always
          // the admin who saved the WhatsApp config.
          config.user_id,
          decryptedAccessToken
        )
      }
    }
  }
}

// The happy-path status ladder — pending → sent → delivered → read →
// replied. Webhook replays must never regress a recipient back down
// this ladder.
//
// `failed` is NOT on this ladder. It's a terminal side branch that is
// only valid from the early states (pending / sent) — once Meta has
// delivered or the user has read or replied, a later "failed" status
// event is a bug in Meta's pipeline or a spoof attempt and must be
// ignored.
const RECIPIENT_STATUS_LADDER = [
  'pending',
  'sent',
  'delivered',
  'read',
  'replied',
] as const

function ladderLevel(s: string): number {
  const idx = (RECIPIENT_STATUS_LADDER as readonly string[]).indexOf(s)
  return idx < 0 ? -1 : idx
}

/**
 * Can a recipient transition from `current` to `incoming`?
 *   - Along the ladder, only forward moves are allowed.
 *   - `failed` is accepted only from `pending` or `sent`; it's refused
 *     once the recipient has reached any of the success states.
 */
function isValidStatusTransition(current: string, incoming: string): boolean {
  if (incoming === 'failed') {
    return current === 'pending' || current === 'sent'
  }
  if (current === 'failed') {
    return false // failed is terminal
  }
  const ci = ladderLevel(current)
  const ii = ladderLevel(incoming)
  if (ii < 0) return false // unknown incoming status
  if (ci < 0) return true // unknown current — accept anything on the ladder
  return ii > ci
}

async function handleStatusUpdate(status: {
  id: string
  status: string
  timestamp: string
  recipient_id: string
}) {
  // 1) Mirror onto messages (legacy behavior) — Meta's status values
  //    already match the CHECK constraint on messages.status.
  const { error: msgErr } = await supabaseAdmin()
    .from('messages')
    .update({ status: status.status })
    .eq('message_id', status.id)

  if (msgErr) {
    console.error('Error updating message status:', msgErr)
  }

  // 2) Mirror onto broadcast_recipients via whatsapp_message_id
  //    (added in migration 003). The aggregate trigger on
  //    broadcast_recipients re-derives the parent broadcast's
  //    sent/delivered/read/failed counts automatically.
  const tsIso = new Date(parseInt(status.timestamp) * 1000).toISOString()

  const { data: recipient, error: recFetchErr } = await supabaseAdmin()
    .from('broadcast_recipients')
    .select('id, status')
    .eq('whatsapp_message_id', status.id)
    .maybeSingle()

  if (recFetchErr) {
    console.error('Error fetching broadcast recipient:', recFetchErr)
    return
  }
  if (!recipient) return // message wasn't part of a broadcast — fine

  // Guard transitions — forward-only on the success ladder, and
  // `failed` only from pre-delivered states.
  if (!isValidStatusTransition(recipient.status, status.status)) return

  const update: Record<string, unknown> = { status: status.status }
  if (status.status === 'sent' && !('sent_at' in update)) update.sent_at = tsIso
  if (status.status === 'delivered') update.delivered_at = tsIso
  if (status.status === 'read') update.read_at = tsIso

  const { error: recUpdateErr } = await supabaseAdmin()
    .from('broadcast_recipients')
    .update(update)
    .eq('id', recipient.id)

  if (recUpdateErr) {
    console.error('Error updating broadcast recipient status:', recUpdateErr)
  }
}

/**
 * If an inbound message's sender is on a still-unreplied
 * broadcast_recipients row, flip it to `replied` so the reply count
 * advances on the parent broadcast.
 *
 * Runs on a best-effort basis — failures here must not break the
 * main inbound-message flow, so errors are swallowed with a log.
 */
async function flagBroadcastReplyIfAny(accountId: string, contactId: string) {
  try {
    // Most recent outbound broadcast in this account that hasn't
    // been replied to yet. Account-scoped so a shared inbox reply
    // marks the broadcast as replied regardless of which teammate
    // sent it.
    const { data: recs, error } = await supabaseAdmin()
      .from('broadcast_recipients')
      .select('id, status, broadcast_id, broadcasts!inner(account_id)')
      .eq('contact_id', contactId)
      .eq('broadcasts.account_id', accountId)
      .in('status', ['sent', 'delivered', 'read'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !recs || recs.length === 0) return

    const row = recs[0]
    const { error: updErr } = await supabaseAdmin()
      .from('broadcast_recipients')
      .update({ status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', row.id)

    if (updErr) {
      console.error('Error marking broadcast recipient replied:', updErr)
    }
  } catch (err) {
    console.error('flagBroadcastReplyIfAny failed:', err)
  }
}

/**
 * Resolve a Meta-side message_id into the matching internal UUID, scoped
 * to one conversation. Returns null when we never received the parent
 * (e.g. a swipe-reply to a message older than this CRM install).
 */
async function lookupInternalIdByMetaId(
  metaId: string,
  conversationId: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin()
    .from('messages')
    .select('id')
    .eq('message_id', metaId)
    .eq('conversation_id', conversationId)
    .maybeSingle()
  if (error) {
    console.error('[webhook] lookupInternalIdByMetaId failed:', error.message)
    return null
  }
  return data?.id ?? null
}

/**
 * Persist an inbound reaction. WhatsApp reactions are not new messages —
 * they're per-(target, actor) state. We upsert / delete on
 * `message_reactions`, never write a row into `messages`.
 *
 * Best-effort: a missing parent (we never received it) is logged and
 * skipped so the webhook still acks 200 to Meta.
 */
async function handleReaction(
  message: WhatsAppMessage,
  conversationId: string,
  contactId: string
) {
  const reaction = message.reaction
  if (!reaction?.message_id) return

  const targetInternalId = await lookupInternalIdByMetaId(
    reaction.message_id,
    conversationId
  )
  if (!targetInternalId) {
    console.warn(
      '[webhook] reaction target message not found; skipping',
      reaction.message_id
    )
    return
  }

  // Empty emoji = removal (per Meta's Cloud API spec).
  if (!reaction.emoji) {
    const { error: delError } = await supabaseAdmin()
      .from('message_reactions')
      .delete()
      .eq('message_id', targetInternalId)
      .eq('actor_type', 'customer')
      .eq('actor_id', contactId)
    if (delError) {
      console.error('[webhook] reaction delete failed:', delError.message)
    }
    return
  }

  const { error: upsertError } = await supabaseAdmin()
    .from('message_reactions')
    .upsert(
      {
        message_id: targetInternalId,
        conversation_id: conversationId,
        actor_type: 'customer',
        actor_id: contactId,
        emoji: reaction.emoji,
      },
      { onConflict: 'message_id,actor_type,actor_id' }
    )
  if (upsertError) {
    console.error('[webhook] reaction upsert failed:', upsertError.message)
  }
}

async function handleStandaloneBiddingQuote(senderPhone: string, text: string) {
  try {
    if (!text) return;
    
    // Extract a number from the text (e.g. "Rs 500", "₹500", "500 delivery included" -> 500)
    const match = text.match(/\d+(\.\d+)?/);
    if (!match) return;
    const price = parseFloat(match[0]);
    if (price <= 0 || price > 10000000) return; // sanity check

    // 1. Is this sender a registered provider?
    const { data: provider } = await supabaseAdmin()
      .from('providers')
      .select('id')
      .eq('phone_number', senderPhone)
      .eq('is_active', true)
      .maybeSingle();

    if (!provider) return; // Not a provider, ignore

    // 2. Find their oldest pending quote (from a broadcasted request)
    const { data: pendingQuote } = await supabaseAdmin()
      .from('quotes')
      .select('id, request_id')
      .eq('provider_id', provider.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!pendingQuote) return; // No pending quotes for this provider

    // 3. Update the quote with the price and provider message
    const { error: updateErr } = await supabaseAdmin()
      .from('quotes')
      .update({
        price,
        provider_message: text,
        status: 'submitted'
      })
      .eq('id', pendingQuote.id);

    if (updateErr) {
      console.error('Error updating quote:', updateErr);
      return;
    }
      
    console.log(`[FAGO] Quote ₹${price} from provider ${provider.id} for request ${pendingQuote.request_id}`);
  } catch (error) {
    console.error('Error in handleStandaloneBiddingQuote:', error);
  }
}

async function processMessage(
  message: WhatsAppMessage,
  contact: { profile: { name: string }; wa_id: string },
  // Tenancy. Resolved from the matched whatsapp_config row; every
  // contact / conversation / message row created downstream is
  // stamped with this so any member of the account can see it.
  accountId: string,
  // Sender-of-record for inserts that need a NOT NULL user_id FK
  // (contacts, conversations). Always the admin who saved the
  // WhatsApp config; the choice is arbitrary post-017 but stable.
  configOwnerUserId: string,
  accessToken: string
) {
  const senderPhone = normalizePhone(message.from)
  const contactName = contact.profile.name

  // ── WHATSAPP INBOUND LOGIN TOKEN INTERCEPTOR ──────────────────────────
  // Detect login verification tokens BEFORE any CRM processing.
  // If the message contains TOKEN_XXXXXXXX, handle it as a login attempt
  // and short-circuit — do NOT create contacts/conversations for login msgs.
  if (message.type === 'text' && message.text?.body) {
    const loginToken = extractLoginToken(message.text.body)
    if (loginToken) {
      const handled = await handleInboundLoginToken(
        loginToken,
        senderPhone,
        contactName,
        accessToken,
        message.from // raw phone for WhatsApp reply
      )
      if (handled) {
        console.log(`[webhook] Login token ${loginToken} handled for ${senderPhone}`)
        return // Don't process as CRM message
      }
      // Token not found in DB — fall through to normal CRM processing
      // (user may have typed TOKEN_ randomly or session expired)
    }
  }
  // ── END LOGIN TOKEN INTERCEPTOR ────────────────────────────────────────

  // Find or create contact
  const contactOutcome = await findOrCreateContact(
    accountId,
    configOwnerUserId,
    senderPhone,
    contactName
  )
  if (!contactOutcome) return
  const contactRecord = contactOutcome.contact

  // Find or create conversation
  const conversation = await findOrCreateConversation(
    accountId,
    configOwnerUserId,
    contactRecord.id
  )
  if (!conversation) return

  // Reactions short-circuit here — they aren't messages. We never insert
  // into `messages`, never bump unread_count, never update last_message_text.
  // Done before parseMessageContent so the media-URL fetch is skipped.
  if (message.type === 'reaction') {
    await handleReaction(message, conversation.id, contactRecord.id)
    return
  }

  // Parse message content based on type
  const { contentText, mediaUrl, mediaType, interactiveReplyId } =
    await parseMessageContent(message, accessToken)

  // -- STANDALONE BIDDING SYSTEM HOOK --
  // We fire this asynchronously so it never slows down or breaks the main CRM flow
  if (contentText) {
    handleStandaloneBiddingQuote(senderPhone, contentText).catch(err => {
      console.error('Bidding hook failed silently:', err);
    });
  }
  // ------------------------------------

  // -- RIDE-HAILING SYSTEM HOOK --
  handleRideHailingBooking(
    message,
    accountId,
    contactRecord.id,
    senderPhone,
    accessToken
  ).catch(err => {
    console.error('Ride-hailing hook failed silently:', err);
  });
  // ------------------------------------

  // Resolve swipe-reply context if present. A missing parent is fine —
  // we just store NULL and the UI renders the message without a quote.
  let replyToInternalId: string | null = null
  if (message.context?.id) {
    replyToInternalId = await lookupInternalIdByMetaId(
      message.context.id,
      conversation.id
    )
    if (!replyToInternalId) {
      console.warn(
        '[webhook] reply context parent not found:',
        message.context.id
      )
    }
  }

  // Insert message — field names MUST match the messages table schema
  // (see supabase/migrations/001_initial_schema.sql):
  //   conversation_id, sender_type, content_type, content_text,
  //   media_url, template_name, message_id, status, created_at
  // `mediaType` is intentionally unused — the schema has no media_type
  // column; the MIME type is only used to construct the proxy URL during
  // parseMessageContent. Silence the unused-var warning:
  void mediaType

  // The messages.content_type CHECK constraint (widened in migration 010
  // to add 'interactive' for button/list taps) allows:
  //   text, image, document, audio, video, location, template, interactive
  // Map incoming WhatsApp types that aren't in that list to the closest
  // allowed value so the INSERT doesn't fail with a constraint error.
  const ALLOWED_CONTENT_TYPES = new Set([
    'text', 'image', 'document', 'audio', 'video',
    'location', 'template', 'interactive',
  ])
  const contentType = ALLOWED_CONTENT_TYPES.has(message.type)
    ? message.type
    : message.type === 'sticker'
      ? 'image'   // stickers are images
      : 'text'    // reaction, unknown → text fallback

  // Determine whether this is the contact's very first inbound message
  // BEFORE we insert, so the count is accurate. Covers the case where
  // the contact row already exists (manual add / CSV import) but they've
  // never messaged us before — which new_contact_created wouldn't catch.
  const { count: priorCustomerMsgCount } = await supabaseAdmin()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversation.id)
    .eq('sender_type', 'customer')
  const isFirstInboundMessage = (priorCustomerMsgCount ?? 0) === 0

  const { error: msgError } = await supabaseAdmin().from('messages').insert({
    conversation_id: conversation.id,
    sender_type: 'customer',
    content_type: contentType,
    content_text: contentText,
    media_url: mediaUrl,
    message_id: message.id,
    status: 'delivered',
    created_at: new Date(parseInt(message.timestamp) * 1000).toISOString(),
    reply_to_message_id: replyToInternalId,
    // Only populated for content_type='interactive'. Migration 010 added
    // the column; null for every other content_type so existing inserts
    // behave identically.
    interactive_reply_id: interactiveReplyId,
  })

  if (msgError) {
    console.error('Error inserting message:', msgError)
    return
  }

  // Update conversation
  const { error: convError } = await supabaseAdmin()
    .from('conversations')
    .update({
      last_message_text: contentText || `[${message.type}]`,
      last_message_at: new Date().toISOString(),
      unread_count: (conversation.unread_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversation.id)

  if (convError) {
    console.error('Error updating conversation:', convError)
  }

  // If this contact was a recent broadcast recipient, flag the reply
  // so the broadcast's `replied_count` advances (via the aggregate
  // trigger installed in migration 003).
  await flagBroadcastReplyIfAny(accountId, contactRecord.id)

  // ============================================================
  // Flow runner dispatch.
  //
  // If the runner consumes the message (it either advanced an active
  // run or started a new one), we suppress the `new_message_received`
  // + `keyword_match` automation triggers for this inbound. Customer
  // is navigating the bot menu, not sending a fresh trigger word
  // that should fork into automations.
  //
  // The relationship-level triggers (`new_contact_created`,
  // `first_inbound_message`) still fire even when consumed — those
  // are about WHO is messaging, not what they said.
  //
  // Awaited (not fire-and-forget) because we need the `consumed`
  // result before deciding whether to dispatch automations. The
  // runner has its own try/catch and never throws. Accounts with
  // no active flows take the runner's early-exit "no_match" path
  // basically for free (one indexed SELECT for the active run).
  // ============================================================
  const flowResult = await dispatchInboundToFlows({
    accountId,
    userId: configOwnerUserId,
    contactId: contactRecord.id,
    conversationId: conversation.id,
    message:
      interactiveReplyId
        ? {
            kind: 'interactive_reply',
            reply_id: interactiveReplyId,
            reply_title: contentText ?? '',
            meta_message_id: message.id,
          }
        : {
            kind: 'text',
            text: contentText ?? message.text?.body ?? '',
            meta_message_id: message.id,
          },
    isFirstInboundMessage,
  })
  const flowConsumed = flowResult.consumed

  // Fire any automations that react to this webhook event. All dispatches
  // run here (not earlier) so the contact, conversation, and inbound
  // message all exist before any step — including send_message — runs.
  // Fire-and-forget: a slow or failing automation must not block the
  // webhook's 200 OK response to Meta.
  const inboundText = contentText ?? message.text?.body ?? ''
  const automationTriggers: (
    | 'new_contact_created'
    | 'first_inbound_message'
    | 'new_message_received'
    | 'keyword_match'
  )[] = []
  // Content-level triggers are suppressed when a flow consumed the
  // message — see the comment block above.
  if (!flowConsumed) {
    automationTriggers.push('new_message_received', 'keyword_match')
  }
  // new_contact_created fires only when the webhook just auto-created the
  // contact row. first_inbound_message fires whenever this is the contact's
  // first-ever customer-sent message — a superset that also catches
  // manually-imported contacts sending for the first time. We dispatch both
  // so users can pick whichever semantic they want; an automation that
  // listens to only one trigger runs only when that trigger matches.
  if (contactOutcome.wasCreated) automationTriggers.unshift('new_contact_created')
  if (isFirstInboundMessage) automationTriggers.unshift('first_inbound_message')
  await Promise.all(
    automationTriggers.map((triggerType) =>
      runAutomationsForTrigger({
        accountId,
        triggerType,
        contactId: contactRecord.id,
        context: {
          message_text: inboundText,
          conversation_id: conversation.id,
        },
      }).catch((err) => console.error('[automations] dispatch failed:', err))
    )
  )
}

async function parseMessageContent(
  message: WhatsAppMessage,
  accessToken: string
): Promise<{
  contentText: string | null
  mediaUrl: string | null
  mediaType: string | null
  /**
   * For interactive button / list replies: the stable id of the tapped
   * option (whatever we put on the button when sending). Used by the
   * Flows engine to advance the per-contact run; persisted to
   * `messages.interactive_reply_id` so the inbox bubble can render the
   * tap with the right affordance. Null for everything else.
   */
  interactiveReplyId: string | null
}> {
  // getMediaUrl signature is (mediaId, accessToken) — earlier code had
  // the args swapped, so every verification hit an invalid Meta URL and
  // fell through to the catch block, leaving mediaUrl as null. That's
  // why images showed up as empty bubbles in the inbox.
  const verifyAndBuildUrl = async (
    mediaId: string
  ): Promise<string | null> => {
    try {
      await getMediaUrl({ mediaId, accessToken })
      return `/api/whatsapp/media/${mediaId}`
    } catch (error) {
      console.error(
        `Failed to verify media ${mediaId} with Meta:`,
        error instanceof Error ? error.message : error
      )
      return null
    }
  }

  // Default shape — each case overrides only the fields it cares about.
  // Keeps the new `interactiveReplyId` field DRY across every return site.
  const empty = {
    contentText: null,
    mediaUrl: null,
    mediaType: null,
    interactiveReplyId: null,
  }

  switch (message.type) {
    case 'text':
      return { ...empty, contentText: message.text?.body || null }

    case 'image':
      if (message.image?.id) {
        return {
          ...empty,
          contentText: message.image.caption || null,
          mediaUrl: await verifyAndBuildUrl(message.image.id),
          mediaType: message.image.mime_type,
        }
      }
      return empty

    case 'video':
      if (message.video?.id) {
        return {
          ...empty,
          contentText: message.video.caption || null,
          mediaUrl: await verifyAndBuildUrl(message.video.id),
          mediaType: message.video.mime_type,
        }
      }
      return empty

    case 'document':
      if (message.document?.id) {
        return {
          ...empty,
          contentText:
            message.document.caption || message.document.filename || null,
          mediaUrl: await verifyAndBuildUrl(message.document.id),
          mediaType: message.document.mime_type,
        }
      }
      return empty

    case 'audio':
      if (message.audio?.id) {
        return {
          ...empty,
          mediaUrl: await verifyAndBuildUrl(message.audio.id),
          mediaType: message.audio.mime_type,
        }
      }
      return empty

    case 'sticker':
      // Stickers are images under the hood. Treat them as such so the
      // MessageBubble renders the <img>. The caller maps the DB
      // content_type to 'image' for the CHECK constraint.
      if (message.sticker?.id) {
        return {
          ...empty,
          mediaUrl: await verifyAndBuildUrl(message.sticker.id),
          mediaType: message.sticker.mime_type,
        }
      }
      return empty

    case 'location':
      if (message.location) {
        const loc = message.location
        const locationText = [loc.name, loc.address, `${loc.latitude},${loc.longitude}`]
          .filter(Boolean)
          .join(' - ')
        return { ...empty, contentText: locationText }
      }
      return empty

    case 'reaction':
      return { ...empty, contentText: message.reaction?.emoji || null }

    case 'interactive': {
      // The customer tapped a reply button or a list row on a message
      // we previously sent. Meta delivers `interactive.button_reply` for
      // 3-button messages and `interactive.list_reply` for list messages.
      // Use the human-readable title as contentText so the inbox bubble
      // renders the tap legibly ("Existing customer"), and stash the
      // stable id separately so the Flows engine can route on it.
      const reply =
        message.interactive?.button_reply ?? message.interactive?.list_reply
      if (reply?.id) {
        return {
          ...empty,
          contentText: reply.title || reply.id,
          interactiveReplyId: reply.id,
        }
      }
      return { ...empty, contentText: '[Interactive reply]' }
    }

    default:
      return {
        ...empty,
        contentText: `[Unsupported message type: ${message.type}]`,
      }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactRow = any

interface ContactOutcome {
  contact: ContactRow
  /** True when this call created the row; drives new_contact_created
   *  automation dispatch in processMessage. */
  wasCreated: boolean
}

async function findOrCreateContact(
  accountId: string,
  configOwnerUserId: string,
  phone: string,
  name: string
): Promise<ContactOutcome | null> {
  // Find an existing contact for this account by phone. The shared
  // helper pre-filters in SQL by the last-8-digit suffix (so we don't
  // pull every contact on every inbound message) then applies the
  // strict `phonesMatch` in JS on the small candidate set. The same
  // helper backs the manual contact form and CSV import, so all three
  // paths agree on what "same number" means (issue #212).
  const existingContact = await findExistingContact(
    supabaseAdmin(),
    accountId,
    phone,
  )

  if (existingContact) {
    // Update name if it changed
    if (name && name !== existingContact.name) {
      await supabaseAdmin()
        .from('contacts')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', existingContact.id)
    }
    return { contact: existingContact, wasCreated: false }
  }

  // Create new contact. account_id is the tenancy column;
  // user_id is the NOT NULL FK audit column (no inbound message
  // has a single "user who created" it — we attribute to the
  // WhatsApp config owner as a stable default).
  const { data: newContact, error: createError } = await supabaseAdmin()
    .from('contacts')
    .insert({
      account_id: accountId,
      user_id: configOwnerUserId,
      phone,
      name: name || phone,
    })
    .select()
    .single()

  if (createError) {
    // Lost a race: a concurrent inbound delivery (or another path)
    // created this contact between our lookup and insert, and the
    // unique index (migration 022) rejected the duplicate. Re-resolve
    // the existing row instead of dropping the message.
    if (isUniqueViolation(createError)) {
      const raced = await findExistingContact(supabaseAdmin(), accountId, phone)
      if (raced) return { contact: raced, wasCreated: false }
    }
    console.error('Error creating contact:', createError)
    return null
  }

  return { contact: newContact, wasCreated: true }
}

async function findOrCreateConversation(
  accountId: string,
  configOwnerUserId: string,
  contactId: string,
) {
  // Look for existing conversation in this account
  const { data: existing, error: findError } = await supabaseAdmin()
    .from('conversations')
    .select('*')
    .eq('account_id', accountId)
    .eq('contact_id', contactId)
    .single()

  if (!findError && existing) {
    return existing
  }

  // Create new conversation. Same tenancy + audit split as
  // findOrCreateContact above.
  const { data: newConv, error: createError } = await supabaseAdmin()
    .from('conversations')
    .insert({
      account_id: accountId,
      user_id: configOwnerUserId,
      contact_id: contactId,
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating conversation:', createError)
    return null
  }

  return newConv
}

// ============================================================
// WhatsApp Inbound Login — Token Verification Handler
// ============================================================
// SECURITY HARDENING:
// 1. Token lookup is case-insensitive but stored uppercase
// 2. Phone number matching: sender's WhatsApp phone MUST match session phone
// 3. Token expiry: sessions older than 10 minutes are rejected
// 4. Single-use: token is marked 'verified' and cannot be reused
// 5. No CRM side-effects: login messages don't create contacts/conversations
// 6. Confirmation reply via free-form text (inside 24h window = FREE)
// 7. Anti-replay: re-sending the same token after verification does nothing
// ============================================================

// Bootstrap admin phones for role resolution
const LOGIN_BOOTSTRAP_ADMIN_PHONES = [
  '9486335870', '919486335870'
]

async function handleInboundLoginToken(
  token: string,
  senderPhone: string,
  senderName: string,
  accessToken: string,
  rawWhatsAppFrom: string // un-normalized phone for reply
): Promise<boolean> {
  const admin = supabaseAdmin()

  // 1. Look up the token in pending sessions
  const { data: session, error: lookupError } = await admin
    .from('whatsapp_login_sessions')
    .select('*')
    .eq('session_token', token.toUpperCase())
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (lookupError || !session) {
    // Token not found, expired, or already used — not a login attempt
    return false
  }

  // 2. SECURITY: Verify sender phone matches the session phone
  if (!phonesMatch(session.phone, senderPhone)) {
    console.warn(
      `[login] Phone mismatch! Session phone: ${session.phone}, sender: ${senderPhone}, token: ${token}`
    )
    // Mark session as expired to prevent further abuse
    await admin
      .from('whatsapp_login_sessions')
      .update({ status: 'expired' })
      .eq('id', session.id)
    return true // Handled (don't process as CRM message) but don't verify
  }

  // 3. Create or find Supabase auth user (same pattern as verify-otp)
  const cleanPhone = session.phone.replace(/\D/g, '').slice(-10)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fago_wacrm_auth_secret_key'
  const securePassword = crypto.createHmac('sha256', serviceKey).update(`FAGO_AUTH_${cleanPhone}`).digest('hex')

  let user: any = null

  try {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    user = users.find((u: any) => u.email === syntheticEmail)

    if (!user) {
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: securePassword,
        user_metadata: { phone: cleanPhone, whatsapp_verified: true }
      })
      if (createError || !newUser.user) {
        console.error('[login] Failed to create user:', createError)
        return false
      }
      user = newUser.user
    } else {
      // Ensure password and metadata are in sync without race condition
      await admin.auth.admin.updateUserById(user.id, {
        password: securePassword,
        user_metadata: { ...user.user_metadata, whatsapp_verified: true, phone: cleanPhone }
      }).catch(() => {})
    }
  } catch (err) {
    console.error('[login] Auth user error:', err)
    return false
  }

  // 4. Get/build profile payload with DUAL ID + PHONE lookup & auto-merge
  const { data: matchedProfiles } = await admin
    .from('profiles')
    .select('id, full_name, main_category, role, pin_hash')
    .or(`id.eq.${user.id},phone.eq.${cleanPhone},phone.eq.91${cleanPhone},whatsapp.eq.${cleanPhone},whatsapp.eq.91${cleanPhone}`)

  // Find best existing profile data across any matched row
  let bestName: string | null = null
  let bestCategory: string | null = null
  let bestRole: string | null = null
  let bestPinHash: string | null = null

  if (matchedProfiles && matchedProfiles.length > 0) {
    for (const p of matchedProfiles) {
      if (p.full_name && !p.full_name.startsWith('User ') && !p.full_name.match(/^\d+$/)) {
        bestName = p.full_name
      }
      if (p.main_category && p.main_category !== 'Traveller') {
        bestCategory = p.main_category
      } else if (p.main_category && !bestCategory) {
        bestCategory = p.main_category
      }
      if (p.role && p.role !== 'user') {
        bestRole = p.role
      } else if (p.role && !bestRole) {
        bestRole = p.role
      }
      if (p.pin_hash) {
        bestPinHash = p.pin_hash
      }
    }
  }

  // Delete any old duplicate profile rows for this phone that have a different ID
  if (matchedProfiles && matchedProfiles.length > 0) {
    const oldIds = matchedProfiles.map((p: any) => p.id).filter((id: string) => id !== user.id)
    if (oldIds.length > 0) {
      await admin.from('profiles').delete().in('id', oldIds)
    }
  }

  // Determine final name
  let finalName = bestName || session.full_name || senderName
  if (!finalName || finalName.trim() === '' || finalName.startsWith('User ')) {
    if (bestName) finalName = bestName
    else if (session.full_name) finalName = session.full_name
    else if (senderName && senderName.trim() !== '') finalName = senderName
    else finalName = `User ${cleanPhone.slice(-4)}`
  }

  const finalCategory = bestCategory || session.category || 'Traveller'

  // Determine role
  const isBootstrapAdmin = LOGIN_BOOTSTRAP_ADMIN_PHONES.some(p =>
    cleanPhone === p || cleanPhone === p.slice(-10)
  )
  const dbRole = bestRole
  const isAdmin = dbRole === 'admin' || dbRole === 'ADMIN' || isBootstrapAdmin

  // Check driver status
  const { data: driverRecords } = await admin
    .from('drivers')
    .select('id, is_verified')
    .or(`mobile_number.eq.${cleanPhone},mobile_number.eq.91${cleanPhone},user_id.eq.${user.id}`)
  const isDriver = (driverRecords && driverRecords.length > 0 && driverRecords[0].is_verified)
    || dbRole === 'driver' || dbRole === 'DRIVER'

  const resolvedRole = isAdmin ? 'admin' : (isDriver ? 'driver' : (dbRole || 'user'))
  const resolvedCategory = isDriver ? 'Driver' : finalCategory

  // Upsert unified profile under user.id
  const profilePayload: Record<string, any> = {
    id: user.id,
    phone: cleanPhone,
    whatsapp: cleanPhone,
    full_name: finalName,
    main_category: resolvedCategory,
    role: resolvedRole,
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    platform: 'whatsapp_inbound',
  }
  if (bestPinHash) profilePayload.pin_hash = bestPinHash

  await admin.from('profiles').upsert(profilePayload, { onConflict: 'id' })

  // Sync metadata to Supabase Auth User
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      phone: cleanPhone,
      full_name: finalName,
      main_category: resolvedCategory,
      role: resolvedRole,
      whatsapp_verified: true,
    }
  })

  // 5. Generate Supabase session tokens
  const standardSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: sessionData, error: signInError } = await standardSupabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: securePassword
  })

  if (signInError || !sessionData.session) {
    console.error('[login] Session generation error:', signInError)
    return false
  }

  // 6. Store the session in the login_sessions table & mark as verified
  await admin
    .from('whatsapp_login_sessions')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      supabase_session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        role: resolvedRole,
        category: resolvedCategory,
        full_name: finalName,
        isAdmin,
        isDriver,
      }
    })
    .eq('id', session.id)

  // 7. Send free-form confirmation reply (inside 24h window = FREE, no template)
  // Get the phone_number_id from whatsapp_config for this WABA
  try {
    const { data: waConfig } = await admin
      .from('whatsapp_config')
      .select('phone_number_id')
      .limit(1)
      .maybeSingle()

    if (waConfig?.phone_number_id) {
      await sendTextMessage({
        phoneNumberId: waConfig.phone_number_id,
        accessToken,
        to: rawWhatsAppFrom,
        text: `✅ Login verified! Welcome${finalName ? `, ${finalName}` : ''}.\n\nYou can close WhatsApp now — your app is logging you in automatically.\n\n🔒 FAGO • தமிழன் AISHO`,
      }).catch(err => {
        // Non-critical — user still gets logged in even if reply fails
        console.warn('[login] Confirmation reply failed:', err)
      })
    }
  } catch (err) {
    console.warn('[login] Config lookup for reply failed:', err)
  }

  console.log(`[login] ✅ Verified: phone=${cleanPhone}, role=${resolvedRole}, name=${finalName}`)
  return true
}
