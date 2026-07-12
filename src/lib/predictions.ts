import { Habit, UserProfile } from '../types';

export function buildPredictionPrompt(profile: UserProfile, habits: Habit[], timeframe: string): string {
  const habitsSummary = habits.map(h => {
    // Calculate last 30 days completion rate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = Object.keys(h.completions).filter(date => new Date(date) >= thirtyDaysAgo).length;
    const rate = habits.length > 0 ? (recentCompletions / 30) * 100 : 0;
    
    return `- ${h.name} (${h.category}): ${recentCompletions}/30 days completed (${rate.toFixed(1)}% consistency)`;
  }).join('\n');

  const badHabitsSummary = Object.entries(profile.badHabits)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `
    You are an AI life coach and future strategist. Based on the following user profile, their positive habits, and their current "bad habits", predict their life trajectory over a timeframe of ${timeframe}.
    
    USER PROFILE:
    Name: ${profile.name}
    Age: ${profile.age}
    Goals: ${profile.goals.join(', ')}

    POSITIVE HABITS (Last 30 days, with measured consistency):
    ${habitsSummary}

    CURRENT BAD HABITS / STRUGGLES:
    ${badHabitsSummary}
    
    TASK:
    1. Analyze what the user can GAIN if they maintain consistency with their positive habits over the next ${timeframe}.
    2. Analyze how their life could be NEGATIVELY IMPACTED or "destroyed" if they continue their current bad habits over the same ${timeframe}.
    3. Provide a combined "Future Forecast" report as a SINGLE concise, hard-hitting paragraph (3-5 sentences).
    4. Suggest 2-4 NEW concrete habits (not already listed) that would directly counter the user's current struggles and gaps revealed by their progress, so they can improve their trajectory.
    
    OUTPUT FORMAT (Strict JSON):
    {
      "timeframe": "${timeframe}",
      "score": number (1-10, representing overall trajectory health),
      "gains": string[] (list of major positive outcomes),
      "risks": string[] (list of major negative outcomes if bad habits continue),
      "report": string (ONE concise paragraph, 3-5 sentences, hard-hitting yet motivating),
      "narrativePoints": string[] (3-6 bullet-point takeaways summarizing the key narrative),
      "suggestedHabits": string[] (2-4 actionable new habit ideas to fix current struggles)
    }
    
    Tone: Professional, realistic, hard-hitting about risks, and highly motivating about gains.
  `;
}
