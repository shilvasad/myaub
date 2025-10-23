const modelName = "gemini-2.5-flash-preview-09-2025";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const apiUrl = apiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
  : null;

const API_URL = apiUrl;

export const callGeminiAPI = async (prompt, jsonSchema = null) => {
  if (!API_URL) {
    throw new Error('API key not configured. Set VITE_GEMINI_API_KEY in .env.');
  }

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  if (jsonSchema) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
    };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from API.');
    }

    const text = candidate.content.parts[0].text;
    return jsonSchema ? JSON.parse(text) : text;
  } catch (err) {
    console.error('Gemini API call failed:', err);
    throw new Error(`An error occurred: ${err.message}. Please try again.`);
  }
};
