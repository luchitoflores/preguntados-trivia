import defaultConfig from './gamification.config.js';
import { estaDesbloqueado } from './engine.js';
import { reclamarRecompensas } from './rewards.js';

export function listarColecciones(user, config = defaultConfig) {
  return (config.colecciones || []).map(collection => {
    const items = (collection.items || []).map(item => ({ ...item, desbloqueado: estaDesbloqueado(item.seDesbloqueaCon, user, config) }));
    const unlocked = items.filter(item => item.desbloqueado).length;
    const claimKey = `coleccion:${collection.id}`;
    const claimed = (user?.eventos || []).some(event => event.tipo === config.eventos.recompensaReclamada && event.recompensaKey === claimKey);
    return { ...collection, items, desbloqueados: unlocked, total: items.length, completa: items.length > 0 && unlocked === items.length, reclamada: claimed, disponible: items.length > 0 && unlocked === items.length && !claimed, clave: claimKey };
  });
}

export function reclamarRecompensaColeccion(user, collectionId, config = defaultConfig, timestamp = new Date().toISOString()) {
  const collection = listarColecciones(user, config).find(item => item.id === collectionId);
  if (!collection?.disponible) throw new Error(config.errores.recompensaNoDisponible);
  return reclamarRecompensas(user, collection.clave, collection.recompensas || [], config, timestamp, { coleccionId: collectionId });
}

export default listarColecciones;
