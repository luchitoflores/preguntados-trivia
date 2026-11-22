export const EXTRA_TIME_MS = 30000;
export const MAX_QUESTION_MS = 90000;
export function questionDuration(topic) {
  return topic === 'Lógica y ética' ? 90000 : 60000;
}
