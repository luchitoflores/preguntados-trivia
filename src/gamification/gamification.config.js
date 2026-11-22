// Configuración editable del sistema de gamificación.
// Los módulos del motor solo definen cómo interpretar estos datos.
const gamificationConfig = {
  persistencia: { claveUsuario: 'gamification-user-v3' },
  calendario: {
    zonaHoraria: 'America/Guayaquil',
    milisegundosPorDia: 86400000,
    toleranciaDiasInactivos: 1,
    diferenciasDiasConsecutivos: 1,
    pasos: 1,
    horaCiclo: 'h23',
    formatoHora: '2-digit',
    formatoFecha: '2-digit',
  },
  limites: { xpMinimo: 0, diasMinimo: 0 },
  valores: { incremento: 1 },
  perfil: { nombreInicial: '', trajeInicial: null, mascotaInicial: null },
  errores: {
    idRequerido: 'Se requiere un identificador de usuario.',
    tipoEventoRequerido: 'El evento debe indicar su tipo.',
  },
  eventos: {
    xp: 'xp-ganado',
    rueda: 'rueda-jugada',
    corona: 'corona-ganada',
    actividadDiaria: 'dia-activo',
  },
  // maxXP es inclusivo; usa null para la última liga sin techo.
  ligas: [
    { id: 'bronce', nombre: 'Bronce', copa: '🥉', minXP: 0, maxXP: 999, color: '#b87333' },
    { id: 'plata', nombre: 'Plata', copa: '🥈', minXP: 1000, maxXP: 4999, color: '#8b98a5' },
    { id: 'oro', nombre: 'Oro', copa: '🥇', minXP: 5000, maxXP: 14999, color: '#d7a928' },
    { id: 'diamante', nombre: 'Diamante', copa: '💎', minXP: 15000, maxXP: null, color: '#52c7d8' },
  ],
  badges: [
    { id: 'nocturno', nombre: 'Filósofo Nocturno', icono: '🌙', descripcion: 'Juega en el horario nocturno indicado.', tipo: 'por-hora', parametro: { horaDesde: 23, horaHasta: 5, vecesNecesarias: 2 } },
    { id: 'racha-7', nombre: 'Imparable', icono: '🔥', descripcion: 'Mantén la racha diaria indicada.', tipo: 'por-racha', parametro: { diasNecesarios: 7 } },
    { id: 'cazador-6', nombre: 'Cazador de coronas', icono: '👑', descripcion: 'Consigue la cantidad indicada de coronas.', tipo: 'por-coronas', parametro: { coronasNecesarias: 6 } },
    { id: 'ruleta-10', nombre: 'Viajero de la ruleta', icono: '🎡', descripcion: 'Repite una acción la cantidad indicada de veces.', tipo: 'por-repeticion', parametro: { accion: 'jugar-rueda', vecesNecesarias: 10 } },
    { id: 'mejor-dia-500', nombre: 'Día brillante', icono: '☀️', descripcion: 'Alcanza la meta diaria de XP.', tipo: 'por-xp-dia', parametro: { xpMinimoEnUnDia: 500 } },
  ],
  trajes: [
    { id: 'toga', nombre: 'Toga clásica', imagen: '🏛️', seDesbloqueaCon: 'liga-bronce', costoGemas: 0 },
    { id: 'laureles', nombre: 'Laureles', imagen: '🌿', seDesbloqueaCon: 'badge-nocturno', costoGemas: 0 },
    { id: 'sabio', nombre: 'Sabio de oro', imagen: '🦉', seDesbloqueaCon: 'xp-1000', costoGemas: 100 },
  ],
  // Colección sin poderes. poder: null queda reservado para TODO v4.
  mascotas: [
    { id: 'buho', nombre: 'Búho', imagen: '🦉', seDesbloqueaCon: 'liga-bronce', poder: null },
    { id: 'zorro', nombre: 'Zorro', imagen: '🦊', seDesbloqueaCon: 'badge-racha-7', poder: null },
  ],
  reglasDesbloqueo: [
    { prefijo: 'liga-', tipo: 'liga-minima' },
    { prefijo: 'corona-', tipo: 'corona' },
    { prefijo: 'badge-', tipo: 'badge' },
    { prefijo: 'xp-', tipo: 'xp-minimo' },
  ],
  interfaz: {
    tituloTrajes: 'Trajes de avatar',
    tituloTrajes: 'Trajes de avatar',
    seleccionar: 'Seleccionar',
    seleccionado: 'Seleccionado',
    bloqueado: 'Bloqueado',
    desbloqueaCon: 'Se desbloquea con',
    costoGemas: 'Gemas',
  },
};

export default gamificationConfig;
