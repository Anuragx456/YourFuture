import { Habit, UserProfile } from '../types';

// Each timeframe gets a different analysis lens, gain/risk framing, and output expectations
const TIMEFRAME_PROMPTS: Record<string, { label: string; focus: string; gains: string; risks: string; habits: string; narrative: string }> = {
  '1M': {
    label: 'one month',
    focus: 'Focus on IMMEDIATE, measurable changes in the next 30 days. Emphasize habit consistency streaks, short-term momentum, and quick wins that compound later. Avoid speculative long-term projections — stick to what realistically shifts in weeks.',
    gains: 'What specific improvements the user will SEE and FEEL within a month if they stay consistent (energy, focus, mood, productivity, health markers).',
    risks: 'What immediate setbacks or regressions are likely within a month if bad habits persist (slipping consistency, losing streaks, visible health/mental decline).',
    habits: '3-4 micro-habits (tiny, immediately actionable daily actions) that plug the gaps in their current routine.',
    narrative: 'Ground the narrative in THIS MONTH — what their days will actually look and feel like. Concrete, visceral, near-term.',
  },
  '6M': {
    label: 'six months',
    focus: 'Focus on MEDIUM-TERM transformation over half a year. Balance habit consistency patterns with emerging identity shifts. Project compound effects that become visible over months — skill acquisition, body composition, relationship patterns, career momentum.',
    gains: 'What compounding improvements become VISIBLE over six months — measurable skill growth, health transformation, relationship deepening, career traction, financial shifts.',
    risks: 'What medium-term decay sets in if bad habits compound unchecked — skill stagnation, health deterioration, relationship strain, career drift, financial erosion.',
    habits: '2-3 structured habits (weekly or daily routines with clear systems) that target their biggest struggle areas.',
    narrative: 'Show the arc from today to six months out — how their weekly rhythm changes, what milestones they hit or miss.',
  },
  '1Y': {
    label: 'one year',
    focus: 'Focus on a FULL YEAR of compounding. This is where habit identity crystallizes — the user either becomes a fundamentally different person or stays stuck. Project meaningful milestone achievements, identity-level shifts, and lifestyle transformations.',
    gains: 'What milestone achievements and identity-level transformations are realistic in a year — career leaps, health milestones, skill mastery, relationship evolution, financial milestones.',
    risks: 'What compounding damage a year of bad habits creates — chronic health issues, career stagnation, relationship breakdowns, financial traps, mental health deterioration.',
    habits: '2-3 keystone habits (high-leverage routines that cascade into multiple life areas) to redirect their trajectory.',
    narrative: 'Paint a year-long arc — who they become versus who they could have been. Make the identity shift tangible.',
  },
  '5Y': {
    label: 'five years',
    focus: 'Focus on FIVE-YEAR trajectory and compounding returns. Small daily habits either make them unstoppable or irreversibly stuck. Project career/financial trajectory, health aging curve, relationship depth, and life positioning. Think in terms of exponential curves — habits compound.',
    gains: 'What exponential compounding creates over five years — career positioning, financial freedom milestones, health/fitness peak, deep relationship bonds, skill portfolios, life freedom.',
    risks: 'What irreversible damage accumulates over five years — chronic disease, career dead-end, financial ruin, relationship collapse, skill obsolescence, mental health crisis.',
    habits: '2 keystone habits that compound across ALL life domains and create the biggest trajectory shift over 5 years.',
    narrative: 'Show the diverging paths — who they become vs. who they could become. Make the exponential gap feel real and urgent.',
  },
  '10Y': {
    label: 'ten years',
    focus: 'Focus on a DECADE of compounding. This is existential — daily habits will either build a remarkable life or erode one irreversibly. Project life positioning, legacy, health trajectory, financial reality, and overall life satisfaction. Think in decades: the gap between disciplined and undisciplined lives becomes unbridgeable.',
    gains: 'What a decade of discipline builds — financial independence, career mastery, peak health/longevity, deep life partnerships, skill expertise, meaningful legacy, life freedom and fulfillment.',
    risks: 'What a decade of unchecked bad habits destroys — irreversible health damage, financial devastation, career obsolescence, isolation, regret, loss of potential — things that cannot be undone.',
    habits: '2 foundational habits that shape the ENTIRE decade — the single highest-leverage daily actions that determine their 10-year destiny.',
    narrative: 'Show two decade-long lives side by side — the life they build vs. the life they lose. Make the stakes existential and the choice unmistakable.',
  },
};

export function buildPredictionPrompt(profile: UserProfile, habits: Habit[], timeframe: string): string {
  const tf = TIMEFRAME_PROMPTS[timeframe] ?? TIMEFRAME_PROMPTS['1Y'];

  const habitsSummary = habits.map(h => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCompletions = Object.keys(h.completions).filter(date => new Date(date) >= thirtyDaysAgo).length;
    const rate = (recentCompletions / 30) * 100;
    return `- ${h.name} (${h.category}): ${recentCompletions}/30 days completed (${rate.toFixed(1)}% consistency)`;
  }).join('\n');

  const badHabitsSummary = Object.entries(profile.badHabits)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `
You are an AI life coach and future strategist. Based on the following user profile, their positive habits, and their current "bad habits", predict their life trajectory over the next ${tf.label}.

${tf.focus}

USER PROFILE:
Name: ${profile.name}
Age: ${profile.age}
Goals: ${profile.goals.join(', ')}

POSITIVE HABITS (Last 30 days, with measured consistency):
${habitsSummary}

CURRENT BAD HABITS / STRUGGLES:
${badHabitsSummary}

TASK:
1. GAINS: ${tf.gains}
2. RISKS: ${tf.risks}
3. Provide a combined "Future Forecast" report as a SINGLE concise, hard-hitting paragraph (3-5 sentences).
4. SUGGESTED HABITS: ${tf.habits}

OUTPUT FORMAT (Strict JSON):
{
  "timeframe": "${timeframe}",
  "score": number (1-10, representing overall trajectory health for this timeframe),
  "gains": string[] (list of major positive outcomes),
  "risks": string[] (list of major negative outcomes if bad habits continue),
  "report": string (ONE concise paragraph, 3-5 sentences, hard-hitting yet motivating),
  "narrativePoints": string[] (3-6 bullet-point takeaways summarizing the key narrative — ${tf.narrative}),
  "suggestedHabits": string[] (actionable new habit ideas per the guidance above)
}

Tone: Professional, realistic, hard-hitting about risks, and highly motivating about gains.`;
}
