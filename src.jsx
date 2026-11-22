import React, { useEffect, useReducer, useState, useRef, useId, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

import { Bomb, RotateCcw, CircleCheck, Timer, Landmark, Lightbulb, Layers, Globe, Scale, Eye, Trophy, Volume2, VolumeX, XCircle, Clock3, Crown, ArrowLeft } from 'lucide-react';
import { questionDuration, EXTRA_TIME_MS } from './timing.js';
import { loadLibrary, saveLibrary, restoreGame, updateCampaign, addCampaign, removeCampaign } from './campaign-storage.js';
import { additionalLogic } from './logic-expansion.js';
import { formalGuide, formalHint, quickMemories } from './formal-logic.js';
import { readableOption, hasContextualOptions } from './review-options.js';
import { readablePrompt, lessonFor } from './review-wording.js';
import { explanations, optionNotes } from './explanations.js';
import { playSound, unlockSound, soundEnabled, toggleSound } from './sounds.js';
import { topics } from './questions.js';
import { drills } from './study.js';
import { reviewBank } from './review-bank.js';
import { sartreTopics } from './sartre.js';
import { philosopherData, philosopherByKey, philosopherRouletteTopics } from './philosophers.js';
import { philosopherExplanation } from './philosopher-explanations.js';
import { getPhilosopherWheelIcon, getWheelSectorIcon, wheels } from './src/core/wheels.js';
import { philosophersRegistry } from './src/core/philosophers-registry.js';
import { themes } from './src/core/themes.js';
import { adaptLegacyQuestion } from './src/core/adaptador.js';

const AdminEditor = lazy(() => import('./src/Editor.jsx'));
const ADMIN_ROUTE = ['#', '/admin', '-sofia-', '2026'].join('');

const levelCount = 10;
const perTopic = 4;
const bankSize = levelCount * perTopic + 1;
const sectorIcons = [Landmark, Lightbulb, Layers, Globe, Scale, Eye];
function registeredQuestions(key) {
  try {
    const custom = JSON.parse(localStorage.getItem('preguntas_custom') || '[]');
    return (Array.isArray(custom) ? custom : []).filter(q => q?.filosofo === key || q?.rueda === key)
      .map(q => {
        const answer = q.respuesta_correcta || {};
        const options = q.opciones?.length ? q.opciones : [answer];
        const row = [q.pregunta?.texto || 'Selecciona la respuesta correcta', answer.texto || '', ...options.filter(o => !(o.texto === answer.texto && o.imagen === answer.imagen)).map(o => o.texto || '')];
        row.coreMedia = q;
        return row;
      }).filter(row => row[1] && row.length > 2);
  } catch { return []; }
}
function topicSet(mode) {
  if (mode === 'sartre') return sartreTopics;
  if (mode === 'author:sartre') return philosopherByKey.sartre.topics;
  if (mode === 'philosopher-roulette') {
    const known = new Set(philosopherRouletteTopics.map(([name]) => name));
    const additions = Object.entries(philosophersRegistry).filter(([key, person]) => !known.has(person.nombre) && key !== 'caverna')
      .map(([key, person]) => [person.nombre, person.nombre.split(' ').slice(-1)[0], person.color || '#8B5CF6', registeredQuestions(key)]).filter(([, , , rows]) => rows.length);
    return [...philosopherRouletteTopics, ...additions];
  }
  if (mode?.startsWith('author:')) {
    const key = mode.slice(7);
    const existing = philosopherByKey[key]?.topics;
    if (existing) {
      const custom = registeredQuestions(key);
      if (!custom.length) return existing;
      return existing.map(([name, short, color, rows], i) => [name, short, color, [...rows, ...custom.filter(q => !q.coreMedia?.tema || q.coreMedia.tema.toLowerCase() === name.toLowerCase() || (!custom.some(other => other.coreMedia?.tema?.toLowerCase() === name.toLowerCase()) && i === 0))]]);
    }
    const person = philosophersRegistry[key];
    if (!person) return [];
    const custom = registeredQuestions(key);
    return person.temas.map((name, i) => [name, name, person.color || '#8B5CF6', custom.filter(q => !q.coreMedia?.tema ? i === 0 : q.coreMedia.tema.toLowerCase() === name.toLowerCase())]);
  }
  return topics;
}
const specialMode = mode => mode === 'sartre' || mode === 'philosopher-roulette' || mode?.startsWith('author:');
function questionsPerTopic(mode) {
  if (mode === 'sartre') return 4;
  if (specialMode(mode)) {
    const active = topicSet(mode);
    const lengths = active.map(([, , , rows]) => rows.length).filter(Boolean);
    return lengths.length ? Math.min(8, Math.max(1, Math.min(...lengths))) : 0;
  }
  return perTopic;
}
function ModeBar({ onInitial, onAxes, onAuthor, onPhilosopher }) {
  return <nav className="mode-switch" aria-label="Modos de juego">
    <button onClick={onInitial}>Ruleta inicial</button>
    <button onClick={onAxes}>Ejes temáticos</button>
    <button onClick={onAuthor}>Ruleta por autor</button>
    <button onClick={onPhilosopher}>Ruleta de filósofos</button>
  </nav>;
}
const philosophers = Object.entries(philosophersRegistry).filter(([key]) => key !== 'caverna').map(([key, person]) => {
  const playable = philosopherData.find(item => item.key === key) || philosopherByKey[key];
  return { key, name: person.nombre, note: person.nota || playable?.note || '', topics: playable?.topics || [], icon: person.icono, color: person.color };
});
const medievalBank = [...reviewBank[0], drills[0][2], ...topics[0][3].slice(12, 14)];
function customRowsForTopic(group) {
  try {
    const custom = JSON.parse(localStorage.getItem('preguntas_custom') || '[]');
    if (!Array.isArray(custom)) return [];
    const [topicName, shortName] = topics[group];
    return custom.filter(q => q?.rueda === 'ejes' || q?.rueda === 'platon')
      .filter(q => !q.tema ? group === 0 : [topicName, shortName].some(name => name.toLowerCase() === String(q.tema).toLowerCase()) || (group === 0 && !topics.some(([name, short]) => [name, short].some(label => label.toLowerCase() === String(q.tema).toLowerCase()))))
      .map(q => {
        const correct = q.respuesta_correcta || {};
        const choices = q.opciones?.length ? q.opciones : [correct];
        const answer = choices.find(o => o.texto === correct.texto && o.imagen === correct.imagen) || correct;
        const row = [q.pregunta?.texto || 'Selecciona la respuesta correcta', answer.texto || '', ...choices.filter(o => o !== answer).map(o => o.texto || '')];
        row.coreMedia = q;
        return row;
      }).filter(row => row[1] && row.length > 2);
  } catch { return []; }
}
const bank = topics.map(([, , , rows], group) => {
  if (group === 0) {
    const ancient = [...drills[0], ...rows].filter(row => !medievalBank.includes(row));
    return [...ancient.slice(0, bankSize - 20), ...medievalBank.slice(0, 20), ...customRowsForTopic(group)];
  }
  return [...drills[group], ...rows, ...reviewBank[group], ...(group === 4 ? additionalLogic : []), ...customRowsForTopic(group)];
});
function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function questionFrom(row, topic) {
  const [prompt, answer, ...distractors] = row;
  if (row.coreMedia) {
    const data = row.coreMedia;
    const correct = data.respuesta_correcta || {};
    const options = shuffle((data.opciones?.length ? data.opciones : [correct]).map(option => ({ ...option })));
    const correctIndex = options.findIndex(option => option.texto === correct.texto && option.imagen === correct.imagen);
    return [data.pregunta?.texto || prompt, options, Math.max(0, correctIndex), topic, data, correct.explicacion || ''];
  }
  const canonical = adaptLegacyQuestion(row, { tema: topic });
  const options = shuffle(canonical.opciones.map(option => option.texto));
  return [canonical.pregunta.texto, options, options.indexOf(canonical.respuesta_correcta.texto), topic];
}
function createCampaign() {
  return bank.map((rows, group) => {
    if (group === 4) {
      const core = [...drills[4].slice(0, 5), ...additionalLogic];
      const ethics = [...topics[4][3].slice(23, 29), ...topics[4][3].slice(35, 39)];
      const informal = rows.filter(row => row[0].includes('falacia') && !core.includes(row) && !row[0].includes('Si llueve'));
      const others = rows.filter(row => !core.includes(row) && !ethics.includes(row) && !informal.includes(row));
      const rest = shuffle([...ethics, ...shuffle(informal).slice(0, 8), ...shuffle(others).slice(0, bankSize - core.length - ethics.length - 8)]);
      const positions = new Map(core.map((row, i) => [Math.floor(i * levelCount * perTopic / core.length), row]));
      return Array.from({ length: bankSize }, (_, i) => positions.get(i) ?? rest.shift());
    }
    if (group !== 0) return shuffle(rows);
    const medieval = shuffle(rows.filter(row => medievalBank.includes(row)));
    const ancient = shuffle(rows.filter(row => !medievalBank.includes(row)));
    return ancient.slice(0, 20).flatMap((row, i) => [row, medieval[i]]).concat(ancient.slice(20));
  });
}
function levelQuestions(campaign, level, mode = 'axes') {
  const activeTopics = topicSet(mode);
  const perSector = questionsPerTopic(mode);
  return shuffle(campaign.flatMap((rows, group) => rows.slice(level * perSector, (level + 1) * perSector)
    .map(row => questionFrom(row, activeTopics[group][0]))));
}
const icons = { bomb: Bomb, retry: RotateCcw, reveal: CircleCheck, time: Timer };
const sector = 360 / topics.length;
const wheelFill = topics.map(([, , color], i) => color + ' ' + i * sector + 'deg ' + (i + 1) * sector + 'deg').join(', ');

const powers = { bomb: 'Bomba', retry: 'Doble chance', time: 'Tiempo extra', reveal: 'Respuesta correcta' };
const start = (campaign, level, questions, reserves = [], xp = 0, bonusBomb = 0, levelResults = [], mode = 'axes') => ({
  campaign, level, questions, reserves, xp, levelResults, mode,
  index: 0, phase: 'wheel', score: 0, solved: [], correctAnswers: [], angle: 0, crowns: [], crownRound: false,
  stock: { bomb: 1 + bonusBomb, retry: 1, time: 1, reveal: 3 }, hidden: [], wrong: null, used: null,
  extraSpin: true, secondChance: true, replacements: {}, lastTopic: null,
});

function progressInTopic(state, topic) {
  return state.correctAnswers.filter(index => state.questions[index][3] === topic).length;
}

function reducer(state, { type, now, choice, power, random, campaign, levelDeck, snapshot, onlyQuestion }) {
  if (type === 'restore') return snapshot;
  const activeTopics = topicSet(state?.mode);
  const activeLevelCount = specialMode(state?.mode) ? 1 : levelCount;
  const perSector = questionsPerTopic(state?.mode);
  const activeSector = 360 / activeTopics.length;
  if (type === 'queueCustom' && state.phase === 'wheel' && levelDeck) {
    const questions = [...(state.questions || []), levelDeck];
    const requested = activeTopics.find(([name]) => name === levelDeck[3]) || activeTopics[0];
    const topic = requested?.[0];
    const index = questions.length - 1;
    const target = (360 - (Math.max(0, activeTopics.findIndex(([name]) => name === topic) + .5) * activeSector)) % 360;
    return { ...state, questions, index, phase: 'spinning', angle: state.angle + 1080 + (target - state.angle % 360 + 360) % 360, lastTopic: topic, crownRound: false };
  }
  if (type === 'leaveQuestion' && state.phase === 'question' && state.pausedAt != null) {
    return { ...state, phase: 'wheel', pausedAt: null, deadline: undefined, crownRound: false, hidden: [], wrong: null, used: null, choice: null };
  }
  if (type === 'pause' && onlyQuestion && state.phase !== 'question') return state;
  if (type === 'pause') return state.pausedAt != null ? state : { ...state, pausedAt: now };
  if (type === 'resume') return state.pausedAt == null ? state : { ...state, pausedAt: null, deadline: state.deadline == null ? state.deadline : state.deadline + now - state.pausedAt };
  if (state.pausedAt != null) return state;
  if (type === 'start') return start(campaign, 0, levelDeck, [], 0, 0, [], state.mode);
  if (type === 'level' && state.phase === 'summary' && state.crowns.length === activeTopics.length && state.level + 1 < activeLevelCount) {
    return start(state.campaign, state.level + 1, levelDeck, state.reserves, state.xp, Number(state.score >= 18), state.levelResults, state.mode);
  }
  const questions = state.questions ?? [];
  const { phase, index, deadline, stock, used, hidden, wrong } = state;
  const reroll = type === 'reroll' && phase === 'topic' && state.extraSpin && !state.crownRound;
  if ((type === 'spin' && phase === 'wheel') || reroll) {
    const available = activeTopics.filter(([topic]) => questions.some((q, i) => q[3] === topic && !state.solved.includes(i)) && (!reroll || topic !== questions[index][3]));
    if (!available.length) return state;
    const noRepeat = !reroll && available.length > 1 ? available.filter(([name]) => name !== state.lastTopic) : available;
    const drawPool = noRepeat.length ? noRepeat : available;
    const topic = drawPool[Math.floor(random[0] * drawPool.length)][0];
    const next = questions.findIndex((q, i) => q[3] === topic && !state.solved.includes(i));
    const target = (360 - (activeTopics.findIndex(([name]) => name === topic) + .5) * activeSector) % 360;
    const angle = state.angle + 1080 + (target - state.angle % 360 + 360) % 360;
    return { ...state, phase: 'spinning', angle, index: next, lastTopic: topic, extraSpin: state.extraSpin && !reroll, crownRound: progressInTopic(state, topic) === perSector - 1 };
  }
  if (type === 'land' && phase === 'spinning') return { ...state, phase: 'topic' };
  if (type === 'begin' && phase === 'topic') return { ...state, phase: 'question', deadline: now + questionDuration(questions[index][3]) };
  const correct = (state.replacements?.[index] ?? questions[index])?.[2];
  if (type === 'secondChance' && phase === 'feedback' && state.result === 'incorrect' && state.secondChance && !state.crownRound && !state.reserves.includes(questions[index][3])) {
    const topic = questions[index][3];
    return {
      ...state, phase: 'question', deadline: now + questionDuration(questions[index][3]), secondChance: false,
      reserves: [...state.reserves, topic],
      replacements: { ...state.replacements, [index]: levelDeck },
      hidden: [], wrong: null, used: null, choice: null,
    };
  }
  if (type === 'next' && phase === 'feedback') {
    const name = questions[index][3];
    const reset = { hidden: [], wrong: null, used: null, choice: null };
    const next = questions.findIndex((q, i) => q[3] === name && !state.solved.includes(i));
    const crowns = progressInTopic(state, name) === perSector && !state.crowns.includes(name) ? [...state.crowns, name] : state.crowns;
    const solved = state.solved;
    const finished = crowns.length === activeTopics.length;
    if (state.result === 'correct' && next !== -1 && !finished) {
      return { ...state, ...reset, crowns, index: next, phase: 'question', crownRound: progressInTopic(state, name) === perSector - 1, deadline: now + questionDuration(questions[index][3]) };
    }
    return { ...state, ...reset, crowns, solved, levelResults: finished ? [...state.levelResults, { level: state.level + 1, score: state.score, crowns: [...crowns] }] : state.levelResults, xp: state.xp + (finished ? 50 : 0), phase: finished ? 'summary' : 'wheel', crownRound: false };
  }
  const result = (value, selected = null) => ({
    ...state, phase: 'feedback', result: value, choice: selected,
    score: state.score + Number(value === 'correct'),
    xp: state.xp + (value === 'correct' ? state.crownRound ? 25 : 10 : 0),
    solved: value === 'correct' ? [...state.solved, index] : state.solved,
    correctAnswers: value === 'correct' ? [...state.correctAnswers, index] : state.correctAnswers,
    remaining: Math.max(0, Math.ceil((deadline - now) / 1000)),
  });
  if (phase === 'offer') {
    if (type === 'skip') return result('timeout');
    if (type === 'power' && power === 'time' && stock.time) {
      return { ...state, phase: 'question', deadline: now + EXTRA_TIME_MS, used: 'time', stock: { ...stock, time: stock.time - 1 } };
    }
    return state;
  }
  if (phase !== 'question') return state;
  if (now >= deadline) return stock.time && !used ? { ...state, phase: 'offer' } : result('timeout');
  if (type === 'answer' && !hidden.includes(choice) && choice !== wrong) {
    if (choice === correct) return result('correct', choice);
    if (used === 'retry' && wrong === null) return { ...state, wrong: choice };
    return result('incorrect', choice);
  }
  if (type === 'power' && power !== 'time' && !used && stock[power]) {
    const updated = { ...state, used: power, stock: { ...stock, [power]: stock[power] - 1 } };
    if (power === 'reveal') return { ...result('correct', correct), ...{ used: power, stock: updated.stock } };
    if (power === 'bomb') updated.hidden = [0, 1, 2, 3].filter((option) => option !== correct).slice(0, 2);
    return updated;
  }
  return state;
}

function CrownProgress({ name, color, progress, earned, icon: Icon, parts }) {
  const clipId = useId();
  const label = `${name}: ${earned ? 'corona ganada' : `${progress} de ${parts} preguntas acertadas`}`;
  return <li className={`crown-piece ${earned ? 'complete' : ''}`} title={label} aria-label={label} style={{ '--topic-color': color }}>
    <svg viewBox="0 0 32 32" width="38" height="38" aria-hidden="true">
      <defs><clipPath id={clipId}><path d="M3 8 L10 13 L16 4 L22 13 L29 8 L26 25 L6 25 Z" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: parts }, (_, part) => <rect key={part} x={2 + part * 28 / parts} y="3" width={27 / parts} height="24" fill={part < progress ? earned ? '#f7c444' : color : '#e9e2ee'} />)}
      </g>
      <path d="M3 8 L10 13 L16 4 L22 13 L29 8 L26 25 L6 25 Z" fill="none" stroke={earned ? '#a46c05' : '#ad9db9'} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 29 H25" stroke={earned ? '#d59a13' : '#c9bdd3'} strokeWidth="3" strokeLinecap="round" />
    </svg>
    <span className="crown-topic-icon"><Icon size={17} aria-hidden="true" /></span>
  </li>;
}

