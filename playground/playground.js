import configBase from '../src/gamification/gamification.config.js';
import { crearMotor, guardarUsuario } from '../src/gamification/engine.js';
import { obtenerHoraEnRango } from '../src/gamification/stats.js';
import { progresoLiga } from '../src/gamification/leagues.js';
import { listarBadges } from '../src/gamification/badges.js';
import { listarMascotas } from '../src/gamification/pets.js';
import { seleccionarTraje } from '../src/gamification/avatar.js';
import { listarMisiones, reclamarMision } from '../src/gamification/missions.js';
import { listarSaldos } from '../src/gamification/wallet.js';
import { obtenerEstadoTemporada } from '../src/gamification/seasons.js';
import './playground.css';

const USER_KEY = 'gamification-playground-user-v1';
const CONFIG_KEY = 'gamification-playground-config-v1';
const host = document.querySelector('#playground');
const clone = value => JSON.parse(JSON.stringify(value));
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const renderImageOrEmoji = (value, className = '') => /^(https?:|\/|\.\.?\/|data:image\/)/i.test(value || '')
  ? `<img class="${className}" src="${escapeHTML(value.startsWith('/') ? `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}` : value)}" alt="">`
  : `<span class="${className}">${escapeHTML(value)}</span>`;

function cargarConfiguracion() {
  try { return { ...clone(configBase), ...JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') }; }
  catch { return clone(configBase); }
}

let config = cargarConfiguracion();
config.persistencia = { ...config.persistencia, claveUsuario: USER_KEY };
let motor = crearMotor(config);
let user = motor.cargarUsuario() || motor.crearUsuario({ id: 'playground-local', nombre: 'Jugador de prueba' });
let nightCursor = null;
let toastTimer = null;

function saveUser(next) {
  user = guardarUsuario(next, localStorage, config);
  render();
}

function dateInZone(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function addDays(day, delta) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date + delta)).toISOString().slice(0, 10);
}

function zonedTimestamp(day, hour, minute = 0) {
  const [year, month, date] = day.split('-').map(Number);
  const target = Date.UTC(year, month - 1, date, hour, minute);
  let candidate = new Date(target);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.calendario.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: config.calendario.horaCiclo,
  });
  for (let attempt = 0; attempt < config.calendario.pasos + 1; attempt += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(candidate).map(part => [part.type, part.value]));
    const rendered = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    candidate = new Date(candidate.getTime() + target - rendered);
  }
  return candidate.toISOString();
}

function latestSimulationDay() {
  const today = dateInZone(new Date(), config.calendario.zonaHoraria);
  const current = `${today.year}-${today.month}-${today.day}`;
  return [...(user.stats?.diasActivos || []), current].sort().at(-1);
}

