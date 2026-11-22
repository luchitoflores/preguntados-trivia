import React from 'react';
import defaultConfig from '../src/gamification/gamification.config.js';
import { estaDesbloqueado, guardarUsuario } from '../src/gamification/engine.js';
import { seleccionarTraje } from '../src/gamification/avatar.js';

const esImagen = value => /^(https?:|\/|\.\.?\/|data:image\/)/i.test(value || '');
const rutaImagen = value => value?.startsWith('/') ? `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}` : value;

export function AvatarPicker({ user, onChange, storage = globalThis.localStorage, config = defaultConfig }) {
  return <div className="avatar-picker" aria-label={config.interfaz.tituloTrajes}>{config.trajes.map(traje => {
    const unlocked = estaDesbloqueado(traje.seDesbloqueaCon, user, config);
    const selected = user?.avatar?.trajeActual === traje.id;
    const select = () => {
      if (!unlocked) return;
      const updated = seleccionarTraje(user, traje.id);
      guardarUsuario(updated, storage, config);
      onChange?.(updated);
    };
    return <button key={traje.id} type="button" className="avatar-picker-item" disabled={!unlocked} aria-pressed={selected}
      title={unlocked ? traje.nombre : `${config.interfaz.bloqueado}: ${traje.seDesbloqueaCon}`} onClick={select}>
      {esImagen(traje.imagen) ? <img src={rutaImagen(traje.imagen)} alt="" /> : <span className="avatar-picker-emoji" aria-hidden="true">{traje.imagen}</span>}
      <span>{traje.nombre}</span><small>{config.interfaz.costoGemas}: {traje.costoGemas}</small>
      {!unlocked && <small>{config.interfaz.desbloqueaCon}: {traje.seDesbloqueaCon}</small>}
      <small>{selected ? config.interfaz.seleccionado : unlocked ? config.interfaz.seleccionar : config.interfaz.bloqueado}</small>
    </button>;
  })}</div>;
}