function PowerArt({ power }) {
  const id = useId();
  const colors = { bomb: ['#ff8d86', '#e53359'], retry: ['#5cf2c6', '#0aa68c'], reveal: ['#d5a0ff', '#8b45db'], time: ['#ffe77a', '#f2a526'] };
  const [light, dark] = colors[power];
  return <svg className="power-art" viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id={id} x1="0" y1="0" x2=".8" y2="1"><stop stopColor={light} /><stop offset="1" stopColor={dark} /></linearGradient></defs>
    {power === 'bomb' ? <>
      <path d="M39 18 Q43 8 51 14" fill="none" stroke="#754674" strokeWidth="4" strokeLinecap="round" />
      <path d="M52 5 L54 11 L60 12 L55 16 L56 22 L50 18 L45 20 L46 14 L42 10 L49 10 Z" fill="#ffd44f" stroke="#d68c25" strokeWidth="1.4" />
      <rect x="30" y="15" width="14" height="10" rx="3" transform="rotate(25 37 20)" fill="#745078" stroke="#56305b" strokeWidth="2" />
      <circle cx="29" cy="38" r="21" fill={`url(#${id})`} stroke="#ab284c" strokeWidth="2.5" />
      <path d="M15 35 Q16 24 27 24" fill="none" stroke="#fff3e7" strokeWidth="5" strokeLinecap="round" opacity=".85" />
      <path d="M20 51 Q31 57 42 46" fill="none" stroke="#bd2d51" strokeWidth="3" strokeLinecap="round" />
    </> : power === 'retry' ? <>
      <path d="M17 16 A24 24 0 1 1 9 40 L20 36 A13 13 0 1 0 25 25 L29 31 L5 30 L10 7 Z" fill={`url(#${id})`} stroke="#08776d" strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M31 13 Q47 12 52 28" fill="none" stroke="#d6fff0" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M34 26 L34 39 M28 32 L40 32" stroke="#0a8a7c" strokeWidth="4" strokeLinecap="round" />
    </> : power === 'reveal' ? <>
      <path d="M32 5 L40 13 L51 12 L52 24 L60 32 L52 40 L51 52 L40 51 L32 59 L24 51 L13 52 L12 40 L4 32 L12 24 L13 12 L24 13 Z" fill={`url(#${id})`} stroke="#6f32ac" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="17" fill="#fff2ae" stroke="#e4ad34" strokeWidth="2" />
      <path d="M23 32 L29 38 L42 25" fill="none" stroke="#8141b6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16 L26 12" stroke="#f2dcff" strokeWidth="3" strokeLinecap="round" />
    </> : <>
      <rect x="24" y="3" width="16" height="8" rx="3" fill="#a76b22" /><path d="M32 11 V16" stroke="#a76b22" strokeWidth="5" />
      <path d="M48 18 L52 14" stroke="#ac7628" strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="37" r="23" fill={`url(#${id})`} stroke="#ba7c21" strokeWidth="2.5" />
      <circle cx="32" cy="37" r="16" fill="#fff9df" stroke="#e4ad3e" strokeWidth="2" />
      <path d="M32 25 V37 L41 32" fill="none" stroke="#9157bc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 32 Q18 22 25 20" fill="none" stroke="#fff8ce" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="37" r="3" fill="#9157bc" />
    </>}
  </svg>;
}

function FormalGuide({ prompt, onOpen, onClose }) {
  const [open, setOpen] = useState(false);
  const hint = formalHint(prompt);
  if (!hint) return null;
  const close = () => { setOpen(false); onClose?.(); };
  return <div className="logic-hint-control">
    <button className="logic-hint-button" aria-label="Abrir pista de lógica" title="Pista de lógica" onClick={() => { onOpen?.(); setOpen(true); }}><Lightbulb size={23} fill="#ffe56d" aria-hidden="true" /><span>Pista</span></button>
    {open && <ResultDialog title="Chuleta de lógica" icon={Lightbulb} tone="hint" onCancel={close}>
      <div className="result-content logic-cheatsheet">
        <h3>Recuerda las palabras</h3>
        {hint.memory && <p className="hint-memory">{hint.memory}</p>}
        {hint.kind === 'rule' && !hint.memory && <div className="hint-memory-grid">{quickMemories.map(row => <div key={row.word}><b>{row.word}</b><span>{row.meaning}</span></div>)}</div>}
        {hint.kind !== 'rule' && <p className="hint-memory">Premisas = punto de partida.<br />Conclusión = lo que debes justificar.</p>}
        <p className="hint-cue">{hint.cue}</p>
        <div className="hint-symbols">{hint.categorical ? <><span>S y P = grupos</span><span>M = término medio</span><span>A = universal afirmativa</span><span>E = universal negativa</span><span>∴ por tanto</span></> : <><span>¬ no</span><span>∧ y</span><span>∨ o</span><span>→ si… entonces…</span><span>∴ por tanto</span><span>↔ si y solo si</span><span>( ) agrupa</span><span>P, Q, R, S = afirmaciones</span></>}</div>
      </div>
      <div className="result-actions"><button className="primary" onClick={close}>Volver a la pregunta</button></div>
    </ResultDialog>}
  </div>;
}
function OptionContent({ prompt, option }) {
  if (option && typeof option === 'object') return <span className="option-content">{option.imagen && <img className="option-image" src={option.imagen} alt="" />}{option.texto && <span>{option.texto}</span>}{option.audio && <audio controls src={option.audio} />}</span>;
  return <span className="option-content">{readableOption(prompt, option)}</span>;
}

function SoundButton() {
  const [enabled, setEnabled] = useState(soundEnabled);
  const Icon = enabled ? Volume2 : VolumeX;
  return <button className="sound-toggle" aria-label={enabled ? 'Silenciar sonidos' : 'Activar sonidos'} aria-pressed={enabled}
    onClick={() => setEnabled(toggleSound())}><Icon size={20} /><span>{enabled ? 'Sonido' : 'Silencio'}</span></button>;
}

function ResultDialog({ children, title, icon: Icon = Lightbulb, tone = '', onCancel }) {
  const dialog = useRef(null);
  const heading = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    heading.current.focus();
    return () => { node.close(); };
  }, []);
  return <dialog ref={dialog} className={`result-dialog ${tone}`} aria-labelledby="result-title" onCancel={event => { event.preventDefault(); onCancel?.(); }}>
    <div className="result-heading"><span className="result-icon"><Icon size={28} /></span><h2 id="result-title" ref={heading} tabIndex={-1}>{title}</h2></div>
    {children}
  </dialog>;
}

function Explanation({ prompt, answer, choice, collapsed = false, customExplanation = '' }) {
  const guide = formalGuide(prompt);
  const lesson = lessonFor(prompt);
  const why = customExplanation || lesson?.text || explanations.get(prompt) || philosopherExplanation(prompt);
  const wrongNote = hasContextualOptions(prompt) || guide || typeof choice === 'object' ? undefined : optionNotes[choice];
  const [expanded, setExpanded] = useState(!collapsed);
  return <div className="lesson">
    {choice && choice !== answer && <div className="your-answer"><p className="answer-label"><XCircle size={18} aria-hidden="true" /> Tu respuesta · Incorrecta</p><p><strong><OptionContent prompt={prompt} option={choice} /></strong></p>{wrongNote && <p>{wrongNote}</p>}</div>}
    <p className="right-answer">Respuesta correcta<br /><strong><OptionContent prompt={prompt} option={answer} /></strong></p>
    <button className="why-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><Lightbulb size={18} aria-hidden="true" /> {expanded ? 'Ocultar explicación' : '¿Por qué?'}</button>
    {expanded && <div className="why-content">{why && <p>{why}</p>}{lesson?.example && <div className="lesson-example"><h3>Un ejemplo para entenderlo</h3><p>{lesson.example}</p></div>}</div>}
  </div>;
}

