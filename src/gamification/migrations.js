import defaultConfig from './gamification.config.js';

const userMigrations = {
  1: user => ({
    ...user,
    medallasMensuales: user.medallasMensuales || [],
    misionesReclamadas: user.misionesReclamadas || [],
    avatar: { trajeActual: null, mascotaActual: null, ...(user.avatar || {}) },
  }),
};

const seasonMigrations = {
  1: season => ({ ...season, usuarios: season.usuarios || {} }),
};

/** Registro extensible: cada migración recibe datos y config, y devuelve datos. */
export function migrarUsuario(user, config = defaultConfig, migrations = {}) {
  if (!user || typeof user !== 'object') return user;
  let current = Number(user.schemaVersion) || config.limites.diasMinimo;
  let result = { ...user };
  while (current < config.persistencia.versionEsquema) {
    const migration = { ...userMigrations, ...migrations }[current];
    if (!migration) break;
    result = migration(result, config);
    current += config.valores.incremento;
  }
  return { ...result, schemaVersion: Math.max(current, config.persistencia.versionEsquema) };
}

export function migrarTemporada(season, config = defaultConfig, migrations = {}) {
  if (!season || typeof season !== 'object') return season;
  let current = Number(season.schemaVersion) || config.limites.diasMinimo;
  let result = { ...season };
  while (current < config.persistencia.versionEsquema) {
    const migration = { ...seasonMigrations, ...migrations }[current];
    if (!migration) break;
    result = migration(result, config);
    current += config.valores.incremento;
  }
  return { ...result, schemaVersion: Math.max(current, config.persistencia.versionEsquema) };
}
