import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendReactionMessage } from '@/lib/whatsapp/meta-api';
import { decrypt } from '@/lib/whatsapp/encryption';
import { sanitizePhoneForMeta } from '@/lib/whatsapp/phone-utils';
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit';

/**
 * POST /api/whatsapp/react
 *
 * Body: { message_id: <internal UUID>, emoji: <single emoji or "" to remove> }
 *
 * Sends the reaction to Meta and mirrors it into `message_reactions`
 * (delete on empty emoji). Customer-side reactions are handled by the
 * webhook — this route only writes `actor_type = 'agent'` rows.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieStore = await cookies();

    // Support both Bearer token (mobile) and cookie-based (web) auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Ignored in route handler
          },
        },
        global: {
          headers: {
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = checkRateLimit(`react:${user.id}`, RATE_LIMITS.react);
    if (!limit.success) {
      return rateLimitResponse(limit);
    }

    // Resolve the caller's account_id so conversation + whatsapp_config
    // lookups work for teammates who didn't author the rows directly.
    const { data: profile } = await supabaseAdmin()
      .from('profiles')
      .select('account_id')
      .eq('id', user.id)
      .maybeSingle();
    const accountId = profile?.account_id as string | undefined;
    if (!accountId) {
      return NextResponse.json(
        { error: 'Your profile is not linked to an account.' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { message_id, emoji } = body as {
      message_id?: string;
      emoji?: string;
    };

    if (!message_id || typeof emoji !== 'string') {
      return NextResponse.json(
        { error: 'message_id and emoji are required' },
        { status: 400 },
      );
    }

    // Resolve target message + its conversation; verify ownership.
    const { data: targetMessage, error: msgError } = await supabaseAdmin()
      .from('messages')
      .select('id, message_id, conversation_id')
      .eq('id', message_id)
      .maybeSingle();

    if (msgError || !targetMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (!targetMessage.message_id) {
      // No Meta ID yet — usually a sending/failed agent message. We can't
      // tell Meta to react to a message it never received.
      return NextResponse.json(
        { error: 'Cannot react to a message that has not been sent to WhatsApp' },
        { status: 400 },
      );
    }

    const { data: conversation, error: convError } = await supabaseAdmin()
      .from('conversations')
      .select('id, account_id, contact:contacts(phone)')
      .eq('id', targetMessage.conversation_id)
      .eq('account_id', accountId)
      .maybeSingle();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    const contact = Array.isArray(conversation.contact)
      ? conversation.contact[0]
      : conversation.contact;
    if (!contact?.phone) {
      return NextResponse.json(
        { error: 'Contact phone number not found' },
        { status: 400 },
      );
    }

    // WhatsApp config + access token. Account-scoped post-multi-user.
    const { data: config, error: configError } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('phone_number_id, access_token')
      .eq('account_id', accountId)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { error: 'WhatsApp not configured.' },
        { status: 400 },
      );
    }

    const accessToken = decrypt(config.access_token);
    const sanitizedPhone = sanitizePhoneForMeta(contact.phone);

    try {
      await sendReactionMessage({
        phoneNumberId: config.phone_number_id,
        accessToken,
        to: sanitizedPhone,
        targetMessageId: targetMessage.message_id,
        emoji,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown Meta API error';
      console.error('[whatsapp/react] Meta send failed:', message);
      return NextResponse.json(
        { error: `Meta API error: ${message}` },
        { status: 502 },
      );
    }

    // Mirror into DB. Empty emoji = removal.
    if (emoji === '') {
      const { error: delError } = await supabaseAdmin()
        .from('message_reactions')
        .delete()
        .eq('message_id', targetMessage.id)
        .eq('actor_type', 'agent')
        .eq('actor_id', user.id);

      if (delError) {
        console.error('[whatsapp/react] DB delete failed:', delError.message);
        return NextResponse.json(
          { error: 'Reaction sent to Meta but DB delete failed' },
          { status: 500 },
        );
      }
    } else {
      // Upsert via SELECT + UPDATE/INSERT rather than PostgREST's .upsert()
      // because the unique constraint on (message_id, actor_type, actor_id)
      // treats two NULL actor_id rows as distinct in PostgreSQL (NULL != NULL),
      // so PostgREST can't detect the conflict on a null-actor_id row and
      // throws a unique-violation instead of updating the emoji in-place.
      const { data: existing } = await supabaseAdmin()
        .from('message_reactions')
        .select('id')
        .eq('message_id', targetMessage.id)
        .eq('actor_type', 'agent')
        .eq('actor_id', user.id)
        .maybeSingle();

      let upsertError;

      if (existing) {
        // Row exists — update emoji in-place.
        const { error } = await supabaseAdmin()
          .from('message_reactions')
          .update({ emoji })
          .eq('id', existing.id);
        upsertError = error;
      } else {
        // No row yet — insert fresh.
        const { error } = await supabaseAdmin()
          .from('message_reactions')
          .insert({
            message_id: targetMessage.id,
            conversation_id: targetMessage.conversation_id,
            actor_type: 'agent',
            actor_id: user.id,
            emoji,
          });
        upsertError = error;
      }

      if (upsertError) {
        console.error('[whatsapp/react] DB upsert failed:', upsertError.message);
        return NextResponse.json(
          { error: 'Reaction sent to Meta but DB upsert failed' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in WhatsApp react POST:', error);
    return NextResponse.json(
      { error: 'Failed to react to message' },
      { status: 500 },
    );
  }
}