function register(type, details = {}, timestamp = new Date().toISOString()) {
  const eventId = `${config.recompensas.idPrefijoGenerado}play-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const next = motor.procesarEvento(user, { id: eventId, tipo: config.eventos[type], timestamp, ...details });
  saveUser(next);
  if (next.badgesNuevos?.length) showToast(`Insignia desbloqueada: ${config.badges.find(badge => badge.id === next.badgesNuevos[0])?.nombre || ''}`);
}

function simulateDays(amount) {
  const days = Math.max(0, Math.min(Number(amount) || 0, config.simulacion.diasMaximos));
  if (!days) return;
  const todayParts = dateInZone(new Date(), config.calendario.zonaHoraria);
  const today = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;
  const activeDays = user.stats?.diasActivos || [];
  const start = activeDays.length
    ? addDays([...activeDays, today].sort().at(-1), config.valores.incremento)
    : addDays(today, -(days - config.valores.incremento));
  let next = user;
  for (let index = 0; index < days; index += 1) {
    const timestamp = zonedTimestamp(addDays(start, index), 12);
    next = motor.procesarEvento(next, {
      id: `${config.recompensas.idPrefijoGenerado}play-day-${start}-${index}`,
      tipo: config.eventos.actividadDiaria,
      timestamp,
    });
  }
  saveUser(next);
  if (next.badgesNuevos?.length) showToast(`Insignia desbloqueada: ${config.badges.find(badge => badge.id === next.badgesNuevos[0])?.nombre || ''}`);
}

function applyConfigFromPanel() {
  const nextConfig = clone(config);
  host.querySelectorAll('[data-config-path]').forEach(input => {
    const path = input.dataset.configPath.split('.');
    let value = input.value;
    if (input.dataset.control === 'hora') value = Number(value.split(':')[0]);
    if (input.dataset.control === 'numero') value = Number(value);
    let target = nextConfig;
    for (const segment of path.slice(0, -1)) target = target[segment];
    target[path.at(-1)] = value;
  });

  const ordered = [...nextConfig.ligas].sort((first, second) => first.minXP - second.minXP);
  ordered.forEach((league, index) => {
    league.maxXP = ordered[index + config.valores.incremento]?.minXP == null
      ? null
      : ordered[index + config.valores.incremento].minXP - config.valores.incremento;
  });

  const oldUser = user;
  const oldEvents = [...(oldUser.eventos || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  config = nextConfig;
  motor = crearMotor(config);
  let rebuilt = motor.crearUsuario({ id: oldUser.id, nombre: oldUser.nombre });
  for (const event of oldEvents) rebuilt = motor.procesarEvento(rebuilt, event);
    rebuilt.avatar = oldUser.avatar || rebuilt.avatar;
  rebuilt.misionesReclamadas = oldUser.misionesReclamadas || [];
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  saveUser(rebuilt);
  showToast('Parámetros aplicados. El historial se recalculó con la nueva configuración.');
}

function badgeProgress(badge) {
  const params = badge.parametro || {};
  let current = config.limites.diasMinimo;
  let target = config.valores.incremento;
  let suffix = 'veces';
  if (badge.tipo === 'por-hora') {
    current = obtenerHoraEnRango(user.stats, params, config);
    target = params.vecesNecesarias;
  } else if (badge.tipo === 'por-racha') {
    current = user.stats?.rachaActual || config.limites.diasMinimo;
    target = params.diasNecesarios;
    suffix = 'días';
  } else if (badge.tipo === 'por-coronas') {
    current = user.stats?.coronas || config.limites.diasMinimo;
    target = params.coronasNecesarias;
    suffix = 'coronas';
  } else if (badge.tipo === 'por-repeticion') {
    current = user.stats?.vecesPorAccion?.[params.accion] || config.limites.diasMinimo;
    target = params.vecesNecesarias;
  } else if (badge.tipo === 'por-xp-dia') {
    current = user.stats?.mejorDia?.xp || config.limites.diasMinimo;
    target = params.xpMinimoEnUnDia;
    suffix = 'XP';
  }
  const progress = Number(target) > 0 ? Math.min(100, Number(current) / Number(target) * 100) : 100;
  return { current, target, suffix, progress };
}

function renderBadgeEditor(badge, index) {
  const fields = config.controlesUI.parametrosBadge;
  const controls = Object.entries(badge.parametro || {}).map(([key, value]) => {
    const meta = fields[key] || { nombre: key, control: 'numero', minimo: 0 };
    const path = `badges.${index}.parametro.${key}`;
    const inputValue = meta.control === 'hora' ? `${String(value).padStart(2, '0')}:00` : value;
    const inputType = meta.control === 'hora' ? 'time' : meta.control === 'texto' ? 'text' : 'number';
    const constraints = meta.control === 'numero' ? `min="${meta.minimo ?? 0}" max="${config.simulacion.xpMaximoPorOperacion}" step="${config.valores.incremento}"` : meta.control === 'hora' ? 'step="3600"' : '';
    return `<label class="control-field"><span>${escapeHTML(meta.nombre)}</span><input data-config-path="${path}" data-control="${meta.control}" type="${inputType}" ${constraints} value="${escapeHTML(inputValue)}"></label>`;
  }).join('');
  return `<article class="parameter-card"><div class="parameter-heading"><span class="big-emoji">${escapeHTML(badge.icono)}</span><div><strong>${escapeHTML(badge.nombre)}</strong><small>${escapeHTML(badge.tipo)}</small></div></div><div class="control-grid">${controls}</div></article>`;
}

function renderParameters() {
  const badges = config.badges.map(renderBadgeEditor).join('');
  const leagues = config.ligas.map((league, index) => `<article class="parameter-card league-edit"><div class="parameter-heading"><span class="big-emoji">${escapeHTML(league.copa)}</span><div><strong>${escapeHTML(league.nombre)}</strong><small>Umbral de XP</small></div></div><label class="control-field"><span>XP mínimo</span><input type="number" min="${config.limites.xpMinimo}" max="${config.simulacion.xpMaximoPorOperacion}" step="${config.valores.incremento}" value="${league.minXP}" data-config-path="ligas.${index}.minXP" data-control="numero"></label></article>`).join('');
  const outfits = config.trajes.map((outfit, index) => `<article class="parameter-card suit-edit"><span class="big-emoji">${escapeHTML(outfit.imagen)}</span><label class="control-field"><span>Nombre</span><input type="text" value="${escapeHTML(outfit.nombre)}" data-config-path="trajes.${index}.nombre"></label><label class="control-field"><span>Se desbloquea con</span><input type="text" value="${escapeHTML(outfit.seDesbloqueaCon || '')}" data-config-path="trajes.${index}.seDesbloqueaCon"></label></article>`).join('');
  return `<section class="panel parameters-panel"><div class="section-heading"><span class="step-number">1</span><div><h2>Parámetros del motor</h2><p>Estos campos editan la configuración real que recibe Gamification.</p></div></div><details open><summary>Insignias <span>${config.badges.length}</span></summary><div class="parameter-grid">${badges}</div></details><details><summary>Ligas <span>${config.ligas.length}</span></summary><div class="parameter-grid">${leagues}</div></details><details><summary>Trajes <span>${config.trajes.length}</span></summary><div class="parameter-grid">${outfits}</div></details><div class="panel-footer"><span>Los cambios se guardan localmente para este playground.</span><button class="primary-button" data-action="apply-config">Aplicar parámetros</button></div></section>`;
}

function renderSimulator() {
  const firstHourly = config.badges.find(badge => badge.tipo === 'por-hora');
  const defaultHour = `${String(firstHourly?.parametro?.horaDesde ?? config.limites.diasMinimo).padStart(2, '0')}:00`;
  const crownOptions = config.temas.map(topic => `<option value="${escapeHTML(topic.id)}">${escapeHTML(topic.nombre)}</option>`).join('');
  return `<section class="panel simulator-panel"><div class="section-heading"><span class="step-number">2</span><div><h2>Simulador de eventos</h2><p>Acelera el tiempo para observar cómo responde el mismo motor.</p></div></div><div class="simulator-grid"><div class="simulator-control"><label for="days-input"><span>🔥 Racha seguida</span><small>Simular actividad durante varios días</small></label><div class="inline-control"><input id="days-input" type="number" min="1" max="${config.simulacion.diasMaximos}" value="5"><span>días</span><button class="secondary-button" data-action="simulate-days">Ejecutar</button></div></div><div class="simulator-control"><label for="time-input"><span>🕘 Actividad por hora</span><small>Cada pulsación avanza un día simulado</small></label><div class="inline-control"><input id="time-input" type="time" step="60" value="${defaultHour}"><button class="secondary-button" data-action="play-hour">Jugar a esa hora</button></div></div><div class="simulator-control"><label for="xp-input"><span>✨ Experiencia</span><small>Registra XP en el evento del motor</small></label><div class="inline-control"><input id="xp-input" type="number" min="1" max="${config.simulacion.xpMaximoPorOperacion}" value="450"><span>XP</span><button class="secondary-button" data-action="add-xp">Sumar XP</button></div></div><div class="simulator-control"><label for="crown-input"><span>👑 Corona</span><small>Selecciona un tema del catálogo configurado</small></label><div class="inline-control"><select id="crown-input">${crownOptions}</select><button class="secondary-button" data-action="add-crown">Ganar corona</button></div></div></div><div class="simulator-footer"><span>Pruebas aisladas de la partida real · guardado local de demostración</span><div><button class="secondary-button" data-action="add-answer">✅ Registrar acierto</button> <button class="reset-button" data-action="reset">↺ Resetear todo</button></div></div></section>`;
}

function renderStreak() {
  const badge = config.badges.find(item => item.tipo === 'por-racha');
  const target = badge?.parametro?.diasNecesarios || config.valores.incremento;
  const current = user.stats?.rachaActual || config.limites.diasMinimo;
  return `<article class="metric-card streak-card"><div class="metric-icon fire">🔥</div><div class="metric-body"><div class="metric-title"><h3>Racha actual</h3><strong>${current} <span>/ ${target} días</span></strong></div><div class="progress-track"><i style="width:${Math.min(100, current / target * 100)}%"></i></div><small>Mejor racha: ${user.stats?.mejorRacha || config.limites.diasMinimo} días</small></div></article>`;
}

function renderLeague() {
  const progress = progresoLiga(user.xp, config);
  if (!progress) return '<article class="metric-card"><p>Configura al menos una liga para mostrar el progreso.</p></article>';
  const league = progress.liga;
  const next = progress.siguiente;
  const base = Number(league.minXP) || config.limites.xpMinimo;
  const top = next ? next.minXP : league.maxXP;
  const earned = Math.max(config.limites.xpMinimo, user.xp - base);
  const span = next ? Math.max(config.valores.incremento, next.minXP - base) : null;
  const value = next ? Math.min(earned, span) : earned;
  const percent = span ? Math.min(100, earned / span * 100) : 100;
  return `<article class="metric-card league-card"><div class="trophy" style="--league-color:${escapeHTML(league.color)}">${escapeHTML(league.copa)}</div><div class="metric-body"><div class="metric-title"><div><small>LIGA ACTUAL</small><h3>${escapeHTML(league.nombre)}</h3></div><strong>${user.xp} <span>XP</span></strong></div><div class="progress-track league-progress"><i style="width:${percent}%;background:${escapeHTML(league.color)}"></i></div><small>${value} / ${span ?? '∞'} XP${next ? ` · ${Math.max(config.limites.xpMinimo, next.minXP - user.xp)} XP para ${escapeHTML(next.nombre)}` : ' · Liga superior'}</small></div></article>`;
}

function renderBadges() {
  const badgeStates = listarBadges(user, config);
  return `<div class="badge-grid">${badgeStates.map(badge => {
    const progress = badgeProgress(badge);
    return `<article class="badge-card ${badge.desbloqueado ? 'earned' : 'locked'}"><div class="badge-top"><span class="badge-icon">${escapeHTML(badge.icono)}</span><span class="badge-state">${badge.desbloqueado ? '✅' : '🔒'}</span></div><strong>${escapeHTML(badge.nombre)}</strong><small>${escapeHTML(badge.descripcion)}</small><div class="progress-track"><i style="width:${progress.progress}%"></i></div><span class="badge-count">${Math.min(progress.current, progress.target)} / ${progress.target} ${escapeHTML(progress.suffix)}</span></article>`;
  }).join('')}</div>`;
}

function renderAvatar() {
  const current = config.trajes.find(item => item.id === user.avatar?.trajeActual);
  const pets = listarMascotas(user, config);
  const pet = pets.find(item => item.id === user.avatar?.mascotaActual);
  const avatar = renderImageOrEmoji(current?.imagen || '🙂', 'avatar-image');
  const suits = config.trajes.map(outfit => {
    const unlocked = motor.estaDesbloqueado(outfit.seDesbloqueaCon, user);
    const selected = user.avatar?.trajeActual === outfit.id;
    return `<button class="collection-item ${selected ? 'selected' : ''} ${unlocked ? '' : 'unavailable'}" data-select-traje="${escapeHTML(outfit.id)}" ${unlocked ? '' : 'disabled'}>${renderImageOrEmoji(outfit.imagen)}<strong>${escapeHTML(outfit.nombre)}</strong><small>${selected ? 'Traje actual' : unlocked ? 'Tocar para elegir' : `🔒 ${escapeHTML(outfit.seDesbloqueaCon)}`}</small></button>`;
  }).join('');
  const petsHTML = pets.map(item => `<article class="collection-item ${item.desbloqueado ? '' : 'unavailable'}">${renderImageOrEmoji(item.imagen)}<strong>${escapeHTML(item.nombre)}</strong><small>${item.desbloqueado ? 'Disponible' : `🔒 ${escapeHTML(item.seDesbloqueaCon)}`}</small></article>`).join('');
  return `<div class="avatar-showcase"><div class="avatar-orb">${avatar}</div><div><small>AVATAR ACTUAL</small><h3>${escapeHTML(current?.nombre || 'Sin traje seleccionado')}</h3><p>${pet ? `Mascota: ${escapeHTML(pet.imagen)} ${escapeHTML(pet.nombre)}` : 'Elige recompensas y coleccionables al avanzar.'}</p></div></div><h4>Trajes</h4><div class="collection-grid">${suits}</div><h4>Mascotas</h4><div class="collection-grid pet-grid">${petsHTML}</div>`;
}

function renderStats() {
  const best = user.stats?.mejorDia;
  const dayLabel = best?.fecha ? new Intl.DateTimeFormat('es-EC', { timeZone: 'UTC', weekday: 'long' }).format(new Date(`${best.fecha}T12:00:00.000Z`)) : '—';
  const hours = config.estadisticas.rangosHorario.map(range => `<div class="stat-chip"><strong>${obtenerHoraEnRango(user.stats, range, config)}</strong><span>veces en ${escapeHTML(range.nombre.toLowerCase())}</span></div>`).join('');
  const crowns = config.temas.map(topic => `<div class="stat-chip"><strong>${user.stats?.coronasPorTema?.[topic.id] || config.limites.diasMinimo}</strong><span>coronas · ${escapeHTML(topic.nombre)}</span></div>`).join('');
  return `<div class="stats-grid"><div class="stat-highlight"><span>🌞</span><div><small>MEJOR DÍA</small><strong>${escapeHTML(dayLabel)} · ${best?.xp || config.limites.xpMinimo} XP</strong></div></div>${hours}${crowns}</div>`;
}

function renderOtherViews() {
  const balances = listarSaldos(user, config).map(money => `<article class="resource-chip" style="--resource-color:${escapeHTML(money.color)}"><span>${escapeHTML(money.icono)}</span><strong>${money.saldo}</strong><small>${escapeHTML(money.nombre)}</small></article>`).join('');
  const missions = listarMisiones(user, config).map(mission => {
    const percent = mission.progreso.requerido ? Math.min(100, mission.progreso.actual / mission.progreso.requerido * 100) : 0;
    const rewards = mission.recompensas.map(reward => `${reward.cantidad} ${reward.tipo === 'moneda' ? config.monedas.find(item => item.id === reward.monedaId)?.nombre || reward.monedaId : reward.tipo.toUpperCase()}`).join(' · ');
    return `<article class="mission-row"><div class="mission-info"><div><strong>${escapeHTML(mission.nombre)}</strong><small>${escapeHTML(mission.descripcion)}</small></div><span>${mission.reclamada ? '✅' : mission.progreso.completada ? '🎁' : `${mission.progreso.actual}/${mission.progreso.requerido}`}</span></div><div class="progress-track"><i style="width:${percent}%;background:${mission.reclamada ? '#1e9a68' : ''}"></i></div><div class="mission-footer"><small>${mission.reclamada ? 'Premio reclamado' : `Premio: ${escapeHTML(rewards)}`}</small><button data-claim-mission="${escapeHTML(mission.id)}" ${!mission.progreso.completada || mission.reclamada ? 'disabled' : ''}>${mission.reclamada ? 'Reclamada' : 'Reclamar'}</button></div></article>`;
  }).join('');
  const season = obtenerEstadoTemporada(new Date(), config);
  return `<section class="visual-panel"><div class="visual-heading"><div><h3>Monedero y premios</h3><p>Saldo derivado de los eventos de recompensa.</p></div></div><div class="resource-grid">${balances}</div></section><section class="visual-panel"><div class="visual-heading"><div><h3>Misiones</h3><p>Progreso y premios calculados por el módulo de misiones.</p></div></div><div class="missions-list">${missions || '<p class="empty-state">Aún no hay misiones configuradas.</p>'}</div></section><section class="visual-panel season-view"><div class="season-spark">✦</div><div><small>TEMPORADA</small><h3>${escapeHTML(season.nombre)}</h3><p>${season.activa ? 'Activa en este dispositivo' : season.iniciaEn ? `Comienza el ${season.iniciaEn.toLocaleDateString()}` : 'Finalizada'}</p></div></section>`;
}

function showToast(message) {
  const toast = document.querySelector('.play-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), config.simulacion.toastMilisegundos || 2600);
}

function render() {
  host.innerHTML = `<div class="game-shell"><header class="game-header"><div class="header-brand"><span class="brand-mark">🎡</span><div><small>APRENDE JUGANDO</small><h1>Playground de Gamificación</h1><p>Prueba las reglas en una sola pantalla y en tiempo simulado.</p></div></div><div class="header-pill">🧠 <span>Modo de prueba</span></div></header><main class="playground-main">${renderParameters()}${renderSimulator()}<section class="live-section"><div class="section-heading"><span class="step-number">3</span><div><h2>Gamificación en vivo</h2><p>Las tarjetas reflejan el estado calculado por el motor.</p></div><div class="xp-total">✨ <strong>${user.xp}</strong><small>XP total</small></div></div><div class="metrics-grid">${renderStreak()}${renderLeague()}</div><section class="visual-panel"><div class="visual-heading"><div><h3>Insignias</h3><p>Las barras usan los parámetros aplicados arriba.</p></div></div>${renderBadges()}</section><section class="visual-panel"><div class="visual-heading"><div><h3>Avatar y colecciones</h3><p>Selecciona los trajes desbloqueados; las mascotas son coleccionables.</p></div></div>${renderAvatar()}</section><section class="visual-panel"><div class="visual-heading"><div><h3>Estadísticas derivadas</h3><p>Se reconstruyen desde los eventos registrados.</p></div></div>${renderStats()}</section>${renderOtherViews()}</section><footer class="playground-footer"><span>Framework independiente de la partida · parámetros y progreso guardados solo en este dispositivo</span><button data-action="reset" class="subtle-reset">Restaurar valores iniciales</button></footer></main><div class="play-toast" role="status" aria-live="polite"></div></div>`;
}

host.addEventListener('click', event => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'apply-config') { applyConfigFromPanel(); return; }
  if (action === 'simulate-days') { simulateDays(host.querySelector('#days-input').value); return; }
  if (action === 'play-hour') {
    const [hour, minute] = host.querySelector('#time-input').value.split(':').map(Number);
    if (!Number.isFinite(hour)) return;
    nightCursor = nightCursor ? addDays(nightCursor, config.valores.incremento) : latestSimulationDay();
    register('rueda', { rueda: config.simulacion.ruedaId, accion: config.simulacion.accionRueda }, zonedTimestamp(nightCursor, hour, minute || 0));
    showToast(`Actividad registrada a las ${String(hour).padStart(2, '0')}:${String(minute || 0).padStart(2, '0')}`);
    return;
  }
  if (action === 'add-xp') {
    const amount = Math.min(Number(host.querySelector('#xp-input').value) || config.limites.xpMinimo, config.simulacion.xpMaximoPorOperacion);
    if (amount <= config.limites.xpMinimo) return;
    register('xp', { cantidad: amount });
    showToast(`+${amount} XP registrados`);
    return;
  }
  if (action === 'add-crown') {
    const tema = host.querySelector('#crown-input').value;
    register('corona', { tema });
    showToast(`Corona registrada: ${config.temas.find(item => item.id === tema)?.nombre || tema}`);
    return;
  }
  if (action === 'add-answer') { register('respuestaCorrecta'); showToast('Acierto registrado'); return; }
  const missionId = event.target.closest('[data-claim-mission]')?.dataset.claimMission;
  if (missionId) {
    try {
      saveUser(reclamarMision(user, missionId, config));
      showToast('Recompensa de misión reclamada');
    } catch (error) { showToast(error.message); }
    return;
  }
  if (action === 'reset') {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CONFIG_KEY);
    config = clone(configBase);
    config.persistencia = { ...config.persistencia, claveUsuario: USER_KEY };
    motor = crearMotor(config);
    user = motor.crearUsuario({ id: 'playground-local', nombre: 'Jugador de prueba' });
    nightCursor = null;
    render();
    showToast('Se restauraron parámetros y progreso iniciales.');
    return;
  }
  const outfitId = event.target.closest('[data-select-traje]')?.dataset.selectTraje;
  if (outfitId) {
    const outfit = config.trajes.find(item => item.id === outfitId);
    if (!outfit || !motor.estaDesbloqueado(outfit.seDesbloqueaCon, user)) return;
    saveUser(seleccionarTraje(user, outfitId));
    showToast(`Traje seleccionado: ${outfit.nombre}`);
  }
});

render();
