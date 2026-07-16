export default {
  async fetch(req, env) {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Read incoming request body and forward to Hugging Face Inference API
    const body = await req.text();
    const hfUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct';

    const hfRes = await fetch(hfUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body
    });

    const text = await hfRes.text();
    // Return Hugging Face response unchanged (JSON or error payload)
    return new Response(text, {
      status: hfRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
