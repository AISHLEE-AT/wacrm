import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);

async function test() {
  try {
    console.log("Testing Llama 3.1...");
    const res = await hf.chatCompletion({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct",
      messages: [{role: "user", content: "Hello"}],
      max_tokens: 50
    });
    console.log("Llama SUCCESS:", res.choices[0].message.content);
  } catch(e) {
    console.error("Llama ERROR:", e.message);
  }
}
test();
