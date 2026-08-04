
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const secret = 'O10rRIsebW9sc/WYhB7eJFm5RFfcAgIO/fdBc9QiGtplSrdNh0wdxgXx3NZsdxltbr5zqLdK1QgQNB94P8GDGw==';
const token = jwt.sign({
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + (60 * 60),
  sub: '5e990c73-d453-4cc5-9cf6-c4d5a9fff102',
  role: 'authenticated',
  email: '',
  phone: '919123596988'
}, secret);

const supabase = createClient('https://gmahjdzqitbomtmdzlfp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtYWhqZHpxaXRib210bWR6bGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNTE3MjcsImV4cCI6MjA5NzgyNzcyN30.04eGatbmH8yjtGCE2a2t2xfKAla72RZF7ZDfOevj6RE', {
  global: { headers: { Authorization: 'Bearer ' + token } }
});

async function testUpload() {
  const path1 = 'f21e8cdb-e27d-41fa-9aa4-af06ccdc0feb/test.txt';
  const { data, error } = await supabase.storage.from('chat-media').upload(path1, 'hello world', { contentType: 'text/plain' });
  console.log('Upload Result 1 (just account_id):', error || data);
}
testUpload();

