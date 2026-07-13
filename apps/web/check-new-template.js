require('dotenv').config({path: '.env'});
(async () => {
  const waba_id = '1370739925032027';
  const token = process.env.META_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v21.0/${waba_id}/message_templates?name=app_login_otp&limit=100&fields=id,name,language,status,category,components`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data.data, null, 2));
})();
