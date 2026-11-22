// Esquema canónico y validación compartida para preguntas de Preguntados.
export const QUESTION_TYPES = ['texto-a-texto', 'imagen-a-palabra', 'palabra-a-imagen', 'imagen-a-significado', 'audio-a-palabra'];

export function createQuestion(input = {}) {
  const prompt = input.pregunta ?? {};
  const correct = input.respuesta_correcta ?? {};
  return {
    id: input.id || `CUSTOM_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    tipo: QUESTION_TYPES.includes(input.tipo) ? input.tipo : 'texto-a-texto',
    bloom: Number(input.bloom) || 1,
    rueda: input.rueda || 'ejes',
    filosofo: input.filosofo || '',
    tema: input.tema || '',
    pregunta: { texto: prompt.texto || '', imagen: prompt.imagen || null, audio: prompt.audio || null },
    respuesta_correcta: { texto: correct.texto || '', imagen: correct.imagen || null, audio: correct.audio || null, explicacion: correct.explicacion || '' },
    opciones: Array.isArray(input.opciones) ? input.opciones.map(o => ({ texto: o.texto || '', imagen: o.imagen || null, audio: o.audio || null })) : [],
    pistas: Array.isArray(input.pistas) ? input.pistas : [],
    tiempo_segundos: Math.max(10, Math.min(90, Number(input.tiempo_segundos) || 30)),
  };
}

export function validateQuestion(raw) {
  const q = createQuestion(raw);
  const errors = [];
  if (!q.pregunta.texto && !q.pregunta.imagen && !q.pregunta.audio) errors.push('Falta el contenido de la pregunta.');
  if (!q.respuesta_correcta.texto && !q.respuesta_correcta.imagen && !q.respuesta_correcta.audio) errors.push('Falta la respuesta correcta.');
  if (q.opciones.length < 2) errors.push('Agrega al menos dos opciones.');
  return { question: q, errors };
}
