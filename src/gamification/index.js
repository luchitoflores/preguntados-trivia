export { default as gamificationConfig } from './gamification.config.js';
export { default as gamificationEngine, crearMotor, crearUsuario, procesarEvento, estaDesbloqueado, guardarUsuario, cargarUsuario } from './engine.js';
export { revisarBadges, listarBadges } from './badges.js';
export { calcularRacha } from './streaks.js';
export { calcularEstadisticas, fechaLocal, horaLocal, obtenerHoraEnRango } from './stats.js';
export { obtenerLiga, progresoLiga } from './leagues.js';
export { listarMascotas, seleccionarMascota } from './pets.js';
export { AvatarPicker, seleccionarTraje } from './avatar.js';
