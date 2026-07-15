import { Prediction } from '../types';

export async function fetchPredictionFromGemini(prompt: string): Promise<Prediction> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Set EXPO_PUBLIC_GEMINI_API_KEY in .env.');
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

    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof textResponse !== 'string') {
      throw new Error('Unexpected response from Gemini. Please try again.');
    }

    let parsedData: Partial<Prediction>;
    try {
      parsedData = JSON.parse(textResponse);
    } catch {
      throw new Error('Could not parse Gemini response. Please try again.');
    }

    if (typeof parsedData.score !== 'number' || typeof parsedData.report !== 'string') {
      throw new Error('Gemini returned an incomplete forecast. Please try again.');
    }

    return {
      timeframe: parsedData.timeframe || '',
      score: parsedData.score,
      gains: Array.isArray(parsedData.gains) ? parsedData.gains : [],
      risks: Array.isArray(parsedData.risks) ? parsedData.risks : [],
      report: parsedData.report,
      narrativePoints: Array.isArray(parsedData.narrativePoints) ? parsedData.narrativePoints : [],
      suggestedHabits: Array.isArray(parsedData.suggestedHabits) ? parsedData.suggestedHabits : [],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
