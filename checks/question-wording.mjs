import assert from 'node:assert/strict';
import { topics } from '../questions.js';
import { drills } from '../study.js';
import { reviewBank } from '../review-bank.js';
import { explanations } from '../explanations.js';
import { reviewPrompts, readablePrompt, lessonFor } from '../review-wording.js';
import { readableOption, hasContextualOptions } from '../review-options.js';
let rewritten = 0;
for (let group = 0; group < topics.length; group++) {
  for (const [prompt, answer, ...distractors] of [...drills[group], ...topics[group][3], ...reviewBank[group]]) {
    const shown = readablePrompt(prompt);
    assert.ok(shown.endsWith('?'), shown);
    assert.ok(!shown.includes('¿Qué idea corresponde a'), prompt);
    assert.equal(new Set([answer, ...distractors].map(option => readableOption(prompt, option))).size, 4, `Ambiguous options after rewriting: ${prompt}`);
    assert.ok(lessonFor(prompt)?.text || explanations.get(prompt), prompt);
    if (shown !== prompt) rewritten++;
  }
}
assert.equal(rewritten, reviewBank.flat().length);
assert.equal(Object.keys(reviewPrompts).length, rewritten);
const boecio = reviewBank[0].find(row => row[0].includes('Boecio: providencia'));
assert.ok(readablePrompt(boecio[0]).includes('decisiones'));
assert.ok(readableOption(boecio[0], boecio[1]).includes('no equivale a obligarnos'));
assert.ok(lessonFor(boecio[0]).text.includes('providencia'));
assert.ok(lessonFor(boecio[0]).example.includes('caminar'));
assert.ok(readableOption(boecio[0], boecio[2]).includes('Dios obliga'));
// Previously stored question keys and correct option positions remain unchanged.
const saved = JSON.parse(JSON.stringify([boecio[0], [boecio[2], boecio[1], boecio[3], boecio[4]], 1, topics[0][0]]));
const before = JSON.stringify(saved);
assert.equal(readablePrompt(saved[0]), readablePrompt(boecio[0]));
assert.equal(readableOption(saved[0], saved[1][saved[2]]), readableOption(boecio[0], boecio[1]));
assert.equal(JSON.stringify(saved), before);
const emancipation = reviewBank[3].find(row => row[0].includes('Emancipación intelectual'));
assert.equal(readableOption(emancipation[0], emancipation[1]), 'Plantear y examinar problemas desde la propia experiencia');
assert.ok(!readableOption(emancipation[0], emancipation[2]).startsWith('Reelabora'));
for (const row of reviewBank.flat()) {
  assert.ok(hasContextualOptions(row[0]));
  // Distractors are no longer definitions borrowed from adjacent topics.
  for (const option of row.slice(2)) assert.notEqual(readableOption(row[0], option), option);
  // Arbitrary stored shuffles preserve the option attached to the correct index.
  const shuffled = [row[3], row[4], row[1], row[2]];
  const correct = shuffled.indexOf(row[1]);
  assert.equal(correct, 2);
  assert.equal(readableOption(row[0], shuffled[correct]), readableOption(row[0], row[1]));
}
console.log(`PASS: ${rewritten} contextual questions, distinct answer options, explanation coverage and unchanged saved question keys.`);
