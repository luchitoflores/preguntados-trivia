import defaultConfig from './gamification.config.js';
import { procesarEvento } from './engine.js';

function slug(value) {
  return String(value).replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-|-$/g, '');
}

/** Aplica premios comunes y deja un evento de reclamo para hacerlos idempotentes. */
export function reclamarRecompensas(user, clave, recompensas = [], config = defaultConfig, timestamp = new Date().toISOString(), meta = {}) {
  const claimKey = String(clave);
  const alreadyClaimed = (user.eventos || []).some(event => event.tipo === config.eventos.recompensaReclamada && event.recompensaKey === claimKey);
  if (alreadyClaimed) throw new Error(config.errores.recompensaYaReclamada);

  let updated = user;
  for (const [index, reward] of recompensas.entries()) {
    const amount = Number(reward.cantidad);
    if (reward.tipo === 'xp' && Number.isFinite(amount) && amount > config.limites.diasMinimo) {
      updated = procesarEvento(updated, {
        ...meta, id: `${config.recompensas.idPrefijoGenerado}reward-xp-${slug(claimKey)}-${index}`,
        tipo: config.eventos.xp, cantidad: amount, timestamp, recompensaKey: claimKey,
      }, config);
    } else if (reward.tipo === 'moneda' && Number.isFinite(amount) && amount > config.limites.diasMinimo) {
      updated = procesarEvento(updated, {
        ...meta, id: `${config.recompensas.idPrefijoGenerado}reward-currency-${slug(claimKey)}-${index}`,
        tipo: config.eventos.monedaGanada, monedaId: reward.monedaId, cantidad: amount, timestamp, recompensaKey: claimKey,
      }, config);
    } else if (reward.tipo === 'badge' && reward.badgeId) {
      const owned = new Set(updated.badges || []);
      owned.add(reward.badgeId);
      updated = { ...updated, badges: [...owned] };
    } else if (reward.tipo === 'medalla-mensual') {
      const medals = new Set(updated.medallasMensuales || []);
      medals.add(reward.medallaId || claimKey);
      updated = { ...updated, medallasMensuales: [...medals] };
    } else if (reward.tipo === 'articulo' && reward.articuloId) {
      updated = procesarEvento(updated, {
        ...meta, id: `${config.recompensas.idPrefijoGenerado}reward-item-${slug(claimKey)}-${index}`,
        tipo: config.eventos.articuloComprado, articuloId: reward.articuloId, timestamp, recompensaKey: claimKey,
      }, config);
    }
  }

  return procesarEvento(updated, {
    id: `${config.recompensas.idPrefijoGenerado}claim-${slug(claimKey)}`,
    tipo: config.eventos.recompensaReclamada, recompensaKey: claimKey, timestamp, ...meta,
  }, config);
}

export default reclamarRecompensas;
