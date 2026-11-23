import defaultConfig from './gamification.config.js';
import { fechaLocal } from './stats.js';
import { reclamarRecompensas } from './rewards.js';

const pad = value => String(value).padStart(2, '0');
const monthKeyFor = (date, config) => fechaLocal(date, config).slice(0, 7);

export function obtenerClavePeriodo(value = new Date(), periodicidad = 'diaria', config = defaultConfig) {
  if (Number.isNaN(new Date(value).getTime())) return '';
  const local = fechaLocal(value, config);
  if (periodicidad === 'diaria') return local;
  if (periodicidad === 'semanal') {
    const [year, month, day] = local.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const shift = (date.getUTCDay() - config.calendario.inicioSemana + config.calendario.diasPorSemana) % config.calendario.diasPorSemana;
    date.setUTCDate(date.getUTCDate() - shift);
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }
  if (periodicidad === 'mensual') return monthKeyFor(value, config);
  if (periodicidad === 'anual') return local.slice(0, 4);
  return 'total';
}

export function rangoPeriodo(key, periodicidad = 'diaria', config = defaultConfig) {
  let start;
  if (periodicidad === 'semanal') start = `${key}T00:00:00.000Z`;
  else if (periodicidad === 'mensual') start = `${key}-01T00:00:00.000Z`;
  else if (periodicidad === 'anual') start = `${key}-01-01T00:00:00.000Z`;
  else start = `${key}T00:00:00.000Z`;
  const startDate = new Date(start);
  const endDate = new Date(startDate);
  if (periodicidad === 'semanal') endDate.setUTCDate(endDate.getUTCDate() + config.calendario.diasPorSemana);
  else if (periodicidad === 'mensual') endDate.setUTCMonth(endDate.getUTCMonth() + config.valores.incremento);
  else if (periodicidad === 'anual') endDate.setUTCFullYear(endDate.getUTCFullYear() + config.valores.incremento);
  else endDate.setUTCDate(endDate.getUTCDate() + config.valores.incremento);
  return { inicio: startDate, fin: endDate };
}

export function obtenerCalendario(user, year, month, config = defaultConfig) {
  const key = `${year}-${pad(month)}`;
  const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (firstWeekday - config.calendario.inicioSemana + config.calendario.diasPorSemana) % config.calendario.diasPorSemana;
  const active = new Set((user?.stats?.diasActivos || []).filter(day => day.startsWith(`${key}-`)));
  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = `${key}-${pad(index + config.valores.incremento)}`;
    return { fecha: date, dia: index + config.valores.incremento, activo: active.has(date) };
  });
  return { clave: key, dias: days, espaciosIniciales: offset, diasActivos: active.size, diasTotales: totalDays };
}

function xpEnMes(user, monthKey, config) {
  return (user?.eventos || []).reduce((total, event) => {
    if (event.tipo !== config.eventos.xp || Number.isNaN(new Date(event.timestamp).getTime()) || fechaLocal(event.timestamp, config).slice(0, 7) !== monthKey) return total;
    const amount = Number(event.cantidad);
    return total + (Number.isFinite(amount) ? amount : config.limites.xpMinimo);
  }, config.limites.xpMinimo);
}

export function listarPremiosMensuales(user, monthKey, config = defaultConfig) {
  const calendar = obtenerCalendario(user, ...monthKey.split('-').map(Number), config);
  const currentMonth = monthKeyFor(new Date(), config);
  return (config.calendario.premiosMensuales || []).map(item => {
    const xp = xpEnMes(user, monthKey, config);
    const complete = item.tipo === 'todos-los-dias' ? calendar.diasActivos === calendar.diasTotales : xp >= Number(item.puntosNecesarios || config.limites.diasMinimo);
    const claimKey = `premio-mensual:${monthKey}:${item.id}`;
    const claimed = (user?.eventos || []).some(event => event.tipo === config.eventos.recompensaReclamada && event.recompensaKey === claimKey);
    return { ...item, progreso: item.tipo === 'todos-los-dias' ? calendar.diasActivos : Math.min(xp, Number(item.puntosNecesarios) || config.limites.diasMinimo), objetivo: item.tipo === 'todos-los-dias' ? calendar.diasTotales : Number(item.puntosNecesarios) || config.limites.diasMinimo, completa: complete, reclamada: claimed, disponible: complete && !claimed, periodoCerrado: monthKey < currentMonth, clave: claimKey };
  });
}

export function reclamarPremioMensual(user, monthKey, premioId, config = defaultConfig, timestamp = new Date().toISOString()) {
  const prize = listarPremiosMensuales(user, monthKey, config).find(item => item.id === premioId);
  if (!prize?.disponible) throw new Error(config.errores.recompensaNoDisponible);
  return reclamarRecompensas(user, prize.clave, prize.recompensas, config, timestamp, { mes: monthKey, premioMensualId: premioId });
}

export default obtenerCalendario;
