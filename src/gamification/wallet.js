import defaultConfig from './gamification.config.js';

export function obtenerSaldo(user, monedaId, config = defaultConfig) {
  return (user?.eventos || []).reduce((saldo, event) => {
    if (event.monedaId !== monedaId) return saldo;
    if (event.tipo === config.eventos.monedaGanada) return saldo + (Number(event.cantidad) || config.limites.diasMinimo);
    if (event.tipo === config.eventos.monedaGastada) return saldo - (Number(event.cantidad) || config.limites.diasMinimo);
    return saldo;
  }, config.limites.diasMinimo);
}

export function listarSaldos(user, config = defaultConfig) {
  return config.monedas.map(moneda => ({ ...moneda, saldo: obtenerSaldo(user, moneda.id, config) }));
}

export function obtenerInventario(user, config = defaultConfig) {
  const inventory = Object.fromEntries((config.tienda?.articulos || []).map(item => [item.id, config.limites.diasMinimo]));
  for (const event of user?.eventos || []) {
    if (event.tipo === config.eventos.articuloComprado && Object.hasOwn(inventory, event.articuloId)) inventory[event.articuloId] += config.valores.incremento;
    if (event.tipo === config.eventos.congeladorUsado && Object.hasOwn(inventory, event.articuloId)) inventory[event.articuloId] = Math.max(config.limites.diasMinimo, inventory[event.articuloId] - config.valores.incremento);
  }
  return inventory;
}
