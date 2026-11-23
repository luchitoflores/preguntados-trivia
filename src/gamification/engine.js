import defaultConfig from './gamification.config.js';
import { revisarBadges } from './badges.js';
import { calcularRacha } from './streaks.js';
import { calcularEstadisticas } from './stats.js';
import { obtenerLiga } from './leagues.js';
import { migrarUsuario } from './migrations.js';
import { obtenerSaldo } from './wallet.js';
import { progresoNivel } from './progression.js';

export function crearUsuario({ id = globalThis.crypto?.randomUUID?.(), nombre } = {}, config = defaultConfig) {
  if (!id) throw new Error(config.errores.idRequerido);
  const user = {
    schemaVersion: config.persistencia.versionEsquema,
    id, nombre: nombre ?? config.perfil.nombreInicial, xp: config.limites.xpMinimo, ligaId: null, badges: [],
    avatar: { trajeActual: config.perfil.trajeInicial, mascotaActual: config.perfil.mascotaInicial }, eventos: [], stats: {},
  };
  const initialized = actualizarDerivados(user, new Date(), config);
  const { badgesNuevos, ...createdUser } = initialized;
  return createdUser;
}

function actualizarDerivados(user, referencia, config) {
  const stats = calcularEstadisticas(user.eventos, config);
  const streak = calcularRacha(stats.diasActivos, referencia, config);
  stats.rachaActual = streak.actual;
  stats.mejorRacha = streak.mejor;
  stats.saldos = Object.fromEntries(config.monedas.map(money => [money.id, obtenerSaldo(user, money.id, config)]));
  stats.progresoNivel = progresoNivel(user.xp, config);
  const league = obtenerLiga(user.xp, config);
  return revisarBadges({ ...user, ligaId: league?.id || null, stats }, config);
}

export function procesarEvento(user, event, config = defaultConfig) {
  if (!event?.tipo) throw new Error(config.errores.tipoEventoRequerido);
  const timestamp = event.timestamp || new Date().toISOString();
  const id = event.id || `${config.recompensas.idPrefijoGenerado}${event.tipo}-${timestamp}-${(user.eventos || []).length}`;
  if ((user.eventos || []).some(item => item.id === id)) return user;
  const normalized = { ...event, id, timestamp };
  const currencyAmount = Number(normalized.cantidad);
  if ([config.eventos.monedaGanada, config.eventos.monedaGastada].includes(normalized.tipo)
    && (!config.monedas.some(money => money.id === normalized.monedaId) || !Number.isFinite(currencyAmount) || currencyAmount <= config.limites.diasMinimo)) {
    throw new Error(config.errores.operacionMonedasInvalida);
  }
  const events = [...(user.eventos || []), normalized];
  const requestedXP = Number(normalized.cantidad);
  const xpDelta = normalized.tipo === config.eventos.xp && Number.isFinite(requestedXP) ? requestedXP : config.limites.xpMinimo;
  const currentXP = Number(user.xp);
  const safeXP = Number.isFinite(currentXP) ? currentXP : config.limites.xpMinimo;
  const validAmount = currencyAmount;
  const isCurrencySpend = normalized.tipo === config.eventos.monedaGastada;
  if (isCurrencySpend && obtenerSaldo(user, normalized.monedaId, config) < validAmount) throw new Error(config.errores.monedasInsuficientes);
  const nextXP = Math.max(config.limites.xpMinimo, safeXP + xpDelta);
  const cappedEvents = config.recompensas.limiteEventosGuardados == null ? events : events.slice(-config.recompensas.limiteEventosGuardados);
  const nextUser = actualizarDerivados({ ...user, schemaVersion: config.persistencia.versionEsquema, xp: nextXP, eventos: cappedEvents }, new Date(timestamp), config);
  const { badgesNuevos, ...persistedUser } = nextUser;
  return { ...persistedUser, badgesNuevos };
}

export function estaDesbloqueado(requisito, user, config = defaultConfig) {
  if (!requisito) return true;
  for (const rule of config.reglasDesbloqueo) {
    if (!requisito.startsWith(rule.prefijo)) continue;
    const value = requisito.slice(rule.prefijo.length);
    if (rule.tipo === 'liga-minima') {
      const target = config.ligas.find(item => item.id === value);
      const current = config.ligas.find(item => item.id === obtenerLiga(user?.xp, config)?.id);
      return Boolean(target && current && current.minXP >= target.minXP);
    }
    if (rule.tipo === 'corona') return Boolean(user?.stats?.coronasPorRueda?.[value] || user?.stats?.coronasPorTema?.[value]);
    if (rule.tipo === 'badge') return (user?.badges || []).includes(value);
    if (rule.tipo === 'xp-minimo') return (Number(user?.xp) || config.limites.xpMinimo) >= Number(value);
    if (rule.tipo === 'articulo-comprado') return (user?.eventos || []).some(event => event.tipo === config.eventos.articuloComprado && event.articuloId === value);
    return false;
  }
  return false;
}

export function guardarUsuario(user, storage = globalThis.localStorage, config = defaultConfig) {
  const normalized = migrarUsuario(user, config);
  storage?.setItem(config.persistencia.claveUsuario, JSON.stringify(normalized));
  return normalized;
}

export function cargarUsuario(storage = globalThis.localStorage, config = defaultConfig) {
  const saved = storage?.getItem(config.persistencia.claveUsuario);
  if (!saved) return null;
  try { return migrarUsuario(JSON.parse(saved), config); } catch { return null; }
}

export function agregarXP(user, cantidad, config = defaultConfig, meta = {}) {
  return procesarEvento(user, { ...meta, tipo: config.eventos.xp, cantidad }, config);
}

export function gastarMoneda(user, monedaId, cantidad, config = defaultConfig, meta = {}) {
  return procesarEvento(user, { ...meta, tipo: config.eventos.monedaGastada, monedaId, cantidad }, config);
}

export function otorgarMoneda(user, monedaId, cantidad, config = defaultConfig, meta = {}) {
  return procesarEvento(user, { ...meta, tipo: config.eventos.monedaGanada, monedaId, cantidad }, config);
}

export function crearMotor(config = defaultConfig) {
  return {
    config,
    crearUsuario: options => crearUsuario(options, config),
    procesarEvento: (user, event) => procesarEvento(user, event, config),
    estaDesbloqueado: (requirement, user) => estaDesbloqueado(requirement, user, config),
    guardarUsuario: (user, storage) => guardarUsuario(user, storage, config),
    cargarUsuario: storage => cargarUsuario(storage, config),
    agregarXP: (user, cantidad, meta) => agregarXP(user, cantidad, config, meta),
    gastarMoneda: (user, monedaId, cantidad, meta) => gastarMoneda(user, monedaId, cantidad, config, meta),
    otorgarMoneda: (user, monedaId, cantidad, meta) => otorgarMoneda(user, monedaId, cantidad, config, meta),
  };
}

export default crearMotor();
