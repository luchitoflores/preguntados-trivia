import defaultConfig from './gamification.config.js';
import { obtenerHoraEnRango } from './stats.js';

const evaluadores = {
  'por-hora': (badge, user, config) => obtenerHoraEnRango(user.stats, badge.parametro, config) >= badge.parametro.vecesNecesarias,
  'por-racha': (badge, user, config) => (user.stats.rachaActual ?? config.limites.diasMinimo) >= badge.parametro.diasNecesarios,
  'por-coronas': (badge, user, config) => (user.stats.coronas ?? config.limites.diasMinimo) >= badge.parametro.coronasNecesarias,
  'por-repeticion': (badge, user, config) => (user.stats.vecesPorAccion?.[badge.parametro.accion] ?? config.limites.diasMinimo) >= badge.parametro.vecesNecesarias,
  'por-xp-dia': (badge, user, config) => (user.stats.mejorDia?.xp ?? config.limites.diasMinimo) >= badge.parametro.xpMinimoEnUnDia,
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
