import defaultConfig from './gamification.config.js';
import { revisarBadges } from './badges.js';
import { calcularRacha } from './streaks.js';
import { calcularEstadisticas } from './stats.js';
import { obtenerLiga } from './leagues.js';

export function crearUsuario({ id = globalThis.crypto?.randomUUID?.(), nombre } = {}, config = defaultConfig) {
  if (!id) throw new Error(config.errores.idRequerido);
  const user = {
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
  const league = obtenerLiga(user.xp, config);
  return revisarBadges({ ...user, ligaId: league?.id || null, stats }, config);
}

export function procesarEvento(user, event, config = defaultConfig) {
  if (!event?.tipo) throw new Error(config.errores.tipoEventoRequerido);
  const timestamp = event.timestamp || new Date().toISOString();
  const normalized = { ...event, timestamp };
  const events = [...(user.eventos || []), normalized];
  const requestedXP = Number(normalized.cantidad);
  const xpDelta = normalized.tipo === config.eventos.xp && Number.isFinite(requestedXP) ? requestedXP : config.limites.xpMinimo;
  const currentXP = Number(user.xp);
  const safeXP = Number.isFinite(currentXP) ? currentXP : config.limites.xpMinimo;
  const nextXP = Math.max(config.limites.xpMinimo, safeXP + xpDelta);
  const nextUser = actualizarDerivados({ ...user, xp: nextXP, eventos: events }, new Date(timestamp), config);
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
    return false;
  }
  return false;
}

export function guardarUsuario(user, storage = globalThis.localStorage, config = defaultConfig) {
  storage?.setItem(config.persistencia.claveUsuario, JSON.stringify(user));
  return user;
}

export function cargarUsuario(storage = globalThis.localStorage, config = defaultConfig) {
  const saved = storage?.getItem(config.persistencia.claveUsuario);
  return saved ? JSON.parse(saved) : null;
}

export function crearMotor(config = defaultConfig) {
  return {
    config,
    crearUsuario: options => crearUsuario(options, config),
    procesarEvento: (user, event) => procesarEvento(user, event, config),
    estaDesbloqueado: (requirement, user) => estaDesbloqueado(requirement, user, config),
    guardarUsuario: (user, storage) => guardarUsuario(user, storage, config),
    cargarUsuario: storage => cargarUsuario(storage, config),
  };
}

export default crearMotor();
