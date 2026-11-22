// Adapta las filas históricas [pregunta, respuesta, distractor...] sin alterar los bancos existentes.
import { createQuestion } from './question-core.js';

export function adaptLegacyQuestion(row, { id = '', rueda = 'ejes', filosofo = '', tema = '' } = {}) {
  if (!Array.isArray(row) || row.length < 3) return null;
  const [prompt, answer, ...options] = row;
  return createQuestion({
    id, tipo: 'texto-a-texto', rueda, filosofo, tema,
    pregunta: { texto: String(prompt), imagen: null, audio: null },
    respuesta_correcta: { texto: String(answer), imagen: null, audio: null, explicacion: '' },
    opciones: [answer, ...options].map(texto => ({ texto: String(texto), imagen: null })),
    pistas: [], tiempo_segundos: 30,
  });
}
