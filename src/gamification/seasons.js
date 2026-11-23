import defaultConfig from './gamification.config.js';
import { migrarTemporada } from './migrations.js';
import { procesarEvento } from './engine.js';

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

export function listarTemporadas(config = defaultConfig) {
  return config.temporadas || (config.temporada ? [{ ...config.temporada, niveles: [] }] : []);
}

export function calcularProgresoTemporada(user, temporadaId, config = defaultConfig) {
  const season = listarTemporadas(config).find(item => item.id === temporadaId);
  if (!season) return null;
  const start = season.fechaInicio ? new Date(`${season.fechaInicio.slice(0, 10)}T00:00:00.000Z`) : null;
  const end = season.fechaFin ? new Date(`${season.fechaFin.slice(0, 10)}T23:59:59.999Z`) : null;
  const xp = (user?.eventos || []).reduce((total, event) => {
    if (event.tipo !== config.eventos.xp) return total;
    const date = new Date(event.timestamp);
    const tagged = event.temporadaId === season.id;
    const inRange = !event.temporadaId && !Number.isNaN(date.getTime()) && (!start || date >= start) && (!end || date <= end);
    if (!tagged && !inRange) return total;
    return total + (Number(event.cantidad) || config.limites.xpMinimo);
  }, config.limites.xpMinimo);
  const levels = [...(season.niveles || [])].sort((a, b) => a.xpNecesario - b.xpNecesario);
  const actual = levels.filter(level => xp >= Number(level.xpNecesario || config.limites.xpMinimo)).at(-1) || null;
  const siguiente = levels.find(level => Number(level.xpNecesario) > xp) || null;
  const base = Number(actual?.xpNecesario) || config.limites.xpMinimo;
  const span = siguiente ? siguiente.xpNecesario - base : null;
  const earned = Math.max(config.limites.xpMinimo, xp - base);
  return { temporada: season, xp, actual, siguiente, xpEnNivel: earned, xpParaSiguiente: siguiente ? Math.max(config.limites.xpMinimo, siguiente.xpNecesario - xp) : config.limites.xpMinimo, porcentaje: span ? Math.min(100, earned / span * 100) : 100 };
}

export function reclamarRecompensaTemporada(user, temporadaId, nivelId, config = defaultConfig) {
  const progress = calcularProgresoTemporada(user, temporadaId, config);
  const level = progress?.temporada.niveles?.find(item => item.id === nivelId);
  const claimed = (user?.eventos || []).some(event => event.tipo === config.eventos.temporadaReclamada && event.temporadaId === temporadaId && event.nivelTemporadaId === nivelId);
  if (!level || progress.xp < Number(level.xpNecesario) || claimed) throw new Error(config.errores.recompensaTemporadaNoDisponible);
  let updated = user;
  for (const [index, reward] of (level.recompensas || []).entries()) {
    if (!(Number(reward.cantidad) > config.limites.diasMinimo)) continue;
    const type = reward.tipo === 'xp' ? config.eventos.xp : reward.tipo === 'moneda' ? config.eventos.monedaGanada : null;
    if (!type) continue;
    updated = procesarEvento(updated, {
      id: `${config.recompensas.idPrefijoGenerado}season-${temporadaId}-${nivelId}-${index}`,
      tipo: type, cantidad: reward.cantidad, monedaId: reward.monedaId,
      temporadaId: reward.tipo === 'xp' ? temporadaId : undefined,
      temporadaRecompensaId: `${temporadaId}:${nivelId}`,
    }, config);
  }
  return procesarEvento(updated, {
    id: `${config.recompensas.idPrefijoGenerado}season-claim-${temporadaId}-${nivelId}`,
    tipo: config.eventos.temporadaReclamada, temporadaId, nivelTemporadaId: nivelId,
  }, config);
}