function Study({ onExit, onMode }) {
  const [group, setGroup] = useState(null);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState([]);
  const [prompt, options, correct, , questionMeta] = rows[index] ?? [];
  const answer = options?.[correct];
  function selectGroup(next) {
    setGroup(next);
    setRows(next === null ? [] : bank[next].map(row => questionFrom(row, topics[next][0])));
    setIndex(0);
    setChoice(null);
    setScore(0);
  }
  return (
    <main className="game has-mode-bar">
      <header><div><span>APRENDE JUGANDO</span><div className="subject-title"><strong>Filosofía</strong>{group !== null && <span className="header-topic" title={topics[group][0]}>{topics[group][1]}</span>}</div></div><SoundButton /></header>
      <section className="panel">
        <button className="secondary study-back" onClick={group === null ? onExit : () => selectGroup(null)}>{group === null ? 'Volver al inicio' : 'Elegir otro tema'}</button>
        <h1>{group === null ? 'Estudiar por tema' : topics[group][0]}</h1>
        {group === null ? (
          <div className="answers">
            {topics.map(([name, , color], i) => {
              const Icon = sectorIcons[i];
              return <button className="answer study-topic" style={{ '--topic-color': color }} key={name} onClick={() => selectGroup(i)}>
                <span className="study-topic-icon" aria-hidden="true"><Icon size={24} /></span><span>{name}</span><small>{bank[i].length}</small>
              </button>;
            })}
          </div>
        ) : index === rows.length ? (
          <div className="feedback">
            <p>Repaso completo · {score} de {rows.length} aciertos.</p>
            <button className="primary" onClick={() => selectGroup(group)}>Repasar de nuevo</button>
          </div>
        ) : (
          <>
            <p className="category">Pregunta {index + 1} de {rows.length} · Sin cronómetro</p>
            {questionMeta?.pregunta?.imagen && <img className="question-image" src={questionMeta.pregunta.imagen} alt="" />}
            {questionMeta?.pregunta?.audio && <audio className="question-audio" controls src={questionMeta.pregunta.audio} />}
            <h2>{readablePrompt(prompt)}</h2>
            <FormalGuide prompt={prompt} />
            <div className="answers">
              {options.map((option, i) => <button key={option} className={`answer ${choice === null ? '' : i === correct ? 'correct' : choice === i ? 'incorrect' : ''}`}
                disabled={choice !== null} onClick={() => { unlockSound(); playSound(i === correct ? 'correct' : 'incorrect'); setChoice(i); if (i === correct) setScore(score + 1); }}><span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><OptionContent prompt={prompt} option={option} /></button>)}
            </div>
            {choice !== null && <ResultDialog title={choice === correct ? '¡Muy bien!' : 'Aprendamos de esta respuesta'} icon={choice === correct ? CircleCheck : XCircle} tone={choice === correct ? 'success' : 'error'}>
              <div className="result-content"><p className="question-recap">{readablePrompt(prompt)}</p><Explanation prompt={prompt} answer={answer} choice={options[choice]} /></div>
              <div className="result-actions"><button className="primary" onClick={() => { playSound('click'); setChoice(null); setIndex(index + 1); }}>{index + 1 === rows.length ? 'Ver resultado' : 'Siguiente pregunta'}</button></div>
            </ResultDialog>}
          </>
        )}
      </section>
      <ModeBar onInitial={() => onMode('initial')} onAxes={() => onMode('axes')} onAuthor={() => onMode('philosophers')} onPhilosopher={() => onMode('philosopher-roulette')} />
    </main>
  );
}

function PhilosopherPicker({ onChoose, onMode }) {
  return <main className="game has-mode-bar">
    <header><div><span>APRENDE JUGANDO</span><div className="subject-title"><strong>Filósofos</strong></div></div><SoundButton /></header>
    <section className="panel philosopher-picker">
      <h1>Elige un filósofo</h1>
      <p className="picker-intro">Entra a la ruleta de un autor o deja que la ruleta general elija el filósofo.</p>
      <div className="answers philosopher-list">
        {philosophers.map((philosopher, i) => {
          const Icon = philosopher.icon || sectorIcons[i % sectorIcons.length];
          const playable = Boolean(philosopher.topics?.length) || registeredQuestions(philosopher.key).length > 0;
          return <button className="answer study-topic philosopher-card" key={philosopher.key} disabled={!playable}
            style={{ '--topic-color': '#793db2' }}
            onClick={() => onChoose(`author:${philosopher.key}`)}>
            <span className="study-topic-icon" aria-hidden="true"><Icon size={24} /></span>
            <span className="philosopher-copy"><strong>{philosopher.name}</strong><small>{philosopher.note}</small></span>
            <small className={`availability ${playable ? 'ready' : ''}`}>{playable ? 'Jugar' : 'Sin preguntas'}</small>
          </button>;
        })}
      </div>
    </section>
    <ModeBar onInitial={() => onMode('initial')} onAxes={() => onMode('axes')} onAuthor={() => onMode('philosophers')} onPhilosopher={() => onMode('philosopher-roulette')} />
  </main>;
}

