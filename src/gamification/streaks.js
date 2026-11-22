import defaultConfig from './gamification.config.js';
import { fechaLocal } from './stats.js';

export function calcularRacha(diasActivos = [], referencia = new Date(), config = defaultConfig) {
  const active = new Set(diasActivos);
  if (!active.size) return { actual: config.limites.diasMinimo, mejor: config.limites.diasMinimo };
  const today = fechaLocal(referencia, config);
  const dayMs = config.calendario.milisegundosPorDia;
  const activeDays = [...active].map(day => Math.floor(Date.parse(`${day}T00:00:00.000Z`) / dayMs)).sort((a, b) => a - b);
  let best = config.valores.incremento;
  let run = config.valores.incremento;
  for (let index = config.valores.incremento; index < activeDays.length; index += config.calendario.pasos) {
    run = activeDays[index] - activeDays[index - config.calendario.pasos] === config.calendario.diferenciasDiasConsecutivos ? run + config.valores.incremento : config.valores.incremento;
    best = Math.max(best, run);
  }
  const currentDay = Math.floor(Date.parse(`${today}T00:00:00.000Z`) / dayMs);
  const lastDay = activeDays[activeDays.length - config.valores.incremento];
  const isRecent = currentDay - lastDay <= config.calendario.toleranciaDiasInactivos;
  if (!isRecent) return { actual: config.limites.diasMinimo, mejor: best };
  let current = config.valores.incremento;
  for (let index = activeDays.length - config.valores.incremento; index >= config.valores.incremento; index -= config.calendario.pasos) {
    if (activeDays[index] - activeDays[index - config.calendario.pasos] !== config.calendario.diferenciasDiasConsecutivos) break;
    current += config.valores.incremento;
  }
  return { actual: current, mejor: Math.max(best, current) };
}
