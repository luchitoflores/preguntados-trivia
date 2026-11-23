import defaultConfig from './gamification.config.js';
import { fechaLocal } from './stats.js';
import { obtenerClavePeriodo, rangoPeriodo } from './calendar.js';

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

/** Liga individual sin ranking de rivales; los cortes semanales se calculan desde el historial. */
export function calcularLigaPersonal(user, config = defaultConfig, reference = new Date()) {
  const ordered = [...config.ligas].sort((a, b) => a.minXP - b.minXP);
  if (!ordered.length) return null;
  const period = config.competenciaIndividual?.periodicidad || 'semanal';
  const currentPeriod = obtenerClavePeriodo(reference, period, config);
  const weeklyXP = new Map();
  let firstPeriod = currentPeriod;
  for (const event of user?.eventos || []) {
    if (event.tipo !== config.eventos.xp || Number.isNaN(new Date(event.timestamp).getTime())) continue;
    const key = obtenerClavePeriodo(event.timestamp, period, config);
    if (key < firstPeriod) firstPeriod = key;
    const amount = Number(event.cantidad);
    weeklyXP.set(key, (weeklyXP.get(key) || config.limites.xpMinimo) + (Number.isFinite(amount) ? amount : config.limites.xpMinimo));
  }

  let leagueIndex = Math.max(config.limites.diasMinimo, ordered.findIndex(item => item.id === config.competenciaIndividual?.ligaInicialId));
  const history = [];
  const midday = config.calendario.horaReferencia * config.calendario.milisegundosPorHora;
  const end = new Date(rangoPeriodo(currentPeriod, period, config).inicio.getTime() + midday);
  let cursor = new Date(rangoPeriodo(firstPeriod, period, config).inicio.getTime() + midday);
  let guard = 0;
  while (cursor < end && guard < (config.competenciaIndividual.maxPeriodosHistorial || config.calendario.maxPeriodosLiga)) {
    const key = obtenerClavePeriodo(cursor, period, config);
    const league = ordered[leagueIndex];
    const score = weeklyXP.get(key) || config.limites.diasMinimo;
    const promoted = config.competenciaIndividual.ascensoAutomatico && leagueIndex < ordered.length - config.valores.incremento && Number(league.xpParaAscender) > config.limites.diasMinimo && score >= league.xpParaAscender;
    const demoted = config.competenciaIndividual.descensoAutomatico && leagueIndex > config.limites.diasMinimo && score < Number(league.xpMinimoMantener || config.limites.diasMinimo);
    history.push({ periodo: key, ligaId: league.id, xp: score, cambio: promoted ? 'ascenso' : demoted ? 'descenso' : 'sin-cambio' });
    if (promoted) leagueIndex += config.valores.incremento;
    else if (demoted) leagueIndex -= config.valores.incremento;
    if (period === 'diaria') cursor.setUTCDate(cursor.getUTCDate() + config.valores.incremento);
    else if (period === 'semanal') cursor.setUTCDate(cursor.getUTCDate() + config.calendario.diasPorSemana);
    else if (period === 'anual') cursor.setUTCFullYear(cursor.getUTCFullYear() + config.valores.incremento);
    else cursor.setUTCMonth(cursor.getUTCMonth() + config.valores.incremento);
    guard += config.valores.incremento;
  }

  const liga = ordered[leagueIndex];
  const xpPeriodo = weeklyXP.get(currentPeriod) || config.limites.diasMinimo;
  const siguiente = leagueIndex < ordered.length - config.valores.incremento ? ordered[leagueIndex + config.valores.incremento] : null;
  const paraAscender = Number(liga.xpParaAscender) || config.limites.diasMinimo;
  const paraMantener = Number(liga.xpMinimoMantener) || config.limites.diasMinimo;
  return {
    liga, siguiente, periodo: currentPeriod, xpPeriodo,
    xpParaAscender: paraAscender,
    xpFaltanteAscenso: siguiente && paraAscender > config.limites.diasMinimo ? Math.max(config.limites.diasMinimo, paraAscender - xpPeriodo) : null,
    xpParaMantener: paraMantener,
    enRiesgo: leagueIndex > config.limites.diasMinimo && xpPeriodo < paraMantener,
    porcentajeAscenso: paraAscender > config.limites.diasMinimo ? Math.min(100, xpPeriodo / paraAscender * 100) : 100,
    mostrarPosicionesDeOtros: Boolean(config.competenciaIndividual.mostrarPosicionesDeOtros),
    historial,
  };
}
