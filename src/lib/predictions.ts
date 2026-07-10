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
    
    POSITIVE HABITS (Last 30 days):
    ${habitsSummary}

    CURRENT BAD HABITS / STRUGGLES:
    ${badHabitsSummary}
    
    TASK:
    1. Analyze what the user can GAIN if they maintain consistency with their positive habits over the next ${timeframe}.
    2. Analyze how their life could be NEGATIVELY IMPACTED or "destroyed" if they continue their current bad habits over the same ${timeframe}.
    3. Provide a combined "Future Forecast" report.
    
    OUTPUT FORMAT (Strict JSON):
    {
      "timeframe": "${timeframe}",
      "score": number (1-10, representing overall trajectory health),
      "gains": string[] (list of major positive outcomes),
      "risks": string[] (list of major negative outcomes if bad habits continue),
      "report": string (a detailed, hard-hitting, yet motivating narrative report of 3-4 paragraphs)
    }
    
    Tone: Professional, realistic, hard-hitting about risks, and highly motivating about gains.
  `;
}
