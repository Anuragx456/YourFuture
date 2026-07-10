import { Prediction } from '../types';

const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function fetchPredictionFromGemini(prompt: string): Promise<Prediction> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    // Return mock data if no API key is provided for demonstration
    return getMockPrediction();
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
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

function getMockPrediction(): Prediction {
  return {
    generatedAt: new Date().toISOString(),
    timeframe: '1 Year',
    score: 8,
    gains: [
      'Significant physical transformation and increased vitality',
      'Financial buffer established through consistent saving habits',
      'High proficiency in new skills leading to career opportunities',
    ],
    risks: [
      'Occasional alcohol consumption may hinder peak performance',
      'Excessive screen time could impact mental clarity and sleep',
      'Consistency might dip during busy periods if not anchored well',
    ],
    report: "Over the next year, your commitment to your positive habits will yield remarkable results. You can expect a significant physical transformation that will not only change how you look but also boost your daily energy levels and mental sharpenss. Financially, your discipline will create a safety net that provides peace of mind and freedom to pursue new opportunities.\n\nHowever, the dark clouds of your current struggles still loom. If the alcohol consumption and excessive screen time continue unchecked, they will act as anchors on your progress. They threaten to sap your motivation and cloud your judgment, potentially sabotaging the very gains you are working so hard to achieve. To truly 'design your destiny', you must confront these patterns as aggressively as you pursue your goals. The choice is yours: a future defined by peak performance, or one hampered by avoidable distractions.",
  };
}
