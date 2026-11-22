import defaultConfig from './gamification.config.js';
import { migrarTemporada } from './migrations.js';

export function crearTemporada(config = defaultConfig, now = new Date()) {
  return { schemaVersion: config.persistencia.versionEsquema, temporadaId: config.temporada.id, usuarios: {}, fechaActualizacion: now.toISOString() };
}

export function cargarTemporada(storage = globalThis.localStorage, config = defaultConfig) {
  const raw = storage?.getItem(config.persistencia.claveTemporada);
  if (!raw) return crearTemporada(config);
  try { return migrarTemporada(JSON.parse(raw), config); } catch { return crearTemporada(config); }
}

export function guardarTemporada(season, storage = globalThis.localStorage, config = defaultConfig) {
  storage?.setItem(config.persistencia.claveTemporada, JSON.stringify(season));
  return season;
}

export function obtenerEstadoTemporada(now = new Date(), config = defaultConfig) {
  const start = config.temporada.fechaInicio ? new Date(config.temporada.fechaInicio) : null;
  const end = config.temporada.fechaFin ? new Date(config.temporada.fechaFin) : null;
  const actual = now instanceof Date ? now : new Date(now);
  return { ...config.temporada, iniciaEn: start && actual < start ? start : null, terminaEn: end && actual <= end ? end : null, activa: (!start || actual >= start) && (!end || actual <= end) };
}
