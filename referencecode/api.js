import { elements } from './state.js';

const API_KEY = ""; // Intentionally empty; set via environment or replace for local testing
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;

export async function callGeminiAPI(prompt, jsonSchema = null) {
    elements.loader.classList.remove('hidden');
    elements.errorContainer.classList.add('hidden');
    elements.mainContent.innerHTML = '';

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
        elements.errorMessage.textContent = `An error occurred: ${err.message}. Please try again.`;
        elements.errorContainer.classList.remove('hidden');
        return null;
    } finally {
        elements.loader.classList.add('hidden');
    }
}
