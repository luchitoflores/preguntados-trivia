import assert from 'node:assert/strict';
import { topics } from '../questions.js';
import { drills } from '../study.js';
import { reviewBank } from '../review-bank.js';
import { formalGuide, formalOptionHelp, formalHint, quickMemories } from '../formal-logic.js';
assert.equal(topics[0][1], 'Antigua y medieval');
for (let group = 0; group < topics.length; group++) {
  if (group === 4) continue;
  for (const [prompt, ...options] of [...topics[group][3], ...drills[group], ...reviewBank[group]]) {
    assert.equal(formalGuide(prompt), null, prompt);
    for (const option of options) assert.equal(formalOptionHelp(prompt, option), null, prompt);
  }
}
for (const [prompt] of [...drills[4], ...topics[4][3]]) {
  if (/ética|moral|eudemonismo|axiológico|determinismo|fin destaca|qué busca el agente/i.test(prompt)) assert.equal(formalGuide(prompt), null, prompt);
}
for (const [prompt] of drills[4].slice(13, 19)) assert.equal(formalGuide(prompt), null); // informal fallacies
for (const [prompt, ...options] of drills[4].slice(0, 13)) {
  assert.ok(formalGuide(prompt)?.steps.length >= 3, prompt);
  for (const option of options) {
    if (/[→∨∧↔¬∴]/.test(option)) assert.ok(formalOptionHelp(prompt, option), option);
  }
}
const tollens = drills[4][1][0];
assert.equal(formalOptionHelp(tollens, 'P → Q; ¬Q; ∴ ¬P'), 'Si llueve, entonces se moja la calle. No se moja la calle. Por tanto, no llueve.');
assert.equal(formalOptionHelp(tollens, 'A → B; ¬B; ∴ ¬A'), formalOptionHelp(tollens, 'P → Q; ¬Q; ∴ ¬P'));
const ponens = drills[4][0][0];
assert.equal(formalOptionHelp(ponens, 'P → Q; P; ∴ Q'), 'Si llueve, entonces se moja la calle. Llueve. Por tanto, se moja la calle.');
const disjunctive = drills[4][2][0];
assert.equal(formalOptionHelp(disjunctive, 'P ∨ Q; ¬P; ∴ Q'), 'Llueve o se moja la calle. No llueve. Por tanto, se moja la calle.');
const affirming = drills[4][7][0];
assert.ok(formalGuide(affirming).why.includes('falacia'));
assert.ok(formalGuide(affirming).why.includes('no significa que la inferencia sea válida'));
assert.ok(formalOptionHelp(affirming, 'A → B; B; ∴ A').includes('Se moja la calle. Por tanto, llueve'));
const truth = '¿Cuándo es falsa P ∨ Q?';
assert.ok(formalGuide(truth));
assert.equal(formalOptionHelp(truth, 'P ∨ ¬P'), 'Llueve o no llueve.');
assert.equal(formalOptionHelp(truth, 'P ∧ ¬P'), 'Llueve y no llueve.');
assert.equal(formalOptionHelp(truth, 'P ↔ Q'), 'Llueve si y solo si se moja la calle.');
// No mutation of original question keys, options, or correct positions.
const before = JSON.stringify(drills[4]);
drills[4].forEach(([prompt, ...options]) => options.forEach(option => formalOptionHelp(prompt, option)));
assert.equal(JSON.stringify(drills[4]), before);
console.log('PASS: formal logic scaffolding, symbol readings, A/B equivalence, valid rules vs fallacies, and no changes to ethics or other subjects.');

const tollensHint = formalHint('¿Cuál es la forma del modus tollendo tollens?');
assert.equal(tollensHint.kind, 'rule');
assert.equal(tollensHint.formula, undefined);
assert.equal(tollensHint.name, undefined); // Recognition questions must not reveal the rule name.
assert.equal(quickMemories[0].word, 'Ponens / ponendo');
assert.ok(quickMemories[0].meaning.includes('Afirmar'));
assert.ok(quickMemories[1].meaning.includes('Negar'));
assert.equal(quickMemories.length, 4);
assert.equal(formalHint('¿Qué caracteriza a la ética autónoma?'), null);
for (const [prompt, ...options] of [...drills[4], ...topics[4][3]]) {
  const hint = formalHint(prompt);
  if (!hint) continue;
  const text = JSON.stringify(hint) + JSON.stringify(quickMemories);
  assert.ok(!/∴|concluye no P|concluye Q|V→F/.test(text), prompt);
  for (const option of options) assert.ok(!text.includes(option), `Hint reveals an option: ${prompt}`);
}
