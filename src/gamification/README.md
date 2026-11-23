# Framework de gamificación

Paquete JavaScript independiente de cualquier juego. `src/gamification/` contiene lógica JavaScript sin interfaz; `playground/` es un ejemplo visual con una configuración temática de Filosofía. No requiere servidor ni APIs externas.

## Vistas de componentes

El playground se publica junto al juego en `https://luchitoflores.github.io/preguntados-trivia/playground/`. La página antigua `/gamification-demo.html` redirige allí. Los controles de configuración y simulación viven en `playground/` y envían eventos al motor; no implementan reglas de recompensas.

La página de prueba usa claves locales independientes y no cambia el almacenamiento de la partida. La pantalla principal muestra acciones y resultados; la rueda dentada abre los parámetros. Incluye pruebas de racha actual e histórica, hitos de días, calendario mensual, premios por mes perfecto y por puntos, misiones diarias/semanales, ligas personales con ascenso o descenso semanal, colecciones, niveles, temporadas, mascotas, tienda y ruedas. No muestra posiciones de otros jugadores.

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

`gamification.config.js` solo aporta valores neutros de respaldo. Para una app, define y pasa su propio objeto de configuración a `crearMotor(config)`. El archivo `playground/gamification.example.config.js` es una implementación de muestra con “Ideas”, filósofos, escuelas y reglas editables. Otra app puede sustituir esos datos por sus propias etapas, ligas, insignias, hitos, objetivos, colecciones, premios, monedas, tienda, avatar y etiquetas. El anfitrión traduce sus acciones a eventos estándar; el motor evalúa sus criterios sin conocer el tema del juego.

### Adaptar a otro juego

1. Copia `playground/gamification.example.config.js` a la carpeta de configuración de tu aplicación.
2. Cambia textos, etapas, ligas, monedas, hitos, condiciones, colecciones y premios para la temática y economía de ese juego.
3. Crea el motor con `crearMotor(config)` y traduce sus acciones a los tipos de `config.eventos` con IDs estables.

Los trajes y mascotas se generan recorriendo configuración. Las mascotas son coleccionables sin poderes y `seleccionarMascota` permite equiparlas. `comprarArticulo` valida saldo e inventario; `usarArticulo` procesa efectos declarados en la tienda. `reclamarRecompensas` centraliza premios idempotentes para misiones, hitos, medallas y colecciones. `obtenerCalendario` devuelve días conectados; `listarPremiosMensuales` y `reclamarPremioMensual` gestionan premios; `listarHitosDias` y `reclamarHitoDias` exponen metas acumuladas; `listarColecciones` y `reclamarRecompensaColeccion` gestionan colecciones. `calcularLigaPersonal` calcula ascenso o descenso a partir del XP del periodo y no simula rivales.

## Persistencia y temporadas

`crearAdaptadorLocal()` usa localStorage; `crearAdaptadorMemoria()` sirve para pruebas, SSR o una aplicación que administre su estado en memoria. `crearMotor(config)` acepta configuración personalizada. Carga y guardado reciben un objeto compatible con Web Storage. `migrarUsuario` y `migrarTemporada` permiten registrar funciones de migración por versión sin acoplar el paquete a un proveedor externo.

Los perfiles y sus eventos pueden guardarse localmente o mediante un adaptador del anfitrión. Las ligas son individuales, basadas en metas de XP por periodo; no son una clasificación de personas. Clasificaciones en línea, sincronización, autenticación, pagos y protección antitrampa requieren después un servicio externo y quedan fuera del núcleo offline.

## Separación visual

El motor no contiene HTML ni CSS. `playground/` demuestra una forma de usarlo y puede cambiarse sin tocar la lógica. Para integrarlo en Preguntados u otra app, importa las funciones desde `src/gamification/index.js`, conecta eventos del juego y diseña componentes visuales propios.
