# Cloudflare Worker proxy for MyAI

This Worker forwards POST requests to the Hugging Face Inference API and returns the model response.

Setup and publish (recommended: run locally on your machine):

1. Install Wrangler (Cloudflare CLI):
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Configure the secret `HF_TOKEN` (will prompt you to paste the token):
   ```bash
   cd cloudflare-worker
   wrangler secret put HF_TOKEN
   ```

3. Publish the Worker:
   ```bash
   wrangler publish
   ```

4. Copy the published Worker URL (e.g. `https://myai-proxy.<subdomain>.workers.dev`) and set it in your Vercel project as `PROXY_URL`:
   ```bash
   # in your project folder
   npx vercel env add PROXY_URL production
   # paste the Worker URL when prompted
   ```

5. Redeploy your Vercel project (or trigger a new deploy). The server will forward to the Worker when Hugging Face is unreachable.

Security note: Keep `HF_TOKEN` secret (use Wrangler secret or Cloudflare dashboard secrets). Rotate it if it was exposed.
