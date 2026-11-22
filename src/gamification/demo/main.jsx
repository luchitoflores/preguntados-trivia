import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import configBase from '../gamification.config.js';
import { crearMotor } from '../engine.js';
import { reclamarMision } from '../missions.js';
import { seleccionarMascota } from '../pets.js';
import { seleccionarTraje } from '../avatar.js';
import { crearAdaptadorLocal } from '../storage.js';
import { ProfileCard, XPProgress, LeagueCard, StreakCard, WalletCard, BadgeGallery, MissionBoard, PetCollection, SeasonCard, AvatarPicker, RewardToast } from '../ui/index.js';
import '../ui/demo.css';

// La galería usa otra clave para aislar la demostración del guardado del juego.
const config = { ...configBase, persistencia: { ...configBase.persistencia, claveUsuario: 'gamification-demo-user-v1' } };
const motor = crearMotor(config);
const storage = crearAdaptadorLocal();

function App() {
  const [user, setUser] = useState(() => motor.cargarUsuario(storage) || motor.crearUsuario({ id: 'demo-local', nombre: 'Ada Lovelace' }));
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState('Cada bloque es un componente reutilizable. Prueba los eventos y observa cómo cambian las vistas.');
  function claimMission(id) {
    try {
      const next = reclamarMision(user, id, config);
      persist(next);
      setMessage('Recompensa reclamada y guardada en el registro de eventos.');
      setToast({ titulo: 'Misión completada', descripcion: config.misiones.find(item => item.id === id)?.nombre, icono: '✨' });
    } catch (error) { setMessage(error.message); }
  }
  const components = useMemo(() => [
    ['Perfil', <ProfileCard user={user} config={config} />],
    ['Experiencia y nivel', <XPProgress user={user} config={config} />],
    ['Liga', <LeagueCard user={user} config={config} />],
    ['Racha', <StreakCard user={user} config={config} />],
    ['Monedero', <WalletCard user={user} config={config} />],
    ['Avatar y trajes', <AvatarPicker user={user} onChange={setUser} storage={storage} config={config} />],
    ['Insignias', <BadgeGallery user={user} config={config} />],
    ['Misiones', <MissionBoard user={user} config={config} onClaim={claimMission} />],
    ['Colección de mascotas', <PetCollection user={user} config={config} onSelect={selectPet} />],
    ['Temporada', <SeasonCard config={config} />],
  ], [user]);

  function persist(next) {
    setUser(next);
    motor.guardarUsuario(next, storage);
  }
  function event(type, details = {}) {
    const next = motor.procesarEvento(user, { tipo: config.eventos[type], timestamp: new Date().toISOString(), ...details });
    persist(next);
    setMessage(`Evento registrado: ${config.eventos[type]}. Las estadísticas se calcularon desde el historial.`);
    if (next.badgesNuevos?.length) setToast({ titulo: 'Nueva insignia', descripcion: config.badges.find(item => item.id === next.badgesNuevos[0])?.nombre, icono: '🏅' });
  }
  function selectPet(id) {
    persist(seleccionarMascota(user, id, config));
    setMessage(`Mascota seleccionada: ${config.mascotas.find(item => item.id === id)?.nombre}.`);
  }

  return <div className="gf-demo"><header className="gf-header"><div><small>GAMIFICATION FRAMEWORK · GALERÍA</small><h1>Componentes que se adaptan a tu app</h1><p>Motor configurable, almacenamiento local y capas visuales independientes.</p></div><button onClick={() => { const fresh = motor.crearUsuario({ id: user.id, nombre: user.nombre }); persist(fresh); setMessage('Se reinició el perfil de demostración.'); }}>Reiniciar demo</button></header>
    <main className="gf-content"><div className="gf-demo-actions"><button onClick={() => event('rueda', { rueda: 'caverna', accion: 'jugar-rueda' })}>Registrar giro</button><button onClick={() => event('respuestaCorrecta')}>Respuesta correcta</button><button onClick={() => event('xp', { cantidad: 100 })}>+100 XP</button><button onClick={() => event('corona', { rueda: 'caverna', tema: 'ideas' })}>Ganar corona</button><button onClick={() => event('monedaGanada', { monedaId: config.monedas[0]?.id, cantidad: 25 })}>+25 gemas</button></div>
      <p role="status">{message}</p>
      <h2 className="gf-section-title">Vistas de cada componente</h2><div className="gf-gallery">{components.map(([name, element]) => <section className="gf-component-view" key={name}><h3 className="gf-section-title">{name}</h3>{element}</section>)}</div>
      <footer className="gf-footer">Los datos de esta galería se guardan localmente con una clave separada. No se conecta al modo de juego ni a APIs externas.</footer>
    </main><RewardToast reward={toast} onClose={() => setToast(null)} /></div>;
}

createRoot(document.getElementById('gamification-root')).render(<App />);
