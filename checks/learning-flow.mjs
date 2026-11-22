import { additionalLogic } from '../logic-expansion.js';
import { questionDuration, EXTRA_TIME_MS } from '../timing.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { topics } from '../questions.js';
import { drills } from '../study.js';
import { reviewBank } from '../review-bank.js';
import { explanations } from '../explanations.js';

// Exercise the production reducer without requiring a DOM or changing its exports.
const source = fs.readFileSync(new URL('../src.jsx', import.meta.url), 'utf8');
const domain = source.slice(source.indexOf('const levelCount'), source.indexOf('function CrownProgress'));
const context = vm.createContext({ additionalLogic, questionDuration, EXTRA_TIME_MS, topics, drills, reviewBank, Landmark: null, Lightbulb: null, Layers: null, Globe: null, Scale: null, Eye: null, Bomb: null, RotateCcw: null, CircleCheck: null, Timer: null });
vm.runInContext(domain + '\nglobalThis.api = {reducer, createCampaign, levelQuestions, questionFrom, bank, progressInTopic};', context);
const { reducer, createCampaign, levelQuestions, bank, progressInTopic } = context.api;
assert.equal(bank.length, 6);
assert.ok(bank.every(rows => rows.length >= 41));
for (const rows of bank) for (const [prompt] of rows) {
  assert.ok(explanations.get(prompt)?.length > 60, `Missing explanation: ${prompt}`);
}
const campaign = createCampaign();
assert.equal(campaign[4].length, 41);
for (const row of [...drills[4].slice(0, 5), ...additionalLogic]) assert.ok(campaign[4].slice(0, 40).includes(row), row[0]);
for (let level = 0; level < 10; level++) assert.equal(levelQuestions(campaign, level).filter(q => q[3] === topics[4][0]).length, 4);
const deck = levelQuestions(campaign, 0);
let state = reducer({}, { type: 'start', campaign, levelDeck: deck });
const event = (type, extra = {}, now = 1000) => { state = reducer(state, { type, now, ...extra }); };
const begin = () => { event('spin', {random: [.7]}); event('land'); event('begin'); };
begin();
const first = state.index;
const expiredAt = state.deadline;
event('expire', {}, expiredAt);
assert.equal(state.phase, 'offer');
assert.equal(state.solved.length, 0);
event('power', {power: 'time'}, expiredAt + 1000);
assert.equal(state.deadline, expiredAt + 1000 + 30000);
assert.equal(state.stock.time, 0);
event('expire', {}, state.deadline);
assert.equal(state.phase, 'feedback');
assert.equal(state.result, 'timeout');
assert.equal(state.remaining, 0);
assert.equal(state.xp, 0);
event('next');
assert.equal(state.phase, 'wheel');
assert.ok(!state.solved.includes(first));
begin();
const correct = state.questions[state.index][2];
event('answer', {choice: correct}, 5000);
assert.equal(state.result, 'correct');
assert.equal(state.xp, 10);
assert.equal(state.remaining, questionDuration(state.questions[state.index][3]) / 1000 - 4);
const frozen = state.remaining;
event('expire', {}, 100000);
assert.equal(state.remaining, frozen);
event('next');
event('power', {power: 'retry'});
const answer = state.questions[state.index][2];
const bad = (answer + 1) % 4;
event('answer', {choice: bad});
assert.equal(state.phase, 'question');
assert.equal(state.wrong, bad);
event('answer', {choice: answer});
assert.equal(state.result, 'correct');
assert.equal(state.xp, 20);
// Three errors followed by one correct answer must fill only one piece.
state = reducer({}, {type: 'start', campaign, levelDeck: deck});
const topic = topics[0][0];
for (let attempt = 0; attempt < 4; attempt++) {
  event('spin', {random: [0]}); event('land'); event('begin');
  const answer = state.questions[state.index][2];
  assert.equal(state.crownRound, false);
  event('answer', {choice: attempt === 3 ? answer : (answer + 1) % 4});
  assert.equal(progressInTopic(state, topic), attempt === 3 ? 1 : 0);
  event('next');
  assert.equal(state.crowns.length, 0);
  assert.equal(state.phase, attempt === 3 ? 'question' : 'wheel');
}
assert.equal(state.score, 1);
assert.equal(state.solved.length, 1);
// A missed question is retried; a correctly answered one is skipped.
assert.equal(state.index, 1);
// Four actual correct answers earn a crown; failing the fourth does not.
for (const winLast of [false, true]) {
  state = reducer({}, {type: 'start', campaign, levelDeck: deck});
  event('spin', {random: [0]}); event('land'); event('begin');
  for (let i = 0; i < 4; i++) {
    const answer = state.questions[state.index][2];
    assert.equal(state.crownRound, i === 3);
    event('answer', {choice: i === 3 && !winLast ? (answer + 1) % 4 : answer});
    assert.equal(progressInTopic(state, topic), i === 3 && !winLast ? 3 : i + 1);
    event('next');
  }
  assert.equal(state.crowns.includes(topic), winLast);
  assert.equal(state.phase, 'wheel');
  assert.equal(state.xp, winLast ? 55 : 30);
}
// Timeouts cannot complete a level; all six crowns must be earned before advancing.
state = reducer({}, {type: 'start', campaign, levelDeck: levelQuestions(campaign, 0)});
for (let attempt = 0; attempt < 24; attempt++) {
  event('spin', {random: [0]}); event('land'); event('begin');
  event('expire', {}, state.deadline);
  if (state.phase === 'offer') event('skip', {}, state.deadline);
  event('next');
  assert.equal(state.phase, 'wheel');
}
assert.equal(state.xp, 0);
assert.equal(state.correctAnswers.length, 0);
assert.equal(state.solved.length, 0);
assert.equal(state.levelResults.length, 0);
for (let level = 0; level < 10; level++) {
  let steps = 0;
  while (state.phase !== 'summary') {
    assert.ok(steps++ < 200);
    if (state.phase === 'wheel') event('spin', {random: [.3]});
    else if (state.phase === 'spinning') event('land');
    else if (state.phase === 'topic') event('begin');
    else if (state.phase === 'question') event('answer', {choice: (state.replacements[state.index] ?? state.questions[state.index])[2]});
    else if (state.phase === 'feedback') event('next');
    else assert.fail(state.phase);
  }
  assert.equal(state.solved.length, 24);
  assert.equal(state.crowns.length, 6);
  assert.equal(state.score, 24);
  assert.equal(state.levelResults.length, level + 1);
  assert.equal(state.levelResults[level].crowns.length, 6);
  assert.equal(state.xp, (level + 1) * 380);
  const reward = state.xp;
  event('next');
  assert.equal(state.xp, reward); // Completing twice cannot duplicate the bonus.
  if (level < 9) event('level', {levelDeck: levelQuestions(campaign, level + 1)});
}
// An incomplete summary cannot bypass the six-crown requirement.
const rejected = {...state, level: 0, crowns: []};
assert.equal(reducer(rejected, {type: 'level', levelDeck: deck}), rejected);
// Visiting the home/study menu pauses a live question without losing time or progress.
state = reducer({}, {type: 'start', campaign, levelDeck: deck});
begin();
const pausedIndex = state.index;
const pausedDeadline = state.deadline;
event('pause', {}, 6000);
event('expire', {}, 100000);
assert.equal(state.phase, 'question');
assert.equal(state.index, pausedIndex);
assert.equal(state.score, 0);
event('resume', {}, 106000);
assert.equal(state.deadline, pausedDeadline + 100000);
assert.equal(state.deadline - 106000, pausedDeadline - 6000);
event('answer', {choice: state.questions[state.index][2]}, 107000);
assert.equal(state.result, 'correct');
assert.equal(state.score, 1);
// A paused spin ignores its old completion callback until play resumes.
state = reducer({}, {type: 'start', campaign, levelDeck: deck});
event('spin', {random: [0]}); event('pause'); event('land');
assert.equal(state.phase, 'spinning');
event('resume'); event('land');
assert.equal(state.phase, 'topic');
// Confirming exit leaves the current question pending without XP, crown progress or refunds.
state = reducer({}, {type: 'start', campaign, levelDeck: deck});
begin();
const pendingIndex = state.index;
event('power', {power: 'bomb'});
event('pause', {}, 6000);
event('leaveQuestion', {}, 7000);
assert.equal(state.phase, 'wheel');
assert.equal(state.score, 0);
assert.equal(state.xp, 0);
assert.equal(state.solved.includes(pendingIndex), false);
assert.equal(state.correctAnswers.length, 0);
assert.equal(state.crowns.length, 0);
assert.equal(state.stock.bomb, 0);
assert.equal(state.pausedAt, null);
// If a timeout wins the event race, opening a hint must not pause the feedback/offer.
const alreadyExpired = { ...state, phase: 'offer' };
assert.equal(reducer(alreadyExpired, {type: 'pause', onlyQuestion: true, now: 9000}), alreadyExpired);
console.log('PASS: all 246 active questions have explanations; timeout, extra time, frozen timer, XP, retry, crowns only for four correct answers ten-level completion and home-menu pause/resume.');
