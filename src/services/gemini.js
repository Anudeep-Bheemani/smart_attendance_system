const apiKey = "AIzaSyD3p-wWuXpipc_VEuRLMqjzDxQjM_wTN48";

export async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  
  for (let i = 0; i <= 5; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429 && i < 5) {
          await new Promise(resolve => setTimeout(resolve, delays[i]));
          continue;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (i === 5) {
        console.error("Gemini API Failed after retries:", error);
        return "I'm having trouble connecting to the AI service right now. Please try again later.";
      }
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
}
