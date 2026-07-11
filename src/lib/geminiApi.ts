import { Prediction } from '../types';

export async function fetchPredictionFromGemini(prompt: string, apiKey: string, model: string): Promise<Prediction> {
  if (!apiKey) {
    throw new Error('No Gemini API key set. Add your key in Profile → Gemini AI.');
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API Error');
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    const parsedData = JSON.parse(textResponse);
    return {
      ...parsedData,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
