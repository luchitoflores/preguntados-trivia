import defaultConfig from './gamification.config.js';
import { obtenerHoraEnRango } from './stats.js';

const evaluadores = {
  'por-hora': (badge, user, config) => obtenerHoraEnRango(user.stats, badge.parametro, config) >= badge.parametro.vecesNecesarias,
  'por-racha': (badge, user, config) => (user.stats.rachaActual ?? config.limites.diasMinimo) >= badge.parametro.diasNecesarios,
  'por-mejor-racha': (badge, user, config) => (user.stats.mejorRacha ?? config.limites.diasMinimo) >= badge.parametro.diasNecesarios,
  'por-dias-conectado': (badge, user, config) => (user.stats.diasConectadoAcumulados ?? config.limites.diasMinimo) >= badge.parametro.diasNecesarios,
  'por-coronas': (badge, user, config) => (user.stats.coronas ?? config.limites.diasMinimo) >= badge.parametro.coronasNecesarias,
  'por-repeticion': (badge, user, config) => (user.stats.vecesPorAccion?.[badge.parametro.accion] ?? config.limites.diasMinimo) >= badge.parametro.vecesNecesarias,
  'por-xp-dia': (badge, user, config) => (user.stats.mejorDia?.xp ?? config.limites.diasMinimo) >= badge.parametro.xpMinimoEnUnDia,
  'por-eventos': (badge, user, config) => {
    const expectedType = config.eventos[badge.parametro.eventoKey];
    const filters = badge.parametro.filtros || {};
    const matching = (user.eventos || []).filter(event => {
      if (event.tipo !== expectedType) return false;
      return Object.entries(filters).every(([key, value]) => key === 'etiquetas'
        ? (Array.isArray(event.etiquetas) && value.every(tag => event.etiquetas.includes(tag)))
        : Array.isArray(value) ? value.includes(event[key]) : event[key] === value);
    }).length;
    return matching >= badge.parametro.vecesNecesarias;
  },
};

export function revisarBadges(user, config = defaultConfig) {
  const earned = new Set(user.badges || []);
  const unlocked = [];
  for (const badge of config.badges) {
    const evaluate = evaluadores[badge.tipo];
    if (evaluate && !earned.has(badge.id) && evaluate(badge, user, config)) {
      earned.add(badge.id);
      unlocked.push(badge.id);
    }
  }
  return { ...user, badges: [...earned], badgesNuevos: unlocked };
}

export function listarBadges(user, config = defaultConfig) {
  const earned = new Set(user.badges || []);
  return config.badges.map(badge => ({ ...badge, desbloqueado: earned.has(badge.id) }));
}
