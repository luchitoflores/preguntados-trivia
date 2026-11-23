import defaultConfig from './gamification.config.js';
import { procesarEvento } from './engine.js';
import { calcularEstadisticas, fechaLocal } from './stats.js';
import { obtenerInventario } from './wallet.js';

const eventId = (user, suffix, config) => `${config.recompensas.idPrefijoGenerado}${suffix}-${Date.now()}-${(user.eventos || []).length}`;

export function listarTienda(user, config = defaultConfig) {
  const inventory = obtenerInventario(user, config);
  return (config.tienda?.articulos || []).map(item => ({ ...item, cantidad: inventory[item.id] || 0 }));
}

export function comprarArticulo(user, articuloId, config = defaultConfig, timestamp = new Date().toISOString()) {
  const item = config.tienda?.articulos?.find(entry => entry.id === articuloId);
  if (!item) throw new Error(config.errores.articuloNoDisponible);
  const owned = obtenerInventario(user, config)[item.id] || 0;
  if (item.tipo === 'cosmetico' && owned > config.limites.diasMinimo) throw new Error(config.errores.articuloYaComprado);
  let next = procesarEvento(user, {
    id: eventId(user, 'compra-saldo', config), tipo: config.eventos.monedaGastada,
    monedaId: item.monedaId, cantidad: item.costo, articuloId: item.id, timestamp,
  }, config);
  next = procesarEvento(next, {
    id: eventId(next, 'articulo-comprado', config), tipo: config.eventos.articuloComprado,
    articuloId: item.id, timestamp,
  }, config);
  return next;
}

export function usarArticulo(user, articuloId, config = defaultConfig, timestamp = new Date().toISOString()) {
  const item = config.tienda?.articulos?.find(entry => entry.id === articuloId);
  if (!item || item.tipo !== 'consumible') throw new Error(config.errores.articuloNoDisponible);
  if ((obtenerInventario(user, config)[item.id] || config.limites.diasMinimo) <= config.limites.diasMinimo) throw new Error(config.errores.articuloNoDisponible);
  const effects = {
    'congelar-racha': () => {
      const currentDay = fechaLocal(timestamp, config);
      const [year, month, day] = currentDay.split('-').map(Number);
      const protectedDay = new Date(Date.UTC(year, month - 1, day - config.valores.incremento)).toISOString().slice(0, 10);
      const activity = calcularEstadisticas(user.eventos, config).diasActivos;
      const [py, pm, pd] = protectedDay.split('-').map(Number);
      const precedingDay = new Date(Date.UTC(py, pm - 1, pd - config.valores.incremento)).toISOString().slice(0, 10);
      if (!activity.includes(precedingDay) || activity.includes(protectedDay)) throw new Error(config.errores.rachaNoCongelable);
      return procesarEvento(user, {
        id: eventId(user, 'congelador-usado', config), tipo: config.eventos.congeladorUsado,
        articuloId: item.id, diaProtegido: protectedDay, timestamp,
      }, config);
    },
  };
  const effect = effects[item.efecto];
  if (!effect) throw new Error(config.errores.efectoNoDisponible);
  return effect();
}

export function seleccionarPersonalizacion(user, articuloId, config = defaultConfig) {
  const item = config.tienda?.articulos?.find(entry => entry.id === articuloId && entry.efecto === 'cosmetico');
  if (!item || !(obtenerInventario(user, config)[item.id] > config.limites.diasMinimo)) return user;
  return { ...user, avatar: { ...(user.avatar || {}), personalizacionActual: item.id } };
}
