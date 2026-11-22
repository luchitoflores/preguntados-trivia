import defaultConfig from './gamification.config.js';
import { procesarEvento } from './engine.js';

function getProgress(mission, user, config) {
  const objective = mission.objetivo;
  const required = Number(objective.cantidadNecesaria) || config.valores.incremento;
  let current = config.limites.diasMinimo;
  if (objective.tipo === 'conteo-eventos') {
    const eventType = config.eventos[objective.eventoKey];
    current = (user.eventos || []).filter(event => event.tipo === eventType).length;
  } else if (objective.tipo === 'conteo-ruedas-distintas') {
    current = new Set((user.eventos || []).filter(event => event.tipo === config.eventos.rueda).map(event => event.rueda).filter(Boolean)).size;
  } else if (objective.tipo === 'xp-total') {
    current = Number(user.xp) || config.limites.xpMinimo;
  } else if (objective.tipo === 'coronas') {
    current = Number(user.stats?.coronas) || config.limites.diasMinimo;
  }
  return { actual: Math.min(current, required), requerido: required, completada: current >= required };
}

export function listarMisiones(user, config = defaultConfig) {
  const claims = new Set(user.misionesReclamadas || []);
  return config.misiones.map(mission => ({ ...mission, progreso: getProgress(mission, user, config), reclamada: claims.has(mission.id) }));
}

export function reclamarMision(user, missionId, config = defaultConfig) {
  const mission = config.misiones.find(item => item.id === missionId);
  const state = mission && listarMisiones(user, config).find(item => item.id === missionId);
  if (!mission || !state?.progreso.completada || state.reclamada) throw new Error(config.errores.misionNoDisponible);
  let updated = { ...user, misionesReclamadas: [...(user.misionesReclamadas || []), missionId] };
  for (const [index, reward] of mission.recompensas.entries()) {
    const id = `${config.recompensas.idPrefijoGenerado}mission-${missionId}-${index}`;
    const type = reward.tipo === 'xp' ? config.eventos.xp : reward.tipo === 'moneda' ? config.eventos.monedaGanada : reward.tipo;
    updated = procesarEvento(updated, { id, tipo: type, cantidad: reward.cantidad, monedaId: reward.monedaId, misionId: missionId }, config);
  }
  return updated;
}
