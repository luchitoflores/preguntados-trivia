import { questionDuration, EXTRA_TIME_MS, MAX_QUESTION_MS } from './timing.js';
import { philosopherByKey, philosopherRouletteTopics } from './philosophers.js';
const KEY = 'filosofia.campaigns.v1';
const phases = new Set(['wheel', 'spinning', 'topic', 'question', 'offer', 'feedback', 'summary']);
const isQuestion = q => Array.isArray(q) && typeof q[0] === 'string' && Array.isArray(q[1]) && q[1].length === 4 && q[1].every(x => typeof x === 'string') && Number.isInteger(q[2]) && q[2] >= 0 && q[2] < 4 && typeof q[3] === 'string';
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function migratePhilosopherSnapshot(snapshot) {
  let mode = snapshot?.mode;
  if (mode === 'sartre') mode = 'author:sartre';
  const topics = mode === 'philosopher-roulette' ? philosopherRouletteTopics
    : mode?.startsWith('author:') ? philosopherByKey[mode.slice(7)]?.topics : null;
  if (!topics || !Array.isArray(snapshot.campaign) || !Array.isArray(snapshot.questions)) return snapshot;
  const expectedQuestions = topics.length * 8;
  const alreadyExpanded = snapshot.campaign.length === topics.length && snapshot.campaign.every(rows => rows.length >= 8) && snapshot.questions.length === expectedQuestions;
  if (snapshot.campaign.length !== topics.length || alreadyExpanded) return snapshot.mode === mode ? snapshot : { ...snapshot, mode };

  const campaign = snapshot.campaign.map((oldRows, i) => {
    const known = new Set(oldRows.map(row => row[0]));
    const additions = topics[i][3].filter(row => !known.has(row[0]));
    return [...oldRows, ...additions];
  });
  const knownQuestions = new Set(snapshot.questions.map(row => row[0]));
  const additions = topics.flatMap(([name, , , rows]) => {
    return rows.filter(row => !knownQuestions.has(row[0])).map(([prompt, answer, ...distractors]) => {
      const options = shuffle([answer, ...distractors]);
      knownQuestions.add(prompt);
      return [prompt, options, options.indexOf(answer), name];
    });
  });
  const questions = [...snapshot.questions, ...additions];
  const correctAnswers = [...snapshot.correctAnswers];
  const crowns = topics.map(([name]) => name).filter(name => correctAnswers.filter(index => questions[index]?.[3] === name).length >= 8);
  const reopen = snapshot.phase === 'summary';
  return {
    ...snapshot, mode, campaign, questions, crowns, lastTopic: snapshot.lastTopic ?? null,
    ...(reopen ? { phase: 'wheel', xp: Math.max(0, snapshot.xp - 50), levelResults: snapshot.levelResults.filter(row => row.level !== snapshot.level + 1), hidden: [], wrong: null, used: null, choice: null, crownRound: false } : {}),
  };
}
function validSnapshot(s) {
  const singleRun = s?.mode === 'sartre' || s?.mode === 'philosopher-roulette' || s?.mode?.startsWith('author:');
  const legacySartre = s?.mode === 'sartre';
  const sectorCount = s?.mode === 'philosopher-roulette' ? 8 : 6;
  const perSector = legacySartre || !singleRun ? 4 : 8;
  const questionCount = sectorCount * perSector;
  if (!s || !phases.has(s.phase) || !Number.isInteger(s.level) || s.level < 0 || s.level > (singleRun ? 0 : 9) || !Number.isFinite(s.xp) || s.xp < 0) return false;
  if (!Array.isArray(s.campaign) || s.campaign.length !== sectorCount || !s.campaign.every(rows => Array.isArray(rows) && rows.length >= (singleRun ? perSector : 41) && rows.every(r => Array.isArray(r) && r.length === 5 && r.every(x => typeof x === 'string')))) return false;
  if (!Array.isArray(s.questions) || s.questions.length !== questionCount || !s.questions.every(isQuestion) || !Number.isInteger(s.index) || s.index < 0 || s.index >= questionCount) return false;
  if (!['solved', 'correctAnswers', 'hidden', 'crowns', 'reserves', 'levelResults'].every(k => Array.isArray(s[k]))) return false;
  if (![s.solved, s.correctAnswers].every(list => new Set(list).size === list.length && list.every(i => Number.isInteger(i) && i >= 0 && i < questionCount))) return false;
  if (!s.correctAnswers.every(i => s.solved.includes(i)) || s.score !== s.correctAnswers.length || !s.stock || !['bomb', 'retry', 'time', 'reveal'].every(k => Number.isInteger(s.stock[k]) && s.stock[k] >= 0)) return false;
  if (!s.replacements || !Object.entries(s.replacements).every(([i, q]) => Number.isInteger(Number(i)) && Number(i) >= 0 && Number(i) < questionCount && isQuestion(q))) return false;
  if (!s.levelResults.every((row, i) => row && row.level === i + 1 && Number.isInteger(row.score) && row.score >= 0 && row.score <= questionCount && Array.isArray(row.crowns) && row.crowns.every(c => typeof c === 'string'))) return false;
  if (!s.crowns.every(c => typeof c === 'string') || !s.reserves.every(c => typeof c === 'string') || !s.hidden.every(i => Number.isInteger(i) && i >= 0 && i < 4)) return false;
  if (s.phase === 'feedback' && !['correct', 'incorrect', 'timeout'].includes(s.result)) return false;
  return s.phase !== 'question' || (Number.isFinite(s.remainingMs) && s.remainingMs >= 0 && s.remainingMs <= MAX_QUESTION_MS);
}
// Preserve earned answers from old campaigns; reopen an unfinished current summary.
function upgradeLevelRules(snapshot) {
  if (snapshot.levelRuleVersion === 2) return snapshot;
  const correct = [...snapshot.correctAnswers];
  const names = [...new Set(snapshot.questions.map(q => q[3]))];
  const perSector = snapshot.mode === 'sartre' || !snapshot.mode?.startsWith('author:') && snapshot.mode !== 'philosopher-roulette' ? 4 : 8;
  const crowns = names.filter(name => correct.filter(i => snapshot.questions[i][3] === name).length === perSector);
  const reopen = snapshot.phase === 'summary' && crowns.length < names.length;
  return { ...snapshot, levelRuleVersion: 2, solved: correct, crowns,
    ...(reopen ? { phase: 'wheel', xp: Math.max(0, snapshot.xp - 50), levelResults: snapshot.levelResults.filter(row => row.level !== snapshot.level + 1), hidden: [], wrong: null, used: null, choice: null, crownRound: false } : {}) };
}
export function emptyLibrary() { return { version: 1, activeId: null, campaigns: [] }; }
export function loadLibrary(storage) {
  try {
    storage ??= globalThis.localStorage;
    const raw = storage.getItem(KEY);
    if (!raw) return { library: emptyLibrary(), error: '' };
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.campaigns)) throw new Error('format');
    data.campaigns = data.campaigns.map(c => ({ ...c, snapshot: migratePhilosopherSnapshot(c.snapshot) }));
    if (!data.campaigns.every(c => typeof c.id === 'string' && typeof c.name === 'string' && c.name.length > 0 && Number.isFinite(c.createdAt) && Number.isFinite(c.updatedAt) && validSnapshot(c.snapshot))) throw new Error('campaign');
    if (new Set(data.campaigns.map(c => c.id)).size !== data.campaigns.length) throw new Error('duplicate');
    data.campaigns = data.campaigns.map(c => ({ ...c, snapshot: upgradeLevelRules(c.snapshot) }));
    if (!data.campaigns.some(c => c.id === data.activeId)) data.activeId = null;
    return { library: data, error: '' };
  } catch {
    return { library: emptyLibrary(), error: 'No se pudieron leer las campañas guardadas. No se han borrado los datos anteriores.' };
  }
}
export function saveLibrary(library, storage) {
  try {
    storage ??= globalThis.localStorage;
    const previous = storage.getItem(KEY);
    if (previous && loadLibrary(storage).error) storage.setItem(KEY + '.recovery', previous);
    storage.setItem(KEY, JSON.stringify(library));
    return '';
  }
  catch { return 'No se pudo guardar en este navegador. La partida sigue abierta, pero los últimos cambios podrían perderse al cerrar.'; }
}
export function snapshotGame(state, now) {
  const { deadline, pausedAt, ...rest } = state;
  return { ...rest, timerVersion: 2, levelRuleVersion: 2, remainingMs: state.phase === 'question' ? Math.max(0, Math.min(MAX_QUESTION_MS, deadline - (pausedAt ?? now))) : null };
}
export function restoreGame(snapshot, now) {
  const { remainingMs, timerVersion, ...state } = upgradeLevelRules(snapshot);
  const upgrade = timerVersion === 2 ? 0 : state.used === 'time' ? EXTRA_TIME_MS - 15000 : questionDuration(state.questions[state.index][3]) - 20000;
  return { ...state, phase: state.phase === 'spinning' ? 'topic' : state.phase, pausedAt: now, deadline: state.phase === 'question' ? now + remainingMs + upgrade : undefined };
}
export function updateCampaign(library, id, state, now) {
  return { ...library, activeId: id, campaigns: library.campaigns.map(c => c.id === id ? { ...c, snapshot: snapshotGame(state, now), updatedAt: now } : c) };
}
export function addCampaign(library, name, state, now, id = globalThis.crypto.randomUUID()) {
  return { ...library, activeId: id, campaigns: [...library.campaigns, { id, name: name.trim().slice(0, 64), createdAt: now, updatedAt: now, snapshot: snapshotGame(state, now) }] };
}
export function removeCampaign(library, id) {
  return { ...library, activeId: library.activeId === id ? null : library.activeId, campaigns: library.campaigns.filter(c => c.id !== id) };
}
