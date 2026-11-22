import defaultConfig from './gamification.config.js';

export function obtenerNivel(xp, config = defaultConfig) {
  const value = Number(xp) || config.limites.xpMinimo;
  return [...config.niveles].sort((a, b) => a.minXP - b.minXP)
    .filter(level => value >= level.minXP && (level.maxXP == null || value <= level.maxXP)).at(-1) || null;
}

export function progresoNivel(xp, config = defaultConfig) {
  const actual = obtenerNivel(xp, config);
  if (!actual) return null;
  const ordered = [...config.niveles].sort((a, b) => a.minXP - b.minXP);
  const siguiente = ordered.find(level => level.minXP > actual.minXP) || null;
  const earned = Math.max(config.limites.xpMinimo, (Number(xp) || config.limites.xpMinimo) - actual.minXP);
  const span = siguiente ? siguiente.minXP - actual.minXP : null;
  return { actual, siguiente, xpEnNivel: earned, xpParaSiguiente: siguiente ? Math.max(config.limites.xpMinimo, siguiente.minXP - xp) : config.limites.xpMinimo, porcentaje: span ? Math.min(100, earned / span * 100) : 100 };
}
