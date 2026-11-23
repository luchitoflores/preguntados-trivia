import defaultConfig from './gamification.config.js';
import { reclamarRecompensas } from './rewards.js';

export function listarHitosDias(user, config = defaultConfig) {
  const total = user?.stats?.diasConectadoAcumulados || user?.stats?.diasActivos?.length || config.limites.diasMinimo;
  return (config.hitosDias || []).map(milestone => {
    const claimKey = `hito-dias:${milestone.id}`;
    const claimed = (user?.eventos || []).some(event => event.tipo === config.eventos.recompensaReclamada && event.recompensaKey === claimKey);
    return { ...milestone, progreso: Math.min(total, milestone.dias), completado: total >= milestone.dias, reclamado: claimed, disponible: total >= milestone.dias && !claimed, clave: claimKey };
  });
}

export function reclamarHitoDias(user, milestoneId, config = defaultConfig, timestamp = new Date().toISOString()) {
  const milestone = listarHitosDias(user, config).find(item => item.id === milestoneId);
  if (!milestone?.disponible) throw new Error(config.errores.recompensaNoDisponible);
  return reclamarRecompensas(user, milestone.clave, milestone.recompensas, config, timestamp, { hitoDiasId: milestoneId });
}

export default listarHitosDias;
