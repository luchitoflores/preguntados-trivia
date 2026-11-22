# Framework de gamificación

Paquete JavaScript independiente del juego Preguntados. Incluye reglas por configuración, motor de eventos, progresión, estadísticas derivadas, ligas, insignias, rachas, misiones, monedas, temporada local, trajes y colección de mascotas. No requiere servidor ni APIs externas.

## Vistas de componentes

El playground se publica junto al juego en `https://luchitoflores.github.io/preguntados-trivia/playground/`. La página antigua `/gamification-demo.html` redirige allí. Los controles de configuración y simulación viven en `playground/` y envían eventos al motor; no implementan reglas de recompensas.

La página de prueba usa una clave local independiente, guarda sus parámetros/progreso en el dispositivo y no cambia el almacenamiento de la partida. El diseño es una sola vista vertical con panel de parámetros, simulador y resultados en vivo; no se añade al menú ni al flujo del juego.

## Inicio

```js
import { crearMotor, gamificationConfig } from './src/gamification/index.js';

const motor = crearMotor(gamificationConfig);
let usuario = motor.crearUsuario({ id: 'usuario-1', nombre: 'Ada' });
usuario = motor.procesarEvento(usuario, {
  id: 'partida-1-giro-1',
  tipo: motor.config.eventos.rueda,
  rueda: 'caverna',
  accion: 'jugar-rueda',
  timestamp: new Date().toISOString(),
});
usuario = motor.agregarXP(usuario, 25, { id: 'partida-1-xp-1' });
motor.guardarUsuario(usuario);
```

Cada evento debe tener ID estable cuando el anfitrión pueda reintentarlo. El motor ignora IDs ya procesados para evitar XP, monedas o estadísticas duplicadas. El historial local es la fuente de verdad; estadísticas, progreso y saldos se derivan de ese historial.

## Configuración y extensibilidad

Edita `gamification.config.js` para cambiar niveles, ligas, insignias, objetivos de misión, premios, temporada, monedas, trajes, mascotas, desbloqueos, textos, calendario y límites. Los tipos de condición de badges y los objetivos de misión son mecánicas del motor; sus umbrales y contenidos son datos. Usa `config.eventos` como catálogo de tipos de evento. Para nuevas reglas de dominio, añade un evaluador genérico reutilizable en su módulo, sin acoplarlo a una aplicación.

Los trajes y mascotas se generan recorriendo configuración. Las mascotas son coleccionables sin poderes. El coste de traje se expone como dato; la compra debe ser llamada explícitamente por la aplicación anfitriona mediante el módulo monedero y su propio flujo de confirmación.

## Persistencia y temporadas

`crearAdaptadorLocal()` usa localStorage; `crearAdaptadorMemoria()` sirve para pruebas, SSR o una aplicación que administre su estado en memoria. `crearMotor(config)` acepta configuración personalizada. Carga y guardado reciben un objeto compatible con Web Storage. `migrarUsuario` y `migrarTemporada` permiten registrar funciones de migración por versión sin acoplar el paquete a un proveedor externo.

La temporada y los usuarios guardados por esta versión permanecen en el dispositivo. Las clasificaciones entre dispositivos, sincronización, autenticación, pagos y protección antitrampa requieren después un servicio externo; no forman parte de este paquete offline.

## Capa visual React opcional

```jsx
import { ProfileCard, XPProgress, BadgeGallery, MissionBoard } from './gamification-ui/index.js';

<ProfileCard user={usuario} config={config} />
<XPProgress user={usuario} config={config} />
<BadgeGallery user={usuario} config={config} />
<MissionBoard user={usuario} config={config} onClaim={reclamar} />
```

Los componentes React están separados en `gamification-ui/`, fuera de `src/gamification/`. Importa `gamification-ui/base.css` si quieres usar el estilo del playground o aplica tus propios estilos. También puedes importar solo la API lógica desde `src/gamification/index.js`; una app puede presentar los datos con su propia interfaz.
