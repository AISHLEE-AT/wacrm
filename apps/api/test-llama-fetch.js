import dotenv from 'dotenv';
dotenv.config();

async function testFetch() {
  const token = process.env.HF_TOKEN;
  console.log("Testing raw fetch to router.huggingface.co...");

  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemma-2-9b-it",
      messages: [{role: "user", content: "Hello"}],
      max_tokens: 50
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
