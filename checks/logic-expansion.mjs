import assert from 'node:assert/strict';
import { additionalLogic, logicLessons, logicMemories } from '../logic-expansion.js';
import { formalGuide, formalHint } from '../formal-logic.js';
import { explanations } from '../explanations.js';

function evaluate(expression, values) {
  const tokens = expression.match(/[PQRS]|[¬∧∨→↔()]/g) ?? [];
  let at = 0;
  function atom() {
    const token = tokens[at++];
    if (token === '¬') return !atom();
    if (token === '(') { const value = equivalence(); assert.equal(tokens[at++], ')'); return value; }
    assert.ok(token in values, expression);
    return values[token];
  }
  function and() { let v = atom(); while (tokens[at] === '∧') { at++; const rhs = atom(); v = v && rhs; } return v; }
  function or() { let v = and(); while (tokens[at] === '∨') { at++; const rhs = and(); v = v || rhs; } return v; }
  function implies() { const v = or(); if (tokens[at] !== '→') return v; at++; const rhs = implies(); return !v || rhs; }
  function equivalence() { let v = Boolean(implies()); while (tokens[at] === '↔') { at++; v = v === Boolean(implies()); } return v; }
  const result = equivalence();
  assert.equal(at, tokens.length, expression);
  return result;
}
function validProposition(option) {
  const parts = option.split(';').map(s => s.trim().replace(/^∴\s*/, ''));
  const conclusion = parts.pop();
  for (let bits = 0; bits < 16; bits++) {
    const values = Object.fromEntries(['P','Q','R','S'].map((v, i) => [v, Boolean(bits & (1 << i))]));
    if (parts.every(p => evaluate(p, values)) && !evaluate(conclusion, values)) return false;
  }
  return true;
}
function validCategorical(option) {
  const parts = option.split(';').map(s => s.trim().replace(/^∴\s*/, ''));
  const conclusion = parts.pop();
  function evaluateStatement(text, sets) {
    let match = /^todos los ([MSP]) son ([MSP])$/i.exec(text);
    if (match) return (sets[match[1]] & (~sets[match[2]] & 7)) === 0;
    match = /^ningún ([MSP]) es ([MSP])$/i.exec(text);
    if (match) return (sets[match[1]] & sets[match[2]]) === 0;
    match = /^algunos ([MSP]) son ([MSP])$/i.exec(text);
    assert.ok(match, text);
    return (sets[match[1]] & sets[match[2]]) !== 0;
  }
  for (let S=0; S<8; S++) for (let M=0; M<8; M++) for (let P=0; P<8; P++) {
    const sets = {S, M, P};
    if (parts.every(p => evaluateStatement(p, sets)) && !evaluateStatement(conclusion, sets)) return false;
  }
  return true;
}
assert.equal(additionalLogic.length, 11);
assert.equal(new Set(additionalLogic.map(row => row[0])).size, 11);
for (const [prompt, ...options] of additionalLogic) {
  assert.equal(new Set(options).size, 4, prompt);
  const validity = options.map(option => /Bárbara|Celarent/.test(prompt) ? validCategorical(option) : validProposition(option));
  assert.deepEqual(validity, [true, false, false, false], prompt);
  assert.ok(logicLessons.get(prompt)?.length > 100);
  assert.equal(explanations.get(prompt), logicLessons.get(prompt));
  assert.ok(formalGuide(prompt));
  if (/Bárbara|Celarent/.test(prompt)) assert.equal(formalHint(prompt).categorical, true);
  assert.ok(formalHint(prompt).memory === logicMemories.get(prompt));
  const hint = JSON.stringify(formalHint(prompt));
  for (const option of options) assert.ok(!hint.includes(option), prompt);
  assert.ok(!hint.includes('∴'), prompt);
}
console.log('PASS: 11 new items each have exactly one valid option, checked by truth tables or categorical set models; hints contain no solved alternative.');