function App() {
  const emblemTaps = useRef({ count: 0, timer: null });
  function tapEmblem() {
    const taps = emblemTaps.current;
    taps.count += 1;
    window.clearTimeout(taps.timer);
    if (taps.count >= 5) { taps.count = 0; window.location.hash = ADMIN_ROUTE; }
    else taps.timer = window.setTimeout(() => { taps.count = 0; }, 1400);
  }
  const [studying, setStudying] = useState(false);
  const [showPhilosophers, setShowPhilosophers] = useState(false);
  const [requestedMode, setRequestedMode] = useState('axes');
  const [loaded] = useState(loadLibrary);
  const [library, setLibrary] = useState(loaded.library);
  const libraryRef = useRef(loaded.library);
  const [activeId, setActiveId] = useState(loaded.library.activeId);
  const [saveError, setSaveError] = useState(loaded.error);
  const [campaignModal, setCampaignModal] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [home, setHome] = useState(Boolean(loaded.library.activeId));
  const [confirmExit, setConfirmExit] = useState(false);
  const [state, dispatch] = useReducer(reducer, null, () => {
    const entry = loaded.library.campaigns.find(c => c.id === loaded.library.activeId);
    return entry ? restoreGame(entry.snapshot, Date.now()) : { phase: 'intro', index: 0, score: 0 };
  });
  const [now, setNow] = useState(Date.now);
  const send = (type, details) => {
    unlockSound();
    if (type === 'power' || type === 'secondChance') playSound('power');
    else playSound('click');
    const timestamp = Date.now();
    setNow(timestamp);
    if (type === 'spin') {
      try {
        const custom = JSON.parse(localStorage.getItem('pregunta_siguiente_ruleta') || 'null');
        if (custom) {
          localStorage.removeItem('pregunta_siguiente_ruleta');
          const correct = custom.respuesta_correcta || {};
          const choices = custom.opciones?.length ? custom.opciones : [correct];
          const row = [custom.pregunta?.texto || 'Selecciona la respuesta correcta', correct.texto || '', ...choices.filter(o => !(o.texto === correct.texto && o.imagen === correct.imagen)).map(o => o.texto || '')];
          row.coreMedia = custom;
          dispatch({ type: 'queueCustom', now: timestamp, levelDeck: questionFrom(row, custom.tema || topics[0][0]) });
          return;
        }
      } catch { localStorage.removeItem('pregunta_siguiente_ruleta'); }
    }
    dispatch({ type, now: timestamp, ...details });
  };
  function commitLibrary(next) {
    libraryRef.current = next;
    setLibrary(next);
    setSaveError(saveLibrary(next));
  }
  useEffect(() => {
    if (!activeId || !state.campaign) return;
    const save = () => commitLibrary(updateCampaign(libraryRef.current, activeId, state, Date.now()));
    save();
    const onVisibility = () => { if (document.visibilityState === 'hidden') save(); };
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [state, activeId]);
  function showCreate(source = null, mode = requestedMode) {
    setSelectedCampaign(source);
    setRequestedMode(mode);
    const requestedAuthor = mode.startsWith('author:') ? philosopherByKey[mode.slice(7)]?.name : null;
    setCampaignName(source ? `${source.name} · Repetición`.slice(0, 64) : mode === 'philosopher-roulette' ? 'Ruleta de filósofos' : requestedAuthor ? `Ruleta · ${requestedAuthor}` : `Campaña ${libraryRef.current.campaigns.length + 1}`);
    setCampaignModal('create');
  }
  function createSavedCampaign() {
    if (!campaignName.trim()) return;
    const mode = selectedCampaign?.snapshot.mode ?? requestedMode;
    const campaign = selectedCampaign ? selectedCampaign.snapshot.campaign : specialMode(mode) ? topicSet(mode).map(([, , , rows]) => shuffle(rows)) : createCampaign();
    const nextState = start(campaign, 0, levelQuestions(campaign, 0, mode), [], 0, 0, [], mode);
    const next = addCampaign(libraryRef.current, campaignName, nextState, Date.now());
    commitLibrary(next);
    setActiveId(next.activeId);
    send('restore', { snapshot: nextState });
    setHome(false); setCampaignModal(null);
  }
  function openSavedCampaign(entry) {
    const restored = restoreGame(entry.snapshot, Date.now());
    setActiveId(entry.id);
    commitLibrary({ ...libraryRef.current, activeId: entry.id });
    send('restore', { snapshot: restored });
    send('resume');
    setHome(false); setCampaignModal(null);
  }
  function deleteSavedCampaign() {
    const id = selectedCampaign.id;
    commitLibrary(removeCampaign(libraryRef.current, id));
    if (id === activeId) {
      setActiveId(null);
      send('restore', { snapshot: { phase: 'intro', index: 0, score: 0 } });
      setHome(true);
    }
    setCampaignModal('list'); setSelectedCampaign(null);
  }
  const { phase, deadline, index, score, stock, hidden, wrong, used, result, choice } = state;
  useEffect(() => {
    if (phase !== 'question' || state.pausedAt != null) return;
    const timer = setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      if (timestamp >= deadline) dispatch({ type: 'expire', now: timestamp });
    }, 100);
    return () => clearInterval(timer);
  }, [phase, deadline, state.pausedAt]);

  useEffect(() => {
    if (phase !== 'spinning' || state.pausedAt != null) return;
    const spin = setTimeout(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      dispatch({ type: 'land', now: timestamp });
    }, 1250);
    return () => clearTimeout(spin);
  }, [phase, state.pausedAt]);

  const questions = state.questions ?? [];
  const activeTopics = topicSet(state.mode);
  const activeLevelCount = specialMode(state.mode) ? 1 : levelCount;
  const perSector = questionsPerTopic(state.mode);
  const activeSector = 360 / activeTopics.length;
  const selectedWheel = state.mode?.startsWith('author:') ? state.mode.slice(7) : state.mode === 'sartre' ? 'sartre' : 'ejes';
  const activeWheel = wheels[selectedWheel] || wheels.ejes;
  const activeTheme = themes[activeWheel.skin] || themes['skin-ejes'];
  const activeWheelFill = activeTopics.map(([, , color], i) => (activeWheel.colores?.[i % activeWheel.colores.length] || color) + ' ' + i * activeSector + 'deg ' + (i + 1) * activeSector + 'deg').join(', ');
  const wheelIconsUsed = new Set();
  const wheelDiameter = Math.min(window.innerWidth * .86, 320);
  const [prompt, options, correct, topic, questionMeta, customExplanation] = state.replacements?.[index] ?? questions[index] ?? [];
  const topicIndex = activeTopics.findIndex(([name]) => name === topic);
  const TopicIcon = sectorIcons[topicIndex];
  const seconds = phase === 'question' ? Math.max(0, Math.ceil((deadline - now) / 1000)) : phase === 'offer' ? 0 : state.remaining;
  useEffect(() => {
    if (phase === 'feedback') playSound(result);
    else if (phase === 'offer') playSound('timeout');
    else if (['spinning', 'topic', 'summary'].includes(phase)) playSound(phase);
  }, [phase, result]);
  useEffect(() => {
    if (state.pausedAt == null && phase === 'question' && seconds > 0 && seconds <= 5) playSound('tick');
  }, [phase, seconds, state.pausedAt]);
  const landing = home || phase === 'intro';
  const openMode = mode => {
    if (state.campaign && !home) send('pause');
    setStudying(false);
    setShowPhilosophers(false);
    if (mode === 'axes') { setHome(true); setStudying(true); return; }
    if (mode === 'philosophers') { setHome(true); setShowPhilosophers(true); return; }
    setHome(true);
    showCreate(null, mode);
  };
  if (studying) return <Study onExit={() => { setStudying(false); setHome(true); }} onMode={openMode} />;
  if (showPhilosophers) return <PhilosopherPicker onChoose={openMode} onMode={openMode} />;
  return (
    <main className={`game has-mode-bar ${activeWheel.skin}`} style={{ '--skin-background': activeTheme.fondo, '--skin-primary': activeTheme.primario, '--skin-foreground': activeTheme.texto, '--skin-wheel': activeTheme.colorRueda }}>
      <header><div className="header-brand">{!landing && phase === 'wheel' && <button className="home-button" onClick={() => { send('pause'); setHome(true); }}><ArrowLeft size={20} /><span>Inicio</span></button>}{!landing && phase === 'question' && <button className="home-button" onClick={() => { send('pause'); setConfirmExit(true); }}><ArrowLeft size={20} /><span>Atrás</span></button>}<div><span>APRENDE JUGANDO</span><div className="subject-title"><strong>Filosofía</strong>{!landing && ['topic', 'question', 'offer', 'feedback'].includes(phase) && topicIndex >= 0 && <span className="header-topic" title={topic}>{activeTopics[topicIndex][1]}</span>}</div></div></div><SoundButton /></header>
      {saveError && <div className="save-warning" role="alert">{saveError}<button className="secondary" onClick={() => commitLibrary(libraryRef.current)}>Reintentar guardado</button></div>}
      {campaignModal === 'list' && <ResultDialog key="campaign-list" title="Mis campañas" icon={Layers} onCancel={() => setCampaignModal(null)}>
        <div className="result-content campaign-list">
          <p className="local-save-note">Se guardan en este navegador. Si borras sus datos, se perderán las campañas.</p>
          {library.campaigns.length === 0 && <p>Aún no tienes campañas guardadas.</p>}
          {[...library.campaigns].sort((a, b) => b.updatedAt - a.updatedAt).map(entry => {
            const saved = entry.snapshot;
            const completed = saved.levelResults.length;
            return <article className="campaign-card" key={entry.id}>
              <h3>{entry.name}</h3>
              <p>{completed === levelCount ? 'Completada' : `Nivel ${saved.level + 1} de ${levelCount}`} · {saved.xp} XP</p>
              <p className="campaign-progress">{completed} niveles completados · {saved.correctAnswers.length}/{saved.questions.length} acertadas del nivel actual</p>
              {completed > 0 && <details><summary>Resultados por nivel</summary><ul>{saved.levelResults.map(row => <li key={row.level}>Nivel {row.level}: {row.score}/{saved.questions.length} aciertos · {row.crowns.length}/{saved.campaign.length} coronas</li>)}</ul></details>}
              <div className="campaign-card-actions"><button className="primary" onClick={() => openSavedCampaign(entry)}>{completed === levelCount ? 'Ver resultado' : 'Continuar'}</button><button className="secondary" onClick={() => showCreate(entry)}>Repetir</button><button className="secondary" onClick={() => { setSelectedCampaign(entry); setCampaignModal('delete'); }}>Eliminar</button></div>
            </article>;
          })}
        </div>
        <div className="result-actions"><button className="primary" onClick={() => showCreate()}>Nueva campaña</button><button className="secondary" onClick={() => setCampaignModal(null)}>Volver</button></div>
      </ResultDialog>}
      {campaignModal === 'create' && <ResultDialog key="campaign-create" title={selectedCampaign ? 'Repetir campaña' : 'Nueva campaña'} icon={Layers} onCancel={() => setCampaignModal('list')}>
        <form className="campaign-form" onSubmit={event => { event.preventDefault(); createSavedCampaign(); }}>
          <div className="result-content"><label htmlFor="campaign-name">Nombre de la campaña</label><input id="campaign-name" maxLength={64} required value={campaignName} onChange={event => setCampaignName(event.target.value)} />
          <p>{selectedCampaign ? 'Empezarás con las mismas preguntas y los resultados en cero. La campaña anterior se conserva.' : 'Crearás una partida independiente. Tus otras campañas se conservan.'}</p></div>
          <div className="result-actions"><button className="primary" type="submit" disabled={!campaignName.trim()}>Empezar campaña</button><button className="secondary" type="button" onClick={() => setCampaignModal('list')}>Cancelar</button></div>
        </form>
      </ResultDialog>}
      {campaignModal === 'delete' && selectedCampaign && <ResultDialog key="campaign-delete" title="¿Eliminar esta campaña?" icon={XCircle} tone="error" onCancel={() => setCampaignModal('list')}>
        <div className="result-content"><p>Se borrarán «{selectedCampaign.name}» y sus resultados de este dispositivo. Las demás campañas se conservarán.</p></div>
        <div className="result-actions"><button className="primary" onClick={() => setCampaignModal('list')}>Conservar campaña</button><button className="secondary" onClick={deleteSavedCampaign}>Eliminar campaña</button></div>
      </ResultDialog>}
      {confirmExit && <ResultDialog title="¿Salir del cuestionario?" icon={ArrowLeft} onCancel={() => { send('resume'); setConfirmExit(false); }}>
        <div className="result-content"><p>Esta pregunta quedará pendiente: no sumará puntos ni avanzará la corona.</p><p>Conservarás tus puntos y coronas anteriores. Los comodines que ya hayas usado seguirán gastados.</p><p>Volverás al menú para elegir entre jugar y estudiar.</p></div>
        <div className="result-actions"><button className="primary" onClick={() => { send('resume'); setConfirmExit(false); }}>Seguir respondiendo</button><button className="secondary" onClick={() => { send('leaveQuestion'); setConfirmExit(false); setHome(true); }}>Salir al menú</button></div>
      </ResultDialog>}
      {landing || phase === 'summary' ? (
        <section className="panel intro">
          <span className={`badge ${landing ? 'intro-emblem' : ''}`} aria-hidden="true">{!landing ? <Trophy /> : <img className="app-emblem" src="philosophy-icon.png" alt="" onClick={tapEmblem} />}</span>
          <h1>{landing ? 'Pon a prueba tu filosofía' : specialMode(state.mode) ? `¡Completaste ${state.mode === 'philosopher-roulette' ? 'la ruleta de filósofos' : `la ruleta de ${philosopherByKey[state.mode?.slice(7)]?.name ?? 'Sartre'}`}!` : state.level + 1 === levelCount ? '¡Completaste los diez niveles!' : '¡Nivel completado!'}</h1>
          <p>{landing ? 'Gira la ruleta, piensa cada respuesta y gana coronas por tema.' : `${state.level + 1}/${activeLevelCount} copas · ${score}/${questions.length} aciertos · ${state.xp} XP`}</p>
          {!landing && <p>+50 XP por completar el nivel{score >= 18 && state.level + 1 < activeLevelCount ? ' · Bomba adicional para el siguiente nivel' : ''}</p>}
          <button className="primary" onClick={() => {
            if (home && phase !== 'intro') {
              send('resume'); setHome(false); return;
            }
            setHome(false);
            if (!landing && state.level + 1 < activeLevelCount) {
              send('level', { levelDeck: levelQuestions(state.campaign, state.level + 1, state.mode) });
            } else {
              showCreate();
            }
          }}>{landing ? home && phase !== 'intro' ? 'Retomar partida' : 'Jugar' : state.level + 1 < activeLevelCount ? 'Siguiente nivel' : 'Nueva campaña'}</button>
          <button className="secondary campaigns-button" onClick={() => setCampaignModal('list')}>Mis campañas{library.campaigns.length ? ` · ${library.campaigns.length}` : ''}</button>
          {library.campaigns.length > 0 && !saveError && <p className="local-save-note">Guardado automático en este dispositivo</p>}
        </section>
      ) : phase === 'topic' ? (
        <section className="panel intro">
          <span className="badge" style={{ backgroundColor: activeTopics[topicIndex][2] }} aria-hidden="true"><TopicIcon size={34} /></span>
          <p>{state.crownRound ? 'Vas a responder por una corona' : 'Te tocó esta categoría'}</p>
          <h1>{topic}</h1>
          <p className="topic-help">Responde, descubre el porqué y completa el tema.</p>
          <div className="power-preview" aria-label="Tus ayuditas disponibles">{Object.keys(icons).map((power) => <div key={power} className={`power-${power}`}><span className="power-icon"><PowerArt power={power} /></span><b>{stock[power]}</b><small>{powers[power]}</small></div>)}</div>
          <button className="primary" onClick={() => send('begin')}>Jugar</button>
          {state.extraSpin && !state.crownRound && state.crowns.length < activeTopics.length - 1 &&
            <div className="extra-spin">
              <button className="primary" aria-describedby="extra-spin-help" onClick={() => send('reroll', { random: [Math.random()] })}>Giro extra · 1 disponible</button>
              <p id="extra-spin-help">Vuelve a girar para cambiar de tema antes de responder.</p>
            </div>}
        </section>
      ) : phase === 'wheel' || phase === 'spinning' ? (
        <section className="panel wheel-panel" aria-label="Ruleta de filosofía">
          <h1>{state.mode === 'philosopher-roulette' ? 'Ruleta de filósofos' : state.mode?.startsWith('author:') ? `Ruleta · ${philosopherByKey[state.mode.slice(7)]?.name ?? 'Filósofo'}` : state.mode === 'sartre' ? 'Ruleta · Jean-Paul Sartre' : 'Ruleta de filosofía'}</h1>
          <div className="wheel-stats"><span>Nivel {state.level + 1}/{activeLevelCount}</span><span>{state.xp} XP</span></div>
          <ul className="crown-progress" aria-label="Progreso de coronas por tema">
            {activeTopics.map(([name, , color], i) => <CrownProgress key={name} name={name} color={color}
              progress={progressInTopic(state, name)} parts={questionsPerTopic(state.mode)} earned={state.crowns.includes(name)} icon={sectorIcons[i % sectorIcons.length]} />)}
          </ul>
          <div className="wheel-frame">
            <div className="wheel" aria-hidden="true" style={{ background: 'conic-gradient(' + activeWheelFill + ')', transform: 'rotate(' + state.angle + 'deg)' }}>
              {activeTopics.map(([name, short], i) => {
                const author = state.mode === 'philosopher-roulette' ? philosophers.find(item => item.name === name) : null;
                const Icon = author
                  ? getPhilosopherWheelIcon(author.key, wheelIconsUsed)
                  : getWheelSectorIcon(name, i, wheelIconsUsed);
                const labelAngle = ((i + .5) * activeSector - 90) * Math.PI / 180;
                const labelRadius = 0.32 * wheelDiameter;
                const labelX = Math.cos(labelAngle) * labelRadius;
                const labelY = Math.sin(labelAngle) * labelRadius;
                return <span key={name} className="wheel-sector-label" aria-label={name} title={name} style={{ left: `calc(50% + ${labelX}px)`, top: `calc(50% + ${labelY}px)`, '--counter-angle': `${-state.angle}deg` }}>
                  <span className="wheel-sector-icon"><Icon /></span>
                  <small>{short || name}</small>
                </span>;
              })}
            </div>
          </div>
          <button className="primary" disabled={phase === 'spinning'} onClick={() => send('spin', { random: [Math.random()] })}>{phase === 'spinning' ? 'Girando…' : 'Girar ruleta'}</button>
        </section>
      ) : (
        <section className={`panel question-panel ${phase !== 'question' ? 'answered' : ''}`} aria-label="Pregunta">
          <div className="meta"><span>{state.correctAnswers.length}/{questions.length} acertadas</span><span>{state.xp} XP</span></div>
          <div className={`timer ${seconds <= 5 ? 'urgent' : ''}`} aria-label={`${seconds} segundos`}>
            {`${seconds} s`}
          </div>
          <p className="category">{topic} · {state.crownRound ? 'Pregunta por la corona' : `${progressInTopic(state, topic)}/${perSector} acertadas para la corona`}</p>
          {questionMeta?.pregunta?.imagen && <img className="question-image" src={questionMeta.pregunta.imagen} alt="" />}
          {questionMeta?.pregunta?.audio && <audio className="question-audio" controls src={questionMeta.pregunta.audio} />}
          <h1>{readablePrompt(prompt)}</h1>
          {phase === 'question' && <FormalGuide prompt={prompt} onOpen={() => send('pause', { onlyQuestion: true })} onClose={() => send('resume')} />}
          <div className="answers">
            {options.map((label, option) => {
              const status = phase === 'feedback' && option === correct ? 'correct'
                : option === wrong || (phase === 'feedback' && option === choice) ? 'incorrect' : '';
              return <button key={label} className={`answer ${status}`} hidden={hidden.includes(option)}
                disabled={phase !== 'question' || option === wrong}
                onClick={() => send('answer', { choice: option })}><span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + option)}</span><OptionContent prompt={prompt} option={label} /></button>;
            })}
          </div>
          <div className="powers" aria-label="Comodines">
            {Object.keys(icons).map((power) => (
              <button key={power} className={`power power-${power}`} aria-label={`${powers[power]}: ${stock[power]} disponibles`} title={powers[power]} disabled={power === 'time' ? phase !== 'offer' : phase !== 'question' || Boolean(used) || !stock[power]}
                onClick={() => send('power', { power })}><span className="power-icon"><PowerArt power={power} /></span><b aria-hidden="true">{stock[power]}</b></button>
            ))}
          </div>
          {phase === 'question' && wrong !== null && <p role="status">Doble chance. Elige otra opción.</p>}
          {phase === 'offer' && <ResultDialog key="offer" title="¡Se acabó el tiempo!" icon={Clock3} tone="review">
            <div className="result-content"><p className="time-recap">0 s · Tiempo agotado</p><p>¿Usar tiempo extra para seguir intentando?</p></div>
            <div className="result-actions"><button className="primary" onClick={() => send('power', { power: 'time' })}>Usar tiempo extra · +30 s</button>
            <button className="secondary" onClick={() => send('skip')}>Ver respuesta y explicación</button></div>
          </ResultDialog>}
          {phase === 'feedback' && <ResultDialog key="feedback" title={result === 'correct' ? '¡Respuesta correcta!' : result === 'incorrect' ? 'Respuesta incorrecta · ¡sigamos aprendiendo!' : 'Tiempo agotado · Sin respuesta'} icon={result === 'correct' ? CircleCheck : result === 'timeout' ? Clock3 : XCircle} tone={result === 'correct' ? 'success' : result === 'incorrect' ? 'error' : 'review'}>
            <div className="result-content">
              <p className="time-recap">{seconds} s restantes</p>
              <p className="question-recap">{readablePrompt(prompt)}</p>
              <Explanation prompt={prompt} answer={options[correct]} choice={choice === null ? null : options[choice]} collapsed={result === 'correct'} customExplanation={customExplanation} />
              {result === 'correct' && <p className="outcome">+{state.crownRound ? 25 : 10} XP</p>}
              {state.crownRound && result === 'correct' && <div className="crown-reward"><Crown size={32} aria-hidden="true" /><strong>¡Ganaste la corona de {topic}!</strong></div>}
            </div>
            <div className="result-actions">
              <button className="primary" onClick={() => send('next')}>{result === 'correct' && state.correctAnswers.length === questions.length ? 'Ver resultado' : result === 'correct' && !state.crownRound && questions.some((q, i) => q[3] === topic && !state.solved.includes(i)) ? progressInTopic(state, topic) === perSector - 1 ? 'Responder por la corona' : 'Siguiente pregunta' : 'Volver a la ruleta'}</button>
              {result === 'incorrect' && !specialMode(state.mode) && state.secondChance && !state.crownRound && !state.reserves.includes(topic) &&
                <button className="secondary" onClick={() => send('secondChance', { levelDeck: questionFrom(state.campaign[topics.findIndex(([name]) => name === topic)][levelCount * perTopic], topic) })}>Segunda oportunidad · Otra pregunta</button>}
            </div>
          </ResultDialog>}
        </section>
      )}
      <ModeBar onInitial={() => openMode('initial')} onAxes={() => openMode('axes')} onAuthor={() => openMode('philosophers')} onPhilosopher={() => openMode('philosopher-roulette')} />
    </main>
  );
}

function RootApp() {
  const [admin, setAdmin] = useState(window.location.hash === ADMIN_ROUTE);
  useEffect(() => {
    const syncRoute = () => setAdmin(window.location.hash === ADMIN_ROUTE);
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);
  return admin ? <Suspense fallback={<main className="admin-shell">Cargando…</main>}><AdminEditor /></Suspense> : <App />;
}

createRoot(document.getElementById('root')).render(<RootApp />);
