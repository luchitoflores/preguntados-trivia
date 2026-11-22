# Framework de gamificación

El framework es independiente de la interfaz y funciona en JavaScript. Los nombres, umbrales, ligas, insignias, trajes, mascotas, eventos, reglas de desbloqueo, textos y calendario editables están en `gamification.config.js`.

## Inicio y eventos

```js
import { crearMotor } from './gamification/index.js';

const gamification = crearMotor();
let user = gamification.crearUsuario({ id: 'user-001', nombre: 'Ada' });

user = gamification.procesarEvento(user, {
  tipo: gamification.config.eventos.rueda,
  rueda: 'caverna',
  accion: 'jugar-rueda',
  timestamp: new Date().toISOString(),
});
user = gamification.procesarEvento(user, {
  tipo: gamification.config.eventos.xp,
  cantidad: 25,
  timestamp: new Date().toISOString(),
});
gamification.guardarUsuario(user);
```

Para una corona se usa `config.eventos.corona` y se envían `rueda` o `tema`. La racha se deriva de los días de los eventos reconocidos. Las estadísticas se reconstruyen desde `user.eventos`; `vecesPorHorario`, `vecesPorRueda`, XP diaria, mejor día y coronas no se editan a mano.

## Interfaz de avatar

`AvatarPicker` itera `config.trajes`, comprueba `seDesbloqueaCon`, persiste el cambio con la clave de `config.persistencia.claveUsuario` y entrega el usuario actualizado por `onChange`. Acepta imágenes mediante una ruta o URL, y texto/emoji como alternativa. `listarMascotas` expone la colección sin poderes.

## Portabilidad

Se puede crear una configuración propia y pasarla a `crearMotor(config)`, a `AvatarPicker` y a las funciones de catálogo. Para cambiar reglas de juego, edita la configuración; para cambiar una mecánica nueva que no figure entre los tipos documentados, agrega su evaluador correspondiente al módulo del motor.
