import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);

async function test() {
  try {
    console.log("Testing chatCompletion with Qwen...");
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [{role: "user", content: "Hello"}],
      max_tokens: 50
    });
    console.log("Qwen chatGen SUCCESS:", res.choices[0].message.content);
  } catch(e) {
    console.error("Qwen chatGen ERROR:", e.message);
  }
}
test();
