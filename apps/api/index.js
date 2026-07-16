import express from "express";
import cors from "cors";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
// Capture raw body (workaround for occasional JSON parse issues in serverless)
app.use((req, res, next) => {
  const chunks = [];
  req.on('data', (chunk) => { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); });
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    req.rawBody = raw;
    const ct = req.headers['content-type'] || '';
    console.log('raw-body debug, content-type:', ct, 'raw-start:', (raw || '').slice(0,200));
    if (/application\/json/i.test(ct)) {
      try {
        req.body = raw ? JSON.parse(raw) : {};
        req._body = true; // prevent body-parser from re-reading
      } catch (e) {
        console.error('Invalid JSON in raw-body middleware:', e.message);
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    next();
  });
  req.on('error', (err) => { next(err); });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hugging Face inference (optional: add your HF_TOKEN in Vercel environment variables)
const hf = new HfInference(process.env.HF_TOKEN);

app.post("/chat", async (req, res) => {
  // Prefer parsed body but fall back to raw body if parsing failed
  let body = req.body && Object.keys(req.body).length ? req.body : undefined;
  if (!body) {
    try {
      body = req.rawBody ? JSON.parse(req.rawBody) : {};
    } catch (e) {
      console.error('Invalid JSON body:', e.message);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  console.log('POST /chat parsed body:', JSON.stringify(body));
  const { prompt } = body;

  try {
    const response = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct",
      inputs: prompt,
      parameters: { max_new_tokens: 200 }
    });

    res.json({ reply: response.generated_text });
  } catch (err) {
    console.error('HfInference error:', err);
    // If a proxy URL is configured, forward the request to it as a fallback
    const proxyUrl = process.env.PROXY_URL;
    if (proxyUrl) {
      try {
        const forwardRes = await fetch(`${proxyUrl.replace(/\/$/, '')}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const text = await forwardRes.text();
        // attempt to parse JSON, otherwise send raw text
        try {
          const json = JSON.parse(text);
          return res.status(forwardRes.status).json(json);
        } catch (e) {
          return res.status(forwardRes.status).send(text);
        }
      } catch (forwardErr) {
        console.error('Proxy forward error:', forwardErr);
        return res.status(500).json({ error: err.message || 'fetch failed', proxyError: String(forwardErr) });
      }
    }

    res.status(500).json({ error: err.message || 'fetch failed' });
  }
});

app.post("/custom-chat", async (req, res) => {
  let body = req.body && Object.keys(req.body).length ? req.body : undefined;
  if (!body) {
    try {
      body = req.rawBody ? JSON.parse(req.rawBody) : {};
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  
  const { prompt, system_prompt, model } = body;
  const targetModel = model || "meta-llama/Llama-3.1-8B-Instruct"; // Default to approved Llama 3.1
  
  try {
    const response = await hf.chatCompletion({
      model: targetModel,
      messages: [
        ...(system_prompt ? [{ role: "system", content: system_prompt }] : []),
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error('Custom HfInference error:', err);
    res.status(500).json({ error: err.message || 'fetch failed' });
  }
});

if (process.env.VERCEL !== "1") {
  app.listen(3000, () => console.log("MyAI API running on port 3000"));
}

export default app;

// Simple web UI for testing in browser
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>MyAI Chat</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:40px auto;padding:0 16px}textarea{width:100%;height:60px;margin-bottom:8px}select{width:100%;padding:8px;margin-bottom:16px}button{padding:8px 12px}</style>
  </head>
  <body>
    <h1>MyAI Custom Build Chat</h1>
    <p>Select your AI Model from the dropdown below:</p>
    <div>
      <select id="model_select">
        <option value="meta-llama/Llama-3.1-8B-Instruct" selected>meta-llama/Llama-3.1-8B-Instruct (Default)</option>
        <option value="Qwen/Qwen2.5-7B-Instruct">Qwen/Qwen2.5-7B-Instruct</option>
      </select>
      <textarea id="system_prompt" placeholder="Enter System Prompt (Persona, e.g., 'You are an expert LMS question framer...')"></textarea>
      <textarea id="prompt" placeholder="Enter your prompt..."></textarea>
      <button onclick="sendPrompt()">Send Custom AI</button>
    </div>
    <h2>Reply</h2>
    <div id="reply" style="background:#f3f4f6;padding:12px;border-radius:4px;white-space:pre-wrap;min-height:40px">(no reply yet)</div>
    <script>
      async function sendPrompt() {
        const prompt = document.getElementById('prompt').value;
        const system_prompt = document.getElementById('system_prompt').value;
        const model = document.getElementById('model_select').value;
        const replyDiv = document.getElementById('reply');
        if (!prompt) return;
        replyDiv.innerText = "Generating reply... please wait...";
        try {
          const res = await fetch('/custom-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, system_prompt, model })
          });
          const data = await res.json();
          if (data.error) replyDiv.innerText = "Error: " + data.error;
          else replyDiv.innerText = data.reply || "No reply generated.";
        } catch (e) {
          replyDiv.innerText = "Error: " + e.message;
        }
      }
    </script>
  </body>
</html>`);
});
