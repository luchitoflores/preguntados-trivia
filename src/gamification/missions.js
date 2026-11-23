import defaultConfig from './gamification.config.js';
import { fechaLocal } from './stats.js';
import { obtenerClavePeriodo } from './calendar.js';
import { reclamarRecompensas } from './rewards.js';

function getMissionState(mission, user, config, reference) {
  const objective = mission.objetivo || {};
  const periodicity = mission.periodicidad || 'total';
  const periodKey = obtenerClavePeriodo(reference, periodicity, config);
  const events = (user.eventos || []).filter(event => periodicity === 'total' || obtenerClavePeriodo(event.timestamp, periodicity, config) === periodKey);
  const required = Number(objective.cantidadNecesaria) || config.valores.incremento;
  let current = config.limites.diasMinimo;

  if (objective.tipo === 'conteo-eventos') {
    const eventType = config.eventos[objective.eventoKey];
    current = events.filter(event => event.tipo === eventType).length;
  } else if (objective.tipo === 'conteo-ruedas-distintas') {
    current = new Set(events.filter(event => event.tipo === config.eventos.rueda).map(event => event.rueda).filter(Boolean)).size;
  } else if (objective.tipo === 'xp-total') {
    current = events.filter(event => event.tipo === config.eventos.xp).reduce((sum, event) => sum + (Number(event.cantidad) || config.limites.diasMinimo), config.limites.diasMinimo);
  } else if (objective.tipo === 'coronas') {
    current = events.filter(event => event.tipo === config.eventos.corona).length;
  } else if (objective.tipo === 'dias-activos') {
    const activityTypes = new Set((config.actividad?.eventosQueCuentan || []).map(key => config.eventos[key]).filter(Boolean));
    current = new Set(events.filter(event => activityTypes.has(event.tipo)).map(event => fechaLocal(event.timestamp, config))).size;
  }
  const claimKey = `mision:${mission.id}:${periodKey}`;
  const claimed = (user.eventos || []).some(event => event.tipo === config.eventos.recompensaReclamada && event.recompensaKey === claimKey)
    || (periodicity === 'total' && (user.misionesReclamadas || []).includes(mission.id));
  return { ...mission, periodo: periodKey, claveRecompensa: claimKey, progreso: { actual: Math.min(current, required), requerido: required, completada: current >= required }, reclamada: claimed };
}

export function listarMisiones(user, config = defaultConfig, reference = new Date()) {
  return (config.misiones || []).map(mission => getMissionState(mission, user, config, reference));
}

export function reclamarMision(user, missionId, config = defaultConfig, reference = new Date()) {
  const mission = listarMisiones(user, config, reference).find(item => item.id === missionId);
  if (!mission || !mission.progreso.completada || mission.reclamada) throw new Error(config.errores.misionNoDisponible);
  return reclamarRecompensas(user, mission.claveRecompensa, mission.recompensas || [], config, new Date(reference).toISOString(), { misionId: missionId, periodo: mission.periodo });
}
