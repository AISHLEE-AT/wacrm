/**
 * 🔍 Helper Utility: Get Telegram Group Chat ID
 * 
 * Run this script to test your Telegram Bot Token and discover your Group Chat ID.
 * 
 * Usage:
 *   node scripts/get_telegram_chat_id.js <YOUR_BOT_TOKEN>
 *   or just:
 *   node scripts/get_telegram_chat_id.js (reads from .env)
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPaths = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'apps', 'web', '.env.local'),
    path.join(__dirname, '..', 'apps', 'web', '.env'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').replace(/^["'](.*)["']$/, '$1').trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  }
}
loadEnv();

const token = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.log('❌ Please provide a Telegram Bot Token:');
  console.log('  node scripts/get_telegram_chat_id.js <YOUR_BOT_TOKEN>');
  console.log('Or set TELEGRAM_BOT_TOKEN in .env / apps/web/.env.local');
  process.exit(1);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkBot() {
  console.log('🔍 Checking Telegram Bot credentials...');
  
  try {
    const me = await fetchJson(`https://api.telegram.org/bot${token}/getMe`);
    if (!me.ok) {
      console.error('❌ Invalid Bot Token:', me.description);
      return;
    }
    console.log(`✅ Connected as Bot: @${me.result.username} (${me.result.first_name})`);

    console.log('\n📡 Fetching recent updates & chat IDs...');
    const updates = await fetchJson(`https://api.telegram.org/bot${token}/getUpdates`);
    
    if (!updates.ok) {
      console.error('❌ Could not fetch updates:', updates.description);
      return;
    }

    const chats = new Map();
    (updates.result || []).forEach(u => {
      const msg = u.message || u.channel_post || u.my_chat_member;
      if (msg && msg.chat) {
        chats.set(msg.chat.id, {
          id: msg.chat.id,
          title: msg.chat.title || msg.chat.username || msg.chat.first_name,
          type: msg.chat.type,
        });
      }
    });

    if (chats.size === 0) {
      console.log('⚠️ No recent messages found.');
      console.log('\n👉 Instructions to discover your Chat ID:');
      console.log('1. Add @' + me.result.username + ' to your Telegram Group.');
      console.log('2. Make it an Administrator (or send any test message like /test in the group).');
      console.log('3. Re-run this script!');
    } else {
      console.log('🎉 Found Active Chats / Groups:');
      chats.forEach((chat) => {
        console.log(`\n📌 Chat Name: "${chat.title}"`);
        console.log(`   Type: ${chat.type}`);
        console.log(`   TELEGRAM_CHAT_ID="${chat.id}"`);
      });
      console.log('\n💡 Copy the TELEGRAM_CHAT_ID and put it into your .env / apps/web/.env.local');
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

checkBot();
