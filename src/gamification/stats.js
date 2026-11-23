import defaultConfig from './gamification.config.js';

function dateParts(value, config) {
  const date = value instanceof Date ? value : new Date(value);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.calendario.zonaHoraria,
    year: 'numeric', month: config.calendario.formatoFecha, day: config.calendario.formatoFecha,
    hour: config.calendario.formatoHora, hourCycle: config.calendario.horaCiclo,
  });
  return Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
}

export function fechaLocal(value, config = defaultConfig) {
  const parts = dateParts(value, config);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function horaLocal(value, config = defaultConfig) {
  return Number(dateParts(value, config).hour);
}

export function calcularEstadisticas(eventos = [], config = defaultConfig) {
  const stats = {
    vecesPorHorario: {},
    vecesPorRueda: {},
    xpPorDia: {},
    mejorDia: { fecha: null, xp: config.limites.xpMinimo },
    coronas: config.limites.diasMinimo,
    coronasPorRueda: {},
    coronasPorTema: {},
    diasActivos: [],
    diasParaRacha: [],
    diasConectadoAcumulados: config.limites.diasMinimo,
    vecesPorAccion: {},
  };
  const days = new Set();
  const streakDays = new Set();
  const activityTypes = new Set((config.actividad?.eventosQueCuentan || []).map(key => config.eventos[key]).filter(Boolean));

  for (const event of eventos) {
    if (!event?.timestamp || Number.isNaN(new Date(event.timestamp).getTime())) continue;
    const day = fechaLocal(event.timestamp, config);
    const hour = String(horaLocal(event.timestamp, config));
    if (activityTypes.has(event.tipo)) {
      days.add(day);
      streakDays.add(day);
    }
    // El congelador salva la secuencia de racha, pero no simula un día conectado.
    if (event.tipo === config.eventos.congeladorUsado && /^\d{4}-\d{2}-\d{2}$/.test(event.diaProtegido || '')) streakDays.add(event.diaProtegido);

    if (event.tipo === config.eventos.xp) {
      const parsedAmount = Number(event.cantidad);
      const amount = Number.isFinite(parsedAmount) ? parsedAmount : config.limites.xpMinimo;
      stats.xpPorDia[day] = (stats.xpPorDia[day] || config.limites.xpMinimo) + amount;
    }
    if (event.tipo === config.eventos.rueda) {
      stats.vecesPorHorario[hour] = (stats.vecesPorHorario[hour] || config.limites.diasMinimo) + config.valores.incremento;
      if (event.rueda) stats.vecesPorRueda[event.rueda] = (stats.vecesPorRueda[event.rueda] || config.limites.diasMinimo) + config.valores.incremento;
    }
    if (event.accion) stats.vecesPorAccion[event.accion] = (stats.vecesPorAccion[event.accion] || config.limites.diasMinimo) + config.valores.incremento;
    if (event.tipo === config.eventos.corona) {
      stats.coronas += config.valores.incremento;
      if (event.rueda) stats.coronasPorRueda[event.rueda] = (stats.coronasPorRueda[event.rueda] || config.limites.diasMinimo) + config.valores.incremento;
      if (event.tema) stats.coronasPorTema[event.tema] = (stats.coronasPorTema[event.tema] || config.limites.diasMinimo) + config.valores.incremento;
    }
  }

  stats.diasActivos = [...days].sort();
  stats.diasParaRacha = [...streakDays].sort();
  stats.diasConectadoAcumulados = stats.diasActivos.length;
  for (const [day, xp] of Object.entries(stats.xpPorDia)) {
    if (xp > stats.mejorDia.xp) stats.mejorDia = { fecha: day, xp };
  }
  return stats;
}

export function obtenerHoraEnRango(stats, { horaDesde, horaHasta }, config = defaultConfig) {
  const counts = stats?.vecesPorHorario || {};
  const matches = hour => horaDesde <= horaHasta
    ? hour >= horaDesde && hour < horaHasta
    : hour >= horaDesde || hour < horaHasta;
  return Object.entries(counts).reduce((total, [hour, count]) => total + (matches(Number(hour)) ? count : config.limites.diasMinimo), config.limites.diasMinimo);
}
