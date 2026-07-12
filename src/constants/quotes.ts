export const MOTIVATIONAL_QUOTES: string[] = [
  'Small daily improvements are the key to staggering long-term results.',
  'Discipline is the bridge between goals and accomplishment.',
  'You do not rise to the level of your goals; you fall to the level of your systems.',
  'The secret of getting ahead is getting started.',
  'Motivation gets you going, but habit keeps you growing.',
  'Every action you take is a vote for the person you wish to become.',
  'Success is the sum of small efforts repeated day in and day out.',
  'We are what we repeatedly do; excellence, then, is not an act but a habit.',
  'The best time to plant a tree was twenty years ago. The second best time is today.',
  'Do something today that your future self will thank you for.',
  'Consistency is what transforms average into excellence.',
  'A year from now you may wish you had started today.',
  'Dreams don’t work unless you do.',
  'It’s not about having time; it’s about making time.',
  'Great things never come from comfort zones.',
  'The future depends on what you do today.',
  'You are one decision away from a totally different life.',
  'Progress, not perfection, is the goal.',
  'Your limitation—it’s only your imagination.',
  'Push yourself, because no one else is going to do it for you.',
  'Hard work beats talent when talent doesn’t work hard.',
  'Don’t watch the clock; do what it does. Keep going.',
  'Believe you can and you’re halfway there.',
  'The only bad workout is the one that didn’t happen.',
  'Stay close to people who feel like sunlight.',
  'Worry less, do more.',
  'Be stronger than your strongest excuse.',
  'A little progress each day adds up to big results.',
  'Fall in love with the process and the results will follow.',
  'You don’t have to be extreme, just consistent.',
  'Momentum is built one small win at a time.',
  'Rest when you’re tired, not when you’re bored.',
  'Show up for yourself even on the hard days.',
  'Today’s actions are tomorrow’s reality.',
  'Clarity comes from engagement, not thought.',
];

export function getQuoteForToday(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}
