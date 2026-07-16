import dotenv from 'dotenv';
dotenv.config();

async function testFetch() {
  const token = process.env.HF_TOKEN;
  console.log("Testing raw fetch to HuggingFace...");

  const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: "<s>[INST] What is 2+2? [/INST]",
      parameters: { max_new_tokens: 50 }
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log("SUCCESS:", JSON.stringify(data));
  } else {
    const error = await response.text();
    console.log("ERROR:", response.status, error);
  }
}

testFetch();
