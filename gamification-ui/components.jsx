import React from 'react';
import defaultConfig from '../src/gamification/gamification.config.js';
import { listarBadges } from '../src/gamification/badges.js';
import { progresoLiga } from '../src/gamification/leagues.js';
import { progresoNivel } from '../src/gamification/progression.js';
import { calcularRacha } from '../src/gamification/streaks.js';
import { listarMascotas } from '../src/gamification/pets.js';
import { listarSaldos } from '../src/gamification/wallet.js';
import { listarMisiones } from '../src/gamification/missions.js';
import { obtenerEstadoTemporada } from '../src/gamification/seasons.js';

const card = 'gf-card';

export function ProfileCard({ user, config = defaultConfig, onAvatarChange, storage }) {
  return <section className={card}><header className="gf-profile"><div className="gf-avatar">{user?.avatar?.trajeActual ? config.trajes.find(item => item.id === user.avatar.trajeActual)?.imagen : '🙂'}</div><div><small>{config.interfaz.perfil}</small><h3>{user?.nombre || config.perfil.nombreInicial || 'Jugador'}</h3><span>{config.interfaz.nivel} {progresoNivel(user?.xp, config)?.actual?.nivel ?? config.limites.diasMinimo} · {user?.xp ?? config.limites.xpMinimo} {config.interfaz.xp}</span></div></header></section>;
}

export function XPProgress({ user, config = defaultConfig }) {
  const value = progresoNivel(user?.xp, config);
  if (!value) return null;
  return <section className={card}><div className="gf-row"><strong>{config.interfaz.nivel} {value.actual.nivel}: {value.actual.nombre}</strong><span>{value.siguiente ? `${value.xpParaSiguiente} XP restantes` : 'Nivel máximo'}</span></div><div className="gf-progress"><span style={{ width: `${value.porcentaje}%` }} /></div><small>{value.xpEnNivel} XP{value.siguiente ? ` / ${value.siguiente.minXP - value.actual.minXP}` : ''}</small></section>;
}

export function LeagueCard({ user, config = defaultConfig }) {
  const value = progresoLiga(user?.xp, config);
  if (!value) return null;
  return <section className={card}><div className="gf-row"><span className="gf-medal">{value.liga.copa}</span><div><small>Liga</small><h3 style={{ color: value.liga.color }}>{value.liga.nombre}</h3></div></div><p>{value.siguiente ? `${value.xpParaSiguiente} XP para ${value.siguiente.nombre}` : 'Has llegado a la liga superior'}</p></section>;
}

export function StreakCard({ user, config = defaultConfig, now = new Date() }) {
  const streak = { actual: user?.stats?.rachaActual ?? config.limites.diasMinimo, mejor: user?.stats?.mejorRacha ?? calcularRacha(user?.stats?.diasActivos || [], now, config).mejor };
  return <section className={card}><span className="gf-emoji">🔥</span><h3>{streak.actual} {config.interfaz.dias} {config.interfaz.racha}</h3><small>Mejor: {streak.mejor} {config.interfaz.dias}</small></section>;
}

export function WalletCard({ user, config = defaultConfig }) {
  return <section className={card}><h3>{config.interfaz.saldo}</h3><div className="gf-wallet">{listarSaldos(user, config).map(money => <span key={money.id} style={{ color: money.color }}>{money.icono} {money.saldo} {money.nombre}</span>)}</div></section>;
}

export function BadgeCard({ badge, onClick }) {
  return <button type="button" onClick={onClick} className={`gf-badge ${badge.desbloqueado ? 'is-earned' : ''}`} aria-pressed={badge.desbloqueado}><span>{badge.icono}</span><strong>{badge.nombre}</strong><small>{badge.descripcion}</small></button>;
}

export function BadgeGallery({ user, config = defaultConfig }) {
  return <section className={card}><h3>{config.interfaz.insignias}</h3><div className="gf-grid">{listarBadges(user, config).map(badge => <BadgeCard key={badge.id} badge={badge} />)}</div></section>;
}

export function MissionCard({ mission, onClaim, labels }) {
  const percent = mission.progreso.requerido ? mission.progreso.actual / mission.progreso.requerido * 100 : 0;
  return <article className="gf-mission"><div className="gf-row"><div><strong>{mission.nombre}</strong><p>{mission.descripcion}</p></div><span>{mission.progreso.actual}/{mission.progreso.requerido}</span></div><div className="gf-progress"><span style={{ width: `${percent}%` }} /></div><button type="button" disabled={!mission.progreso.completada || mission.reclamada} onClick={() => onClaim?.(mission.id)}>{mission.reclamada ? labels.reclamada : labels.reclamar}</button></article>;
}

export function MissionBoard({ user, config = defaultConfig, onClaim }) {
  return <section className={card}><h3>{config.interfaz.misiones}</h3><div className="gf-stack">{listarMisiones(user, config).map(mission => <MissionCard key={mission.id} mission={mission} labels={config.interfaz} onClaim={onClaim} />)}</div></section>;
}

export function PetCollection({ user, config = defaultConfig, onSelect }) {
  return <section className={card}><h3>{config.interfaz.mascotas}</h3><div className="gf-grid">{listarMascotas(user, config).map(pet => <button key={pet.id} type="button" className={`gf-pet ${pet.desbloqueado ? '' : 'is-locked'}`} disabled={!pet.desbloqueado} onClick={() => onSelect?.(pet.id)}><span>{pet.imagen}</span><strong>{pet.nombre}</strong>{pet.desbloqueado ? null : <small>{config.interfaz.bloqueado}</small>}</button>)}</div></section>;
}

export function SeasonCard({ config = defaultConfig, now = new Date() }) {
  const season = obtenerEstadoTemporada(now, config);
  return <section className={card}><small>{config.interfaz.temporada}</small><h3>{season.nombre}</h3><p>{season.activa ? 'Temporada activa' : season.iniciaEn ? `Inicia ${season.iniciaEn.toLocaleDateString()}` : 'Temporada finalizada'}</p></section>;
}

export function RewardToast({ reward, onClose }) {
  if (!reward) return null;
  return <div className="gf-toast" role="status"><span>{reward.icono || '✨'}</span><strong>{reward.titulo || 'Recompensa obtenida'}</strong><span>{reward.descripcion || ''}</span><button type="button" onClick={onClose} aria-label="Cerrar">×</button></div>;
}
