export const callKimiAI = async (apiKey, baseUrl, prompt) => {
  let url = baseUrl.trim().replace(/\/$/, "");
  if (!url || url.includes("openai.com")) url = "https://api.moonshot.cn/v1";
  
  try {
    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify({ 
        model: "moonshot-v1-8k", 
        messages: [
          { role: "system", content: "你是一位催眠大师。" }, 
          { role: "user", content: prompt }
        ], 
        temperature: 0.7 
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  } catch (e) { 
    throw e; 
  }
};