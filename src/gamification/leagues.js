import defaultConfig from './gamification.config.js';

export function obtenerLiga(xp, config = defaultConfig) {
  return [...config.ligas]
    .sort((first, second) => first.minXP - second.minXP)
    .find(league => xp >= league.minXP && (league.maxXP == null || xp <= league.maxXP)) || null;
}

export function progresoLiga(xp, config = defaultConfig) {
  const league = obtenerLiga(xp, config);
  if (!league) return null;
  const next = [...config.ligas].sort((first, second) => first.minXP - second.minXP)
    .find(item => item.minXP > league.minXP);
  return { liga: league, siguiente: next || null, xpParaSiguiente: next ? Math.max(config.limites.xpMinimo, next.minXP - xp) : config.limites.xpMinimo };
}
