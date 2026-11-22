import { createElement as h } from 'react';
import defaultConfig from './gamification.config.js';
import { estaDesbloqueado, guardarUsuario } from './engine.js';

function esImagen(value) {
  return /^(https?:|\/|\.\.?\/)/i.test(value || '');
}

export function seleccionarTraje(user, trajeId) {
  return { ...user, avatar: { ...(user.avatar || {}), trajeActual: trajeId } };
}

export function AvatarPicker({ user, onChange, storage = globalThis.localStorage, config = defaultConfig }) {
  return h('div', { className: 'avatar-picker', 'aria-label': config.interfaz.tituloTrajes }, config.trajes.map(traje => {
      const unlocked = estaDesbloqueado(traje.seDesbloqueaCon, user, config);
      const selected = user?.avatar?.trajeActual === traje.id;
      const select = () => {
          if (!unlocked) return;
          const updated = seleccionarTraje(user, traje.id);
          guardarUsuario(updated, storage, config);
          onChange?.(updated);
        };
      return h('button', {
        key: traje.id, type: 'button', className: 'avatar-picker-item', disabled: !unlocked,
        'aria-pressed': selected,
        title: unlocked ? traje.nombre : `${config.interfaz.bloqueado}: ${traje.seDesbloqueaCon}`,
        onClick: select,
      },
      esImagen(traje.imagen)
        ? h('img', { src: traje.imagen, alt: '' })
        : h('span', { className: 'avatar-picker-emoji', 'aria-hidden': true }, traje.imagen),
      h('span', null, traje.nombre),
      h('small', null, `${config.interfaz.costoGemas}: ${traje.costoGemas}`),
      !unlocked && h('small', null, `${config.interfaz.desbloqueaCon}: ${traje.seDesbloqueaCon}`),
      h('small', null, selected ? config.interfaz.seleccionado : unlocked ? config.interfaz.seleccionar : config.interfaz.bloqueado));
    }));
}
