import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import crypto from 'crypto'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve('d:/at/wacrm/.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Encryption logic copied from lib
const GCM_IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function encrypt(text: string): string {
  const iv = crypto.randomBytes(GCM_IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${encrypted}:${authTag}`
}

async function run() {
  const { data: accounts, error: accountError } = await supabase.from('accounts').select('id, owner_user_id').limit(1)
  if (accountError || !accounts || accounts.length === 0) {
    console.error('No accounts found. Please sign up in the UI first.')
    return
  }
  
  const accountId = accounts[0].id
  const userId = accounts[0].owner_user_id
  
  const config = {
    account_id: accountId,
    user_id: userId,
    phone_number_id: process.env.META_PHONE_NUMBER_ID,
    waba_id: process.env.META_WABA_ID,
    access_token: encrypt(process.env.META_ACCESS_TOKEN!),
    verify_token: process.env.META_VERIFY_TOKEN,
    status: 'connected',
    updated_at: new Date().toISOString()
  }
  
  const { data: existing, error: fetchErr } = await supabase.from('whatsapp_config').select('id').eq('account_id', accountId).maybeSingle()
  
  if (existing) {
    console.log('Updating existing config...')
    const { error } = await supabase.from('whatsapp_config').update(config).eq('id', existing.id)
    if (error) console.error('Error updating:', error)
    else console.log('Successfully updated!')
  } else {
    console.log('Inserting new config...')
    const { error } = await supabase.from('whatsapp_config').insert([config])
    if (error) console.error('Error inserting:', error)
    else console.log('Successfully inserted!')
  }
}

run()
