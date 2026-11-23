# Preguntas Filosofía - Ruleta

Aplicación independiente de trivia filosófica construida con React, Vite y JavaScript. Conserva el motor de ruleta existente y añade un esquema común para preguntas con recursos multimedia y un editor local.

## Desarrollo

```bash
npm install
npm run dev
```

## GitHub Pages

El flujo de trabajo publica `dist` en cada push a `main`. Habilita Pages en Settings → Pages → GitHub Actions.

Enlace: https://luchitoflores.github.io/preguntados-trivia/

## APK

Cada push a `main` ejecuta la compilación Android. Ve a Actions → último run → Artifacts → `app-apk` para descargar el APK de depuración.

## Contenido del juego

Las preguntas del framework se pueden importar o exportar como JSON. Las preguntas creadas en el editor se guardan localmente en el navegador y los medios se almacenan como base64 en el mismo dispositivo.

Modo admin disponible bajo solicitud.

## Framework de gamificación

El [playground de gamificación](https://luchitoflores.github.io/preguntados-trivia/playground/) presenta una implementación configurable de muestra. Usa la rueda dentada para editar nombres, escalas, ligas, insignias, calendarios, premios, misiones, colecciones, temporadas, ruedas y tienda. En la pantalla principal puedes simular rachas, actividad, puntos, hitos y reclamos. El perfil del playground se guarda por separado en este dispositivo.

El núcleo de `src/gamification/` tiene valores neutrales y es independiente de Filosofía y de la interfaz. `playground/gamification.example.config.js` contiene la implementación de muestra: “Ideas”, filósofos, escuelas y premios son datos que se pueden sustituir al adaptar el motor a otra app. Las ligas del ejemplo representan metas personales por periodo y no muestran jugadores ficticios.
