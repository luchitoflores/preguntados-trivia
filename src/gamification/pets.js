import defaultConfig from './gamification.config.js';
import { estaDesbloqueado } from './engine.js';

export function listarMascotas(user, config = defaultConfig) {
  return config.mascotas.map(pet => ({
    ...pet,
    desbloqueado: estaDesbloqueado(pet.seDesbloqueaCon, user, config),
    poder: null,
  }));
}

export function seleccionarMascota(user, mascotaId, config = defaultConfig) {
  const pet = config.mascotas.find(item => item.id === mascotaId);
  if (!pet || !estaDesbloqueado(pet.seDesbloqueaCon, user, config)) return user;
  return { ...user, avatar: { ...(user.avatar || {}), mascotaActual: mascotaId } };
}
