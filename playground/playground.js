import configBase from './gamification.example.config.js';
import { crearMotor, guardarUsuario } from '../src/gamification/engine.js';
import { obtenerHoraEnRango } from '../src/gamification/stats.js';
import { calcularLigaPersonal } from '../src/gamification/leagues.js';
import { listarBadges } from '../src/gamification/badges.js';
import { listarMascotas, seleccionarMascota } from '../src/gamification/pets.js';
import { seleccionarTraje } from '../src/gamification/avatar.js';
import { listarMisiones, reclamarMision } from '../src/gamification/missions.js';
import { listarSaldos, obtenerInventario } from '../src/gamification/wallet.js';
import { comprarArticulo, listarTienda, usarArticulo, seleccionarPersonalizacion } from '../src/gamification/shop.js';
import { calcularProgresoTemporada, reclamarRecompensaTemporada } from '../src/gamification/seasons.js';
import { obtenerNivel } from '../src/gamification/progression.js';
import { calcularRacha } from '../src/gamification/streaks.js';
import { obtenerCalendario, listarPremiosMensuales, reclamarPremioMensual } from '../src/gamification/calendar.js';
import { listarHitosDias, reclamarHitoDias } from '../src/gamification/milestones.js';
import { listarColecciones, reclamarRecompensaColeccion } from '../src/gamification/collections.js';
import './playground.css';
import './playground-overrides.css';

const USER_KEY = 'gamification-playground-user-v2';
const CONFIG_KEY = 'gamification-playground-config-v2';
const CURSOR_KEY = 'gamification-playground-cursor-v1';
const host = document.querySelector('#playground');
const clone = value => JSON.parse(JSON.stringify(value));
const mergeableLists = new Set(['badges', 'misiones', 'hitosDias', 'colecciones', 'ligas', 'niveles', 'mascotas', 'trajes', 'premiosMensuales', 'articulos']);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const imageOrEmoji = (value, className = '') => /^(https?:|\/|\.\.?\/|data:image\/)/i.test(value || '')
  ? `<img class="${className}" src="${esc(value.startsWith('/') ? `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}` : value)}" alt="">`
  : `<span class="${className}">${esc(value)}</span>`;

function mergeConfig(base, saved, path = '') {
  if (Array.isArray(base)) {
    if (!Array.isArray(saved)) return clone(base);
    const key = path.split('.').at(-1);
    if (!base.every(item => item && typeof item === 'object' && item.id) || !saved.every(item => item && typeof item === 'object' && item.id)) return clone(saved);
    const result = saved.map(item => {
      const fallback = base.find(candidate => candidate.id === item.id);
      return fallback ? mergeConfig(fallback, item, path) : clone(item);
    });
    if (mergeableLists.has(key)) {
      for (const item of base) if (!result.some(savedItem => savedItem.id === item.id)) result.push(clone(item));
    }
    return result;
  }
  if (base && typeof base === 'object') {
    const override = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    const result = {};
    for (const [key, value] of Object.entries(base)) result[key] = mergeConfig(value, override[key], path ? `${path}.${key}` : key);
    for (const [key, value] of Object.entries(override)) if (!(key in result)) result[key] = clone(value);
    return result;
  }
  return saved === undefined ? base : saved;
}

function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    const merged = mergeConfig(configBase, saved);
    merged.persistencia = { ...configBase.persistencia, ...saved.persistencia, claveUsuario: USER_KEY };
    merged.temporadas ||= clone(configBase.temporadas);
    merged.catalogos ||= clone(configBase.catalogos);
    merged.tienda ||= clone(configBase.tienda);
    merged.temporadas = merged.temporadas.map(season => ({
      ...season,
      niveles: (season.niveles || []).map(level => ({
        ...level,
        recompensas: level.recompensas || [{ tipo: 'moneda', monedaId: merged.monedas[0]?.id || 'diamantes', cantidad: 0 }],
      })),
    }));
    return merged;
  } catch {
    return { ...clone(configBase), persistencia: { ...configBase.persistencia, claveUsuario: USER_KEY } };
  }
}

let config = loadConfig();
let engine = crearMotor(config);
let user = engine.cargarUsuario() || engine.crearUsuario({ id: 'playground-local', nombre: 'Jugador de prueba' });
const savedCursor = localStorage.getItem(CURSOR_KEY);
let simulatedCursor = /^\d{4}-\d{2}-\d{2}$/.test(savedCursor || '') ? savedCursor : null;
let selectedSeasonId = config.temporadas?.[0]?.id || config.temporada?.id || '';
const todayLocalParts = dateInZone(new Date(), config.calendario.zonaHoraria);
let selectedMonthKey = `${todayLocalParts.year}-${todayLocalParts.month}`;
let toastTimer = null;

function persistConfig() { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }

function setSimulationCursor(day) {
  simulatedCursor = day;
  if (day) localStorage.setItem(CURSOR_KEY, day);
  else localStorage.removeItem(CURSOR_KEY);
}

function saveUser(next, { notifyBadges = true } = {}) {
  const newBadges = next.badgesNuevos || [];
  user = guardarUsuario(next, localStorage, config);
  render();
  if (notifyBadges && newBadges.length) showToast(`Insignia nueva: ${config.badges.find(item => item.id === newBadges[0])?.nombre || ''}`);
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
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: config.calendario.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: config.calendario.horaCiclo });
  for (let count = 0; count < config.calendario.pasos + 1; count += config.valores.incremento) {
    const parts = Object.fromEntries(formatter.formatToParts(candidate).map(part => [part.type, part.value]));
    const rendered = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    candidate = new Date(candidate.getTime() + target - rendered);
  }
  return candidate.toISOString();
}

function latestSimulationDay() {
  const today = dateInZone(new Date(), config.calendario.zonaHoraria);
  return [...(user.stats?.diasActivos || []), `${today.year}-${today.month}-${today.day}`, ...(simulatedCursor ? [simulatedCursor] : [])].sort().at(-1);
}

function simulationReference() {
  return zonedTimestamp(latestSimulationDay(), config.calendario.horaReferencia);
}

function liveStreak() {
  return calcularRacha(user.stats?.diasParaRacha || user.stats?.diasActivos || [], simulationReference(), config);
}

function register(typeKey, details = {}, timestamp = simulationReference()) {
  const id = `${config.recompensas.idPrefijoGenerado}test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const next = engine.procesarEvento(user, { id, tipo: config.eventos[typeKey], timestamp, ...details });
  saveUser(next);
}

function simulateDays(amount) {
  const days = Math.max(0, Math.min(Number(amount) || 0, config.simulacion.diasMaximos));
  if (!days) return;
  const todayParts = dateInZone(new Date(), config.calendario.zonaHoraria);
  const today = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;
  const last = [...(user.stats?.diasActivos || []), today, ...(simulatedCursor ? [simulatedCursor] : [])].sort().at(-1);
  const start = user.stats?.diasActivos?.length || simulatedCursor
    ? addDays(last, config.valores.incremento)
    : addDays(today, -(days - config.valores.incremento));
  let next = user;
  for (let index = 0; index < days; index += config.calendario.pasos) {
    const day = addDays(start, index);
    next = engine.procesarEvento(next, { id: `${config.recompensas.idPrefijoGenerado}test-day-${day}`, tipo: config.eventos.actividadDiaria, timestamp: zonedTimestamp(day, 12) });
  }
  setSimulationCursor(addDays(start, days - config.valores.incremento));
  saveUser(next);
  selectedMonthKey = simulatedCursor.slice(0, 7);
  showToast(`Simulados ${days} días consecutivos`);
}

function simulateMonth(totalPoints) {
  const monthKey = simulatedCursor?.slice(0, 7) || selectedMonthKey;
  const [year, month] = monthKey.split('-').map(Number);
  const numberOfDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const points = Math.max(0, Math.min(Number(totalPoints) || 0, config.simulacion.xpMaximoPorOperacion));
  const perDay = Math.floor(points / numberOfDays);
  const extra = points % numberOfDays;
  let next = user;
  for (let index = 0; index < numberOfDays; index += config.calendario.pasos) {
    const day = `${monthKey}-${String(index + 1).padStart(2, '0')}`;
    const timestamp = zonedTimestamp(day, config.calendario.horaReferencia);
    next = engine.procesarEvento(next, { id: `${config.recompensas.idPrefijoGenerado}test-month-day-${day}`, tipo: config.eventos.actividadDiaria, timestamp });
    const earned = perDay + (index < extra ? config.valores.incremento : config.limites.diasMinimo);
    if (earned > config.limites.diasMinimo) next = engine.procesarEvento(next, { id: `${config.recompensas.idPrefijoGenerado}test-month-xp-${day}`, tipo: config.eventos.xp, cantidad: earned, timestamp });
  }
  setSimulationCursor(`${monthKey}-${String(numberOfDays).padStart(2, '0')}`);
  selectedMonthKey = monthKey;
  saveUser(next);
  showToast(`Mes simulado: ${numberOfDays} días y ${points} ${config.experiencia.unidad}.`);
}

function advanceSimulationWeek() {
  setSimulationCursor(addDays(latestSimulationDay(), config.calendario.diasPorSemana));
  selectedMonthKey = simulatedCursor.slice(0, 7);
  render();
  showToast(`La simulación avanzó al ${simulatedCursor}; se recalculó tu liga personal.`);
}

function updatePath(object, path, value) {
  const segments = path.split('.');
  let target = object;
  for (const segment of segments.slice(0, -1)) target = target[segment];
  target[segments.at(-1)] = value;
}

function applySettings() {
  const nextConfig = clone(config);
  host.querySelectorAll('[data-config-path]').forEach(input => {
    let value = input.value;
    if (input.dataset.control === 'hora') value = Number(value.split(':')[0]);
    if (input.dataset.control === 'numero') value = Number(value);
    updatePath(nextConfig, input.dataset.configPath, value);
  });
  host.querySelectorAll('[data-wheel-editor]').forEach(card => {
    const wheel = nextConfig.catalogos.ruedas.find(item => item.id === card.dataset.wheelEditor);
    if (!wheel) return;
    wheel.nombre = card.querySelector('[data-wheel-name]').value.trim();
    wheel.icono = card.querySelector('[data-wheel-icon]').value.trim();
    wheel.temas = card.querySelector('[data-wheel-themes]').value.split('\n').map(value => value.trim()).filter(Boolean);
    wheel.etiquetas = card.querySelector('[data-wheel-tags]').value.split(',').map(value => value.trim()).filter(Boolean);
  });
  for (const league of nextConfig.ligas) league.maxXP = null;
  const orderedLeagues = [...nextConfig.ligas].sort((a, b) => a.minXP - b.minXP);
  orderedLeagues.forEach((league, index) => {
    const nextLeague = orderedLeagues[index + config.valores.incremento];
    league.maxXP = nextLeague ? nextLeague.minXP - config.valores.incremento : null;
  });
  const oldUser = user;
  config = nextConfig;
  engine = crearMotor(config);
  let rebuilt = engine.crearUsuario({ id: oldUser.id, nombre: oldUser.nombre });
  for (const event of [...(oldUser.eventos || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))) rebuilt = engine.procesarEvento(rebuilt, event);
  rebuilt.avatar = oldUser.avatar || rebuilt.avatar;
  rebuilt.badges = [...new Set([...(rebuilt.badges || []), ...(oldUser.badges || [])])];
  rebuilt.medallasMensuales = oldUser.medallasMensuales || [];
  rebuilt.misionesReclamadas = oldUser.misionesReclamadas || [];
  selectedSeasonId = config.temporadas.some(item => item.id === selectedSeasonId) ? selectedSeasonId : config.temporadas[0]?.id;
  persistConfig();
  saveUser(rebuilt, { notifyBadges: false });
  showToast('Ajustes aplicados; el historial se recalculó.');
}

function settingField(label, path, value, control = 'texto', extra = '') {
  const type = control === 'hora' ? 'time' : control === 'numero' ? 'number' : control === 'fecha' ? 'date' : 'text';
  const inputValue = control === 'hora' ? `${String(value).padStart(2, '0')}:00` : value;
  return `<label class="control-field"><span>${esc(label)}</span><input data-config-path="${path}" data-control="${control}" type="${type}" ${control === 'numero' ? `min="${extra || 0}" step="${config.valores.incremento}"` : ''} ${control === 'hora' ? 'step="3600"' : ''} value="${esc(inputValue)}"></label>`;
}

function renderSettings() {
  const badgeFields = config.controlesUI.parametrosBadge;
  const experience = `<article class="setting-card"><div class="setting-card-title"><span>✨</span><strong>Nombres de esta implementación</strong></div><div class="setting-fields">${settingField('Nombre de progreso', 'experiencia.nombre', config.experiencia.nombre)}${settingField('Unidad de puntos', 'experiencia.unidad', config.experiencia.unidad)}${settingField('Nombre de nivel', 'experiencia.nombreNivel', config.experiencia.nombreNivel)}${settingField('Nombre de liga', 'experiencia.nombreLiga', config.experiencia.nombreLiga)}</div><small>Ejemplo: cambia “Ideas” por “Energía”, “Puntos” o cualquier escala que use otra app.</small></article>`;
  const badges = config.badges.map((badge, index) => {
    const values = Object.entries(badge.parametro || {}).map(([key, value]) => settingField(badgeFields[key]?.nombre || key, `badges.${index}.parametro.${key}`, value, badgeFields[key]?.control || 'numero', badgeFields[key]?.minimo || 0)).join('');
    return `<article class="setting-card"><div class="setting-card-title"><span>${esc(badge.icono)}</span><strong>${esc(badge.nombre)}</strong></div><div class="setting-fields">${settingField('Nombre', `badges.${index}.nombre`, badge.nombre)}${values}</div></article>`;
  }).join('');
  const leagues = config.ligas.map((league, index) => `<article class="setting-card"><div class="setting-card-title"><span>${esc(league.copa)}</span><strong>${esc(league.nombre)}</strong></div><div class="setting-fields">${settingField('Nombre', `ligas.${index}.nombre`, league.nombre)}${settingField('XP mínimo acumulado', `ligas.${index}.minXP`, league.minXP, 'numero', 0)}${settingField('XP semanal para ascender', `ligas.${index}.xpParaAscender`, league.xpParaAscender || 0, 'numero', 0)}${settingField('XP semanal mínimo para mantenerse', `ligas.${index}.xpMinimoMantener`, league.xpMinimoMantener || 0, 'numero', 0)}<label class="control-field"><span>Color</span><input data-config-path="ligas.${index}.color" type="color" value="${esc(league.color)}"></label></div></article>`).join('');
  const levels = config.niveles.map((level, index) => `<article class="setting-card"><div class="setting-card-title"><span>⬆️</span><strong>Nivel ${level.nivel}</strong></div><div class="setting-fields">${settingField('Nombre', `niveles.${index}.nombre`, level.nombre)}${settingField('XP mínimo', `niveles.${index}.minXP`, level.minXP, 'numero', 0)}</div></article>`).join('');
  const seasons = config.temporadas.map((season, index) => `<article class="setting-card"><div class="setting-card-title"><span>🌟</span><strong>${esc(season.nombre)}</strong><button class="mini-danger" data-remove-season="${esc(season.id)}" type="button" aria-label="Eliminar temporada">×</button></div><div class="setting-fields">${settingField('Nombre', `temporadas.${index}.nombre`, season.nombre)}${settingField('Fecha inicial', `temporadas.${index}.fechaInicio`, season.fechaInicio, 'fecha')}${settingField('Fecha final (opcional)', `temporadas.${index}.fechaFin`, season.fechaFin || '', 'fecha')}</div><div class="season-level-list">${(season.niveles || []).map((level, levelIndex) => `<div class="setting-fields level-row">${settingField(`Tramo ${levelIndex + 1}`, `temporadas.${index}.niveles.${levelIndex}.nombre`, level.nombre)}${settingField('XP de temporada', `temporadas.${index}.niveles.${levelIndex}.xpNecesario`, level.xpNecesario, 'numero', 0)}${settingField('Premio de diamantes', `temporadas.${index}.niveles.${levelIndex}.recompensas.0.cantidad`, level.recompensas?.[0]?.cantidad || 0, 'numero', 0)}</div>`).join('')}</div></article>`).join('');
  const wheels = config.catalogos.ruedas.map(wheel => `<article class="setting-card wheel-editor" data-wheel-editor="${esc(wheel.id)}"><div class="setting-card-title"><span>${esc(wheel.icono)}</span><strong>${esc(wheel.id)}</strong><button class="mini-danger" data-remove-wheel="${esc(wheel.id)}" type="button" aria-label="Eliminar rueda">×</button></div><div class="setting-fields"><label class="control-field"><span>Nombre</span><input data-wheel-name value="${esc(wheel.nombre)}"></label><label class="control-field"><span>Icono</span><input data-wheel-icon value="${esc(wheel.icono)}"></label></div><label class="control-field"><span>Temas o sectores, uno por línea</span><textarea data-wheel-themes rows="4">${esc(wheel.temas.join('\n'))}</textarea></label><label class="control-field"><span>Etiquetas de progresión separadas por coma</span><input data-wheel-tags value="${esc((wheel.etiquetas || []).join(', '))}"></label></article>`).join('');
  const shop = config.tienda.articulos.map((item, index) => `<article class="setting-card"><div class="setting-card-title"><span>${esc(item.imagen)}</span><strong>${esc(item.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `tienda.articulos.${index}.nombre`, item.nombre)}${settingField('Descripción', `tienda.articulos.${index}.descripcion`, item.descripcion)}${settingField('Costo', `tienda.articulos.${index}.costo`, item.costo, 'numero', 0)}</div></article>`).join('');
  const pets = config.mascotas.map((pet, index) => `<article class="setting-card"><div class="setting-card-title">${imageOrEmoji(pet.imagen)}<strong>${esc(pet.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `mascotas.${index}.nombre`, pet.nombre)}${settingField('Imagen o emoji', `mascotas.${index}.imagen`, pet.imagen)}${settingField('Requisito', `mascotas.${index}.seDesbloqueaCon`, pet.seDesbloqueaCon || '')}</div></article>`).join('');
  const currencies = config.monedas.map((money, index) => `<article class="setting-card"><div class="setting-card-title"><span>${esc(money.icono)}</span><strong>${esc(money.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `monedas.${index}.nombre`, money.nombre)}${settingField('Icono', `monedas.${index}.icono`, money.icono)}<label class="control-field"><span>Color</span><input data-config-path="monedas.${index}.color" type="color" value="${esc(money.color || '#8957eb')}"></label></div></article>`).join('');
  const dayMilestones = (config.hitosDias || []).map((item, index) => `<article class="setting-card"><div class="setting-card-title"><span>🗓️</span><strong>${esc(item.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `hitosDias.${index}.nombre`, item.nombre)}${settingField('Días acumulados', `hitosDias.${index}.dias`, item.dias, 'numero', 1)}${settingField('Diamantes de premio', `hitosDias.${index}.recompensas.0.cantidad`, item.recompensas?.[0]?.cantidad || 0, 'numero', 0)}</div></article>`).join('');
  const monthlyRewards = (config.calendario.premiosMensuales || []).map((item, index) => `<article class="setting-card"><div class="setting-card-title"><span>${esc(item.icono)}</span><strong>${esc(item.nombre)}</strong></div><div class="setting-fields">${settingField('Nombre', `calendario.premiosMensuales.${index}.nombre`, item.nombre)}${item.tipo === 'puntos-mes' ? settingField('Puntos para la medalla', `calendario.premiosMensuales.${index}.puntosNecesarios`, item.puntosNecesarios, 'numero', 1) : ''}${settingField('Diamantes de premio', `calendario.premiosMensuales.${index}.recompensas.0.cantidad`, item.recompensas?.[0]?.cantidad || 0, 'numero', 0)}</div></article>`).join('');
  const missions = (config.misiones || []).map((item, index) => `<article class="setting-card"><div class="setting-card-title"><span>🎯</span><strong>${esc(item.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `misiones.${index}.nombre`, item.nombre)}${settingField('Meta', `misiones.${index}.objetivo.cantidadNecesaria`, item.objetivo.cantidadNecesaria, 'numero', 1)}${settingField('Recompensa inicial', `misiones.${index}.recompensas.0.cantidad`, item.recompensas?.[0]?.cantidad || 0, 'numero', 0)}<label class="control-field"><span>Periodicidad</span><select data-config-path="misiones.${index}.periodicidad"><option value="diaria" ${item.periodicidad === 'diaria' ? 'selected' : ''}>Diaria</option><option value="semanal" ${item.periodicidad === 'semanal' ? 'selected' : ''}>Semanal</option><option value="total" ${!item.periodicidad || item.periodicidad === 'total' ? 'selected' : ''}>Una vez</option></select></label></div></article>`).join('');
  const collections = (config.colecciones || []).map((collection, index) => `<article class="setting-card"><div class="setting-card-title"><span>${esc(collection.icono)}</span><strong>${esc(collection.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `colecciones.${index}.nombre`, collection.nombre)}${settingField('Descripción', `colecciones.${index}.descripcion`, collection.descripcion)}${settingField('Premio de diamantes', `colecciones.${index}.recompensas.0.cantidad`, collection.recompensas?.[0]?.cantidad || 0, 'numero', 0)}</div><div class="settings-grid">${(collection.items || []).map((item, itemIndex) => `<article class="setting-card"><div class="setting-card-title"><span>${esc(item.imagen)}</span><strong>${esc(item.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `colecciones.${index}.items.${itemIndex}.nombre`, item.nombre)}${settingField('Icono o imagen', `colecciones.${index}.items.${itemIndex}.imagen`, item.imagen)}${settingField('Requisito', `colecciones.${index}.items.${itemIndex}.seDesbloqueaCon`, item.seDesbloqueaCon || '')}</div></article>`).join('')}</div></article>`).join('');
  return `<dialog class="settings-dialog" aria-labelledby="settings-title"><div class="settings-head"><div><small>CONTROLES DEL FRAMEWORK</small><h2 id="settings-title">Configuración</h2><p>Las reglas y nombres de esta implementación se pueden adaptar a otra app.</p></div><button class="icon-button close-settings" data-action="close-settings" aria-label="Cerrar ajustes">×</button></div><div class="settings-content"><details open><summary>Identidad de la implementación</summary><div class="settings-grid">${experience}</div></details><details><summary>Insignias <span>${config.badges.length}</span></summary><div class="settings-grid">${badges}</div></details><details><summary>Ligas personales <span>${config.ligas.length}</span></summary><p>Avanza con puntos semanales; si no alcanzas el mínimo de permanencia, desciendes una liga.</p><div class="settings-grid">${leagues}</div></details><details><summary>Etapas de experiencia <span>${config.niveles.length}</span></summary><div class="settings-grid">${levels}</div></details><details><summary>Metas de días <span>${(config.hitosDias || []).length}</span></summary><div class="settings-grid">${dayMilestones}</div></details><details><summary>Premios mensuales <span>${(config.calendario.premiosMensuales || []).length}</span></summary><div class="settings-grid">${monthlyRewards}</div></details><details><summary>Misiones periódicas <span>${config.misiones.length}</span></summary><div class="settings-grid">${missions}</div></details><details><summary>Colecciones <span>${(config.colecciones || []).length}</span></summary><div class="settings-grid">${collections}</div></details><details><summary>Monedas <span>${config.monedas.length}</span></summary><div class="settings-grid">${currencies}</div></details><details><summary>Temporadas <span>${config.temporadas.length}</span></summary><div class="settings-grid">${seasons}<button class="add-card" data-action="add-season" type="button">＋ Añadir temporada</button></div></details><details><summary>Ruedas y sectores <span>${config.catalogos.ruedas.length}</span></summary><div class="settings-grid">${wheels}<button class="add-card" data-action="add-wheel" type="button">＋ Añadir rueda</button></div></details><details><summary>Tienda y personalizaciones <span>${config.tienda.articulos.length}</span></summary><div class="settings-grid">${shop}</div></details><details><summary>Trajes</summary><div class="settings-grid">${config.trajes.map((outfit, index) => `<article class="setting-card"><div class="setting-card-title">${imageOrEmoji(outfit.imagen)}<strong>${esc(outfit.id)}</strong></div><div class="setting-fields">${settingField('Nombre', `trajes.${index}.nombre`, outfit.nombre)}${settingField('Desbloqueo', `trajes.${index}.seDesbloqueaCon`, outfit.seDesbloqueaCon || '')}</div></article>`).join('')}</div></details><details><summary>Mascotas <span>${config.mascotas.length}</span></summary><div class="settings-grid">${pets}</div></details></div><div class="settings-footer"><button class="reset-button" data-action="reset-all">Restaurar todo</button><span>La configuración editada se guarda solo en este dispositivo.</span><button class="primary-button" data-action="apply-config">Aplicar ajustes</button></div></dialog>`;
}

function renderWheelControl() {
  const wheels = config.catalogos.ruedas;
  const wheel = wheels.find(item => item.id === host.querySelector('#wheel-select')?.value) || wheels[0];
  const themes = wheel?.temas || [];
  return `<div class="wheel-fields"><label class="field-label" for="wheel-select">Rueda</label><select id="wheel-select">${wheels.map(item => `<option value="${esc(item.id)}" ${item.id === wheel?.id ? 'selected' : ''}>${esc(item.icono)} ${esc(item.nombre)}</option>`).join('')}</select><label class="field-label" for="theme-select">Sector o tema</label><select id="theme-select">${themes.map(topic => `<option value="${esc(topic)}">${esc(topic)}</option>`).join('')}</select></div>`;
}

function renderSimulator() {
  const hourlyBadge = config.badges.find(badge => badge.tipo === 'por-hora');
  const hour = `${String(hourlyBadge?.parametro?.horaDesde ?? config.limites.diasMinimo).padStart(2, '0')}:00`;
  const season = config.temporadas.find(item => item.id === selectedSeasonId) || config.temporadas[0];
  const targetOptions = [
    ...config.ligas.map(item => `<option value="liga:${esc(item.id)}">Liga ${esc(item.nombre)} · ${item.xpParaAscender || 'tope'} semanal</option>`),
    ...config.niveles.map(item => `<option value="nivel:${esc(item.id)}">${esc(config.experiencia.nombreNivel)} ${item.nivel} · ${esc(item.nombre)} · ${item.minXP} ${esc(config.experiencia.unidad)}</option>`),
  ].join('');
  const money = config.monedas[0] || { id: '', nombre: 'Moneda', icono: '🪙' };
  const currencyOptions = config.monedas.length > 1 ? `<select id="currency-select" aria-label="Moneda a conseguir">${config.monedas.map(item => `<option value="${esc(item.id)}">${esc(item.icono)} ${esc(item.nombre)}</option>`).join('')}</select>` : '';
  return `<section class="simulator panel"><div class="section-heading"><span class="section-mark">🎮</span><div><h2>Zona de pruebas</h2><p>Ejecuta acciones; el motor actualiza todo en esta pantalla.</p></div></div><div class="sim-columns"><article class="action-card wheel-action"><div class="action-title"><span>🎡</span><div><strong>Probar una rueda</strong><small>Registra una tirada y el sector elegido.</small></div></div><div class="wheel-picker">${renderWheelControl()}<button class="primary-button" data-action="spin-wheel">Girar rueda</button></div><div class="wheel-result" id="wheel-result"><span>✨</span> El resultado aparecerá aquí</div></article><article class="action-card"><div class="action-title"><span>🔥</span><div><strong>Actividad y racha</strong><small>Avanza los días sin esperar.</small></div></div><div class="action-row"><input id="days-input" type="number" min="1" max="${config.simulacion.diasMaximos}" value="5" aria-label="Días consecutivos"><span>días</span><button class="secondary-button" data-action="simulate-days">Simular</button></div><div class="action-row"><input id="time-input" type="time" value="${hour}" aria-label="Hora simulada"><button class="secondary-button" data-action="play-hour">Registrar rueda a esa hora</button></div><button class="secondary-button freeze-button" data-action="skip-day">⏭ Simular un día perdido</button><button class="secondary-button freeze-button" data-action="use-freezer">🧊 Usar congelador de racha</button><button class="secondary-button" data-action="advance-week">⏩ Pasar una semana sin actividad</button><div class="action-row month-sim"><input id="month-points" type="number" min="0" value="${config.simulacion.puntosMesPorDefecto}" aria-label="Puntos del mes"><span>puntos</span><button class="secondary-button" data-action="simulate-month">Simular mes completo</button></div></article><article class="action-card"><div class="action-title"><span>✨</span><div><strong>Progresión</strong><small>Prueba XP, ligas, niveles y temporada.</small></div></div><div class="action-row"><input id="xp-input" type="number" min="1" max="${config.simulacion.xpMaximoPorOperacion}" value="100" aria-label="Cantidad de XP"><span>${esc(config.experiencia.unidad)}</span><button class="secondary-button" data-action="add-xp">Sumar</button></div><div class="action-row"><select id="target-select" aria-label="Objetivo de progresión">${targetOptions}</select><button class="secondary-button" data-action="reach-target">Probar objetivo</button></div><div class="action-row"><select id="season-select" aria-label="Temporada">${config.temporadas.map(item => `<option value="${esc(item.id)}" ${item.id === season?.id ? 'selected' : ''}>${esc(item.nombre)}</option>`).join('')}</select><button class="secondary-button" data-action="select-season">Ver temporada</button></div></article><article class="action-card"><div class="action-title"><span>💎</span><div><strong>Economía de prueba</strong><small>Agrega moneda, compra y usa artículos.</small></div></div><div class="action-row">${currencyOptions}<input id="currency-input" type="number" min="1" value="100" aria-label="Cantidad de moneda"><span>${esc(money.nombre)}</span><button class="secondary-button" data-action="add-currency">Conseguir</button></div><div class="action-row"><select id="shop-select" aria-label="Artículo de tienda">${config.tienda.articulos.map(item => `<option value="${esc(item.id)}">${esc(item.imagen)} ${esc(item.nombre)} · ${item.costo} ${esc(config.monedas.find(currency => currency.id === item.monedaId)?.nombre || '')}</option>`).join('')}</select><button class="secondary-button" data-action="buy-item">Comprar</button></div></article></div><div class="simulator-bottom"><label class="season-context">Tema corona<select id="crown-theme">${config.temas.map(topic => `<option value="${esc(topic.id)}">${esc(topic.nombre)}</option>`).join('')}</select></label><div><button class="secondary-button" data-action="add-crown">＋ Corona</button> <button class="secondary-button" data-action="add-answer">✓ Acierto</button> <button class="reset-button" data-action="reset">↺ Reiniciar prueba</button></div></div></section>`;
}

function progressCard(title, current, target, detail, icon, color = '#8357e5') {
  const percent = target ? Math.min(100, current / target * 100) : 100;
  return `<article class="progress-card"><div class="progress-icon" style="--accent:${esc(color)}">${icon}</div><div class="progress-copy"><div class="progress-heading"><strong>${esc(title)}</strong><b>${esc(detail)}</b></div><div class="progress-track"><i style="width:${percent}%;background:${esc(color)}"></i></div><small>${current}${target ? ` / ${target}` : ''}</small></div></article>`;
}

function renderProgress() {
  const league = calcularLigaPersonal(user, config, simulationReference());
  const level = obtenerNivel(user.xp, config);
  const nextLevel = [...config.niveles].sort((a, b) => a.minXP - b.minXP).find(item => item.minXP > user.xp);
  const streakTarget = Math.max(config.valores.incremento, config.badges.find(item => item.tipo === 'por-racha')?.parametro?.diasNecesarios || config.valores.incremento);
  const leagueDetail = league?.enRiesgo ? `Riesgo de descenso · mínimo ${league.xpParaMantener} ${config.experiencia.unidad} esta semana` : league?.siguiente ? `${league.xpFaltanteAscenso} ${config.experiencia.unidad} para ascender` : 'Liga máxima';
  const leagueCard = league ? progressCard(`${config.experiencia.nombreLiga} ${league.liga.nombre}`, league.xpPeriodo, league.xpParaAscender, leagueDetail, league.liga.copa, league.liga.color) : '';
  const levelCard = level ? progressCard(`${config.experiencia.nombreNivel} ${level.nivel} · ${level.nombre}`, Math.max(config.limites.xpMinimo, user.xp - level.minXP), nextLevel ? nextLevel.minXP - level.minXP : 0, nextLevel ? `${Math.max(config.limites.xpMinimo, nextLevel.minXP - user.xp)} ${config.experiencia.unidad} al siguiente` : 'Nivel máximo', '⬆️', '#ff9b44') : '';
  const streak = liveStreak().actual;
  const streakCard = progressCard('Racha diaria', streak, streakTarget, `${streak} / ${streakTarget} días`, '🔥', '#ed6a48');
  return `<section class="summary-grid"><article class="welcome-card"><span class="welcome-icon">🎓</span><div><small>IMPLEMENTACIÓN DE EJEMPLO · FILOSOFÍA</small><h2>Tu progreso individual</h2><p>Las etiquetas, recompensas y nombres se editan en Configuración; el motor no necesita conocer esta temática.</p></div><button class="settings-trigger" data-action="open-settings" aria-label="Abrir configuración">⚙️</button></article><div class="wallet-strip">${listarSaldos(user, config).map(item => `<div><span>${esc(item.icono)}</span><strong>${item.saldo}</strong><small>${esc(item.nombre)}</small></div>`).join('')}<div><span>⭐</span><strong>${user.xp}</strong><small>${esc(config.experiencia.nombre)} (${esc(config.experiencia.unidad)})</small></div><button class="mobile-settings" data-action="open-settings">⚙️ Configuración</button></div><div class="progress-grid">${streakCard}${leagueCard}${levelCard}</div></section>`;
}

function badgeProgress(badge) {
  const param = badge.parametro || {};
  let current = config.limites.diasMinimo;
  let target = config.valores.incremento;
  let unit = 'veces';
  if (badge.tipo === 'por-hora') { current = obtenerHoraEnRango(user.stats, param, config); target = param.vecesNecesarias; }
  else if (badge.tipo === 'por-racha') { current = user.stats?.rachaActual || 0; target = param.diasNecesarios; unit = 'días'; }
  else if (badge.tipo === 'por-mejor-racha') { current = user.stats?.mejorRacha || 0; target = param.diasNecesarios; unit = 'días'; }
  else if (badge.tipo === 'por-dias-conectado') { current = user.stats?.diasConectadoAcumulados || 0; target = param.diasNecesarios; unit = 'días'; }
  else if (badge.tipo === 'por-coronas') { current = user.stats?.coronas || 0; target = param.coronasNecesarias; unit = 'coronas'; }
  else if (badge.tipo === 'por-repeticion') { current = user.stats?.vecesPorAccion?.[param.accion] || 0; target = param.vecesNecesarias; }
  else if (badge.tipo === 'por-xp-dia') { current = user.stats?.mejorDia?.xp || 0; target = param.xpMinimoEnUnDia; unit = 'XP'; }
  else if (badge.tipo === 'por-eventos') {
    const expected = config.eventos[param.eventoKey];
    current = (user.eventos || []).filter(event => event.tipo === expected && Object.entries(param.filtros || {}).every(([key, value]) => key === 'etiquetas' ? value.every(tag => (event.etiquetas || []).includes(tag)) : event[key] === value)).length;
    target = param.vecesNecesarias;
  }
  target = Number(target) || config.valores.incremento;
  return { current, target, unit, percent: Math.min(100, current / target * 100) };
}

function renderBadges() {
  return listarBadges(user, config).map(badge => {
    const p = badgeProgress(badge);
    return `<article class="badge-card ${badge.desbloqueado ? 'is-earned' : ''}"><div><span>${esc(badge.icono)}</span><b>${badge.desbloqueado ? '✓' : '🔒'}</b></div><strong>${esc(badge.nombre)}</strong><small>${esc(badge.descripcion)}</small><div class="progress-track"><i style="width:${p.percent}%"></i></div><small>${Math.min(p.current, p.target)} / ${p.target} ${esc(p.unit)}</small></article>`;
  }).join('');
}

function renderAvatar() {
  const currentOutfit = config.trajes.find(item => item.id === user.avatar?.trajeActual);
  const pets = listarMascotas(user, config);
  const pet = pets.find(item => item.id === user.avatar?.mascotaActual);
  const inventory = obtenerInventario(user, config);
  const outfits = config.trajes.map(item => {
    const unlocked = engine.estaDesbloqueado(item.seDesbloqueaCon, user);
    const selected = user.avatar?.trajeActual === item.id;
    return `<button class="collection-card ${selected ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}" data-select-traje="${esc(item.id)}" ${unlocked ? '' : 'disabled'}>${imageOrEmoji(item.imagen)}<strong>${esc(item.nombre)}</strong><small>${selected ? 'Equipado' : unlocked ? 'Equipar' : `🔒 ${esc(item.seDesbloqueaCon)}`}</small></button>`;
  }).join('');
  const petsHTML = pets.map(item => {
    const selected = user.avatar?.mascotaActual === item.id;
    return `<button class="collection-card pet-card ${selected ? 'is-selected' : ''} ${item.desbloqueado ? '' : 'is-locked'}" data-select-pet="${esc(item.id)}" ${item.desbloqueado ? '' : 'disabled'}>${imageOrEmoji(item.imagen)}<strong>${esc(item.nombre)}</strong><small>${selected ? 'Acompañante activo' : item.desbloqueado ? 'Elegir mascota' : `🔒 ${esc(item.seDesbloqueaCon)}`}</small></button>`;
  }).join('');
  const customizations = config.tienda.articulos.filter(item => item.efecto === 'cosmetico').map(item => {
    const owned = inventory[item.id] > 0;
    const selected = user.avatar?.personalizacionActual === item.id;
    return `<button class="collection-card ${selected ? 'is-selected' : ''} ${owned ? '' : 'is-locked'}" data-select-customization="${esc(item.id)}" ${owned ? '' : 'disabled'}>${imageOrEmoji(item.imagen)}<strong>${esc(item.nombre)}</strong><small>${selected ? 'Equipado' : owned ? 'Aplicar personalización' : 'Comprar en la tienda'}</small></button>`;
  }).join('');
  return `<div class="avatar-display"><div class="character ${user.avatar?.personalizacionActual ? 'has-customization' : ''}"><div class="character-outfit">${imageOrEmoji(currentOutfit?.imagen || '🙂')}</div>${pet ? `<div class="character-pet">${imageOrEmoji(pet.imagen)}</div>` : ''}</div><div><small>AVATAR EQUIPADO</small><h3>${esc(currentOutfit?.nombre || 'Traje inicial')}</h3><p>${pet ? `${esc(pet.nombre)} te acompaña` : 'Selecciona una mascota desbloqueada para usarla.'}</p>${user.avatar?.personalizacionActual ? `<div class="owned-customizations"><span>✨ ${esc(config.tienda.articulos.find(item => item.id === user.avatar.personalizacionActual)?.nombre || '')}</span></div>` : ''}</div></div><h4>Trajes</h4><div class="collection-grid">${outfits}</div><h4>Mascotas · colección sin poderes</h4><div class="collection-grid">${petsHTML}</div><h4>Personalizaciones</h4><div class="collection-grid">${customizations}</div>`;
}

function renderSeason() {
  const season = config.temporadas.find(item => item.id === selectedSeasonId) || config.temporadas[0];
  if (!season) return '<article class="surface-card"><p>Añade una temporada en Configuración para probar la progresión.</p></article>';
  const progress = calcularProgresoTemporada(user, season.id, config);
  const current = progress?.actual?.xpNecesario || config.limites.xpMinimo;
  return `<article class="season-card"><div class="season-title"><span>🌟</span><div><small>PASE DE TEMPORADA</small><h3>${esc(season.nombre)}</h3></div><b>${progress?.xp || 0} XP</b></div><div class="season-progress"><div class="season-line"><i style="width:${progress?.porcentaje || 0}%"></i></div><div class="season-levels">${(season.niveles || []).map((level, index) => {
    const unlocked = level.xpNecesario <= (progress?.xp || 0);
    const claimed = user.eventos.some(event => event.tipo === config.eventos.temporadaReclamada && event.temporadaId === season.id && event.nivelTemporadaId === level.id);
    return `<div class="season-level ${unlocked ? 'passed' : ''}"><span>${unlocked ? '✓' : index + 1}</span><small>${esc(level.nombre)}</small><button data-season-claim="${esc(level.id)}" ${!unlocked || claimed ? 'disabled' : ''}>${claimed ? 'Cobrado' : `${level.recompensas?.[0]?.cantidad || 0} 💎`}</button></div>`;
  }).join('')}</div></div><p>${progress?.siguiente ? `${progress.xpParaSiguiente} XP para ${esc(progress.siguiente.nombre)}` : 'Has alcanzado el último tramo de esta temporada.'}</p></article>`;
}

function renderWheels() {
  const wheels = config.catalogos.ruedas;
  if (!wheels.length) return '<article class="surface-card empty-message">Agrega una rueda desde ⚙️ Configuración para poder probar giros.</article>';
  return wheels.map(wheel => {
    const count = user.stats?.vecesPorRueda?.[wheel.id] || 0;
    return `<article class="wheel-tile"><div class="wheel-bubble">${esc(wheel.icono)}</div><div><strong>${esc(wheel.nombre)}</strong><small>${wheel.temas.length} sectores · ${count} giros</small></div><button data-quick-wheel="${esc(wheel.id)}" aria-label="Girar ${esc(wheel.nombre)}">Girar</button></article>`;
  }).join('');
}

function renderStats() {
  const best = user.stats?.mejorDia;
  const label = best?.fecha ? new Intl.DateTimeFormat('es-EC', { timeZone: 'UTC', weekday: 'long' }).format(new Date(`${best.fecha}T12:00:00.000Z`)) : '—';
  const hours = config.estadisticas.rangosHorario.map(range => `<article class="stat-tile"><strong>${obtenerHoraEnRango(user.stats, range, config)}</strong><small>veces en ${esc(range.nombre.toLowerCase())}</small></article>`).join('');
  const medals = (user.medallasMensuales || []).map(key => key.split(':').slice(1).join(' · ')).join(', ') || 'Aún no hay medallas';
  const streak = liveStreak();
  return `<div class="stats-grid"><article class="best-day"><span>☀️</span><div><small>MEJOR DÍA HISTÓRICO</small><strong>${esc(label)} · ${best?.xp || 0} ${esc(config.experiencia.unidad)}</strong></div></article><article class="stat-tile"><strong>${streak.actual} / ${streak.mejor}</strong><small>racha actual / récord histórico</small></article><article class="stat-tile"><strong>${user.stats?.diasConectadoAcumulados || 0}</strong><small>días conectados acumulados</small></article>${hours}<article class="stat-tile"><strong>${user.stats?.coronas || 0}</strong><small>coronas ganadas</small></article><article class="stat-tile monthly-medals"><strong>🏅</strong><small>${esc(medals)}</small></article></div>`;
}

function renderMissions() {
  return listarMisiones(user, config, simulationReference()).map(mission => {
    const p = mission.progreso;
    const rewards = mission.recompensas.map(item => `${item.cantidad} ${item.tipo === 'moneda' ? config.monedas.find(money => money.id === item.monedaId)?.nombre || item.monedaId : item.tipo.toUpperCase()}`).join(' · ');
    return `<article class="mission-card"><div class="mission-heading"><div><strong>${esc(mission.nombre)}</strong><small>${esc(mission.descripcion)} · ${mission.periodicidad === 'total' ? 'Una vez' : `${mission.periodicidad}: ${mission.periodo}`}</small></div><b>${mission.reclamada ? '✓' : `${p.actual}/${p.requerido}`}</b></div><div class="progress-track"><i style="width:${p.requerido ? p.actual / p.requerido * 100 : 0}%"></i></div><div class="mission-bottom"><small>${mission.reclamada ? 'Recompensa cobrada' : rewards}</small><button data-claim-mission="${esc(mission.id)}" ${!p.completada || mission.reclamada ? 'disabled' : ''}>${mission.reclamada ? 'Completada' : 'Reclamar'}</button></div></article>`;
  }).join('');
}

function renderCollections() {
  return listarColecciones(user, config).map(collection => {
    const items = collection.items.map(item => `<div class="collectible ${item.desbloqueado ? 'is-collected' : ''}">${imageOrEmoji(item.imagen)}<strong>${esc(item.nombre)}</strong><small>${item.desbloqueado ? 'Conseguido' : 'Por desbloquear'}</small></div>`).join('');
    return `<article class="collection-set"><div class="collection-set-heading"><span>${esc(collection.icono)}</span><div><strong>${esc(collection.nombre)}</strong><small>${esc(collection.descripcion)}</small></div><b>${collection.desbloqueados}/${collection.total}</b></div><div class="progress-track"><i style="width:${collection.total ? collection.desbloqueados / collection.total * 100 : 0}%"></i></div><div class="collectible-grid">${items}</div><button data-claim-collection="${esc(collection.id)}" ${collection.disponible ? '' : 'disabled'}>${collection.reclamada ? 'Premio cobrado' : collection.disponible ? 'Completar y reclamar premio' : 'Completa la colección para el premio'}</button></article>`;
  }).join('');
}

function renderDayMilestones() {
  return listarHitosDias(user, config).map(item => `<article class="milestone-card ${item.completado ? 'is-reached' : ''}"><div><span>🗓️</span><strong>${esc(item.nombre)}</strong></div><div class="progress-track"><i style="width:${item.dias ? item.progreso / item.dias * 100 : 0}%"></i></div><small>${user.stats?.diasConectadoAcumulados || 0} / ${item.dias} días · ${(item.recompensas || []).map(reward => `${reward.cantidad} ${config.monedas.find(money => money.id === reward.monedaId)?.nombre || reward.monedaId}`).join(' + ')}</small><button data-claim-milestone="${esc(item.id)}" ${item.disponible ? '' : 'disabled'}>${item.reclamado ? 'Reclamado' : item.disponible ? 'Reclamar' : 'Sigue avanzando'}</button></article>`).join('');
}

function renderCalendar() {
  const [year, month] = selectedMonthKey.split('-').map(Number);
  const calendar = obtenerCalendario(user, year, month, config);
  const periodName = new Intl.DateTimeFormat('es-EC', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)));
  const weeks = config.interfaz.diasSemanaCortos || ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const cells = `${'<span class="calendar-empty"></span>'.repeat(calendar.espaciosIniciales)}${calendar.dias.map(item => `<span class="calendar-day ${item.activo ? 'is-active' : ''}">${item.dia}</span>`).join('')}`;
  const awards = listarPremiosMensuales(user, selectedMonthKey, config).map(item => `<article class="monthly-award ${item.completa ? 'is-earned' : ''}"><span>${esc(item.icono)}</span><div><strong>${esc(item.nombre)}</strong><small>${esc(item.descripcion)} · ${item.progreso}/${item.objetivo}${item.tipo === 'todos-los-dias' ? ' días' : ` ${esc(config.experiencia.unidad)}`}</small></div><button data-claim-monthly="${esc(item.id)}" ${item.disponible ? '' : 'disabled'}>${item.reclamada ? 'Reclamado' : item.disponible ? 'Reclamar' : 'En progreso'}</button></article>`).join('');
  return `<section class="surface-card calendar-card"><div class="surface-heading"><div><h3>Calendario de constancia</h3><p>${esc(calendar.diasActivos)} de ${calendar.diasTotales} días conectados en ${esc(periodName)}</p></div><input type="month" id="calendar-month" value="${esc(selectedMonthKey)}" aria-label="Mes del calendario"></div><div class="calendar-grid">${weeks.map(day => `<small>${esc(day)}</small>`).join('')}${cells}</div><div class="monthly-awards">${awards}</div></section>`;
}

function renderShop() {
  return listarTienda(user, config).map(item => {
    const money = config.monedas.find(entry => entry.id === item.monedaId);
    const alreadyOwned = item.tipo === 'cosmetico' && item.cantidad > 0;
    return `<article class="shop-card"><div class="shop-visual">${imageOrEmoji(item.imagen)}</div><strong>${esc(item.nombre)}</strong><small>${esc(item.descripcion)}</small><div class="shop-footer"><span>${item.cantidad ? `En inventario: ${item.cantidad}` : `${item.costo} ${esc(money?.nombre || '')}`}</span><button data-buy="${esc(item.id)}" ${alreadyOwned || (user.stats?.saldos?.[item.monedaId] || 0) < item.costo ? 'disabled' : ''}>${alreadyOwned ? 'Adquirido' : 'Comprar'}</button></div></article>`;
  }).join('');
}

function renderResults() {
  const balanceHTML = listarSaldos(user, config).map(item => `<div class="balance-pill"><span>${esc(item.icono)}</span><strong>${item.saldo}</strong><small>${esc(item.nombre)}</small></div>`).join('');
  return `<section class="results-section"><div class="section-heading"><span class="section-mark">📊</span><div><h2>Resultados en vivo</h2><p>Todo este panel proviene del estado calculado por el framework; la liga muestra solo tu progreso, sin rivales simulados.</p></div><div class="balance-group">${balanceHTML}</div></div>${renderCalendar()}<section class="surface-card"><div class="surface-heading"><div><h3>Hitos de días conectados</h3><p>Los premios de cada hito se reclaman una sola vez.</p></div></div><div class="milestone-grid">${renderDayMilestones()}</div></section><section class="surface-card"><div class="surface-heading"><div><h3>Insignias</h3><p>Incluye récord de racha, mejor día y logros por filósofos o escuelas configurados.</p></div></div><div class="badge-grid">${renderBadges()}</div></section><section class="surface-card"><div class="surface-heading"><div><h3>Colecciones</h3><p>Filósofos, escuelas u otros catálogos; cada colección puede dar su propio premio.</p></div></div><div class="collection-sets">${renderCollections()}</div></section><section class="surface-card"><div class="surface-heading"><div><h3>Ruedas y actividad</h3><p>Cada giro registra eventos genéricos con metadatos y etiquetas configurables.</p></div></div><div class="wheels-grid">${renderWheels()}</div></section><div class="two-results"><section class="surface-card"><div class="surface-heading"><div><h3>Avatar, trajes y mascotas</h3><p>Equipa trajes desbloqueados y elige tu mascota acompañante.</p></div></div>${renderAvatar()}</section><section class="surface-card"><div class="surface-heading"><div><h3>Récords personales</h3><p>Se calculan a partir de los eventos de actividad.</p></div></div>${renderStats()}</section></div><section class="surface-card">${renderSeason()}</section><section class="surface-card"><div class="surface-heading"><div><h3>Misiones diarias y semanales</h3><p>Los objetivos se reinician por periodo; cada reclamo genera una clave única.</p></div></div><div class="mission-grid">${renderMissions() || '<p class="empty-message">No hay misiones configuradas.</p>'}</div></section><section class="surface-card"><div class="surface-heading"><div><h3>Tienda de diamantes</h3><p>Compra trajes, personalizaciones y consumibles del framework.</p></div></div><div class="shop-grid">${renderShop()}</div></section></section>`;
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
  host.innerHTML = `<div class="game-shell"><header class="game-header"><div class="brand"><span class="brand-mark">🎡</span><div><small>FRAMEWORK DE GAMIFICACIÓN</small><h1>Laboratorio de progreso</h1></div></div><div class="header-right"><span class="offline-tag">● Simulación local</span><button class="settings-trigger desktop-settings" data-action="open-settings" aria-label="Abrir configuración" title="Configuración">⚙️</button></div></header><main class="playground-main">${renderSettings()}${renderProgress()}${renderSimulator()}${renderResults()}<footer class="playground-footer">Datos aislados de la partida · Puedes reiniciar el perfil de prueba cuando quieras<button class="reset-link" data-action="reset">Reiniciar perfil</button></footer></main><div class="play-toast" role="status" aria-live="polite"></div></div>`;
}

function spinWheel(wheelId) {
  const wheel = config.catalogos.ruedas.find(item => item.id === wheelId);
  if (!wheel || !wheel.temas.length) { showToast('Agrega sectores a la rueda desde Configuración.'); return; }
  const sector = wheel.temas[Math.floor(Math.random() * wheel.temas.length)];
  const timestamp = zonedTimestamp(latestSimulationDay(), new Date().getHours());
  register('rueda', { rueda: wheel.id, tema: sector, accion: config.simulacion.accionRueda, etiquetas: wheel.etiquetas || [] }, timestamp);
  const result = host.querySelector('#wheel-result');
  if (result) result.innerHTML = `<span>${esc(wheel.icono)}</span> ${esc(wheel.nombre)} → <strong>${esc(sector)}</strong>`;
  showToast(`Salió ${sector} en ${wheel.nombre}`);
}

function resetProfile() {
  localStorage.removeItem(USER_KEY);
  user = engine.crearUsuario({ id: 'playground-local', nombre: 'Jugador de prueba' });
  setSimulationCursor(null);
  const today = dateInZone(new Date(), config.calendario.zonaHoraria);
  selectedMonthKey = `${today.year}-${today.month}`;
  persistConfig();
  render();
  showToast('Progreso del perfil reiniciado; se conservaron los ajustes.');
}

function resetEverything() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CONFIG_KEY);
  config = clone(configBase);
  config.persistencia = { ...config.persistencia, claveUsuario: USER_KEY };
  engine = crearMotor(config);
  user = engine.crearUsuario({ id: 'playground-local', nombre: 'Jugador de prueba' });
  selectedSeasonId = config.temporadas[0]?.id || '';
  setSimulationCursor(null);
  const today = dateInZone(new Date(), config.calendario.zonaHoraria);
  selectedMonthKey = `${today.year}-${today.month}`;
  render();
  showToast('Configuración y progreso restaurados.');
}

host.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'open-settings') { host.querySelector('.settings-dialog')?.showModal(); return; }
  if (action === 'close-settings') { host.querySelector('.settings-dialog')?.close(); return; }
  if (action === 'apply-config') { applySettings(); return; }
  if (action === 'reset-all') { resetEverything(); return; }
  if (action === 'simulate-days') { simulateDays(host.querySelector('#days-input').value); return; }
  if (action === 'simulate-month') { simulateMonth(host.querySelector('#month-points').value); return; }
  if (action === 'advance-week') { advanceSimulationWeek(); return; }
  if (action === 'skip-day') {
    setSimulationCursor(addDays(latestSimulationDay(), config.valores.incremento));
    selectedMonthKey = simulatedCursor.slice(0, 7);
    render();
    showToast(`Día simulado sin actividad: ${simulatedCursor}. Ya puedes probar el congelador.`);
    return;
  }
  if (action === 'spin-wheel') { spinWheel(host.querySelector('#wheel-select')?.value); return; }
  if (target.dataset.quickWheel) { spinWheel(target.dataset.quickWheel); return; }
  if (action === 'play-hour') {
    const [hour, minute] = (host.querySelector('#time-input')?.value || '').split(':').map(Number);
    if (!Number.isFinite(hour)) return;
    const wheel = config.catalogos.ruedas.find(item => item.id === host.querySelector('#wheel-select')?.value) || config.catalogos.ruedas[0];
    const day = addDays(latestSimulationDay(), config.valores.incremento);
    setSimulationCursor(day);
    const sector = host.querySelector('#theme-select')?.value || wheel?.temas[0] || '';
    if (!wheel) { showToast('Agrega primero una rueda desde Configuración.'); return; }
    register('rueda', { rueda: wheel.id, tema: sector, accion: config.simulacion.accionRueda, etiquetas: wheel.etiquetas || [] }, zonedTimestamp(day, hour, minute || 0));
    showToast(`Tirada ${wheel.nombre} registrada a las ${host.querySelector('#time-input').value}`);
    return;
  }
  if (action === 'add-xp') {
    const amount = Math.max(0, Math.min(Number(host.querySelector('#xp-input')?.value) || 0, config.simulacion.xpMaximoPorOperacion));
    if (amount) register('xp', { cantidad: amount, temporadaId: host.querySelector('#season-select')?.value || selectedSeasonId });
    return;
  }
  if (action === 'reach-target') {
    const [kind, id] = (host.querySelector('#target-select')?.value || '').split(':');
    const item = kind === 'liga' ? config.ligas.find(entry => entry.id === id) : config.niveles.find(entry => entry.id === id);
    const leagueState = kind === 'liga' ? calcularLigaPersonal(user, config, simulationReference()) : null;
    const current = kind === 'liga' ? leagueState?.xpPeriodo : user.xp;
    const target = kind === 'liga' ? item?.xpParaAscender : item?.minXP;
    const needed = Number.isFinite(Number(target)) ? Math.max(0, Number(target) - Number(current)) : 0;
    if (needed) register('xp', { cantidad: needed, temporadaId: selectedSeasonId });
    else showToast(kind === 'liga' && !leagueState?.siguiente ? 'Ya alcanzaste la liga máxima.' : 'Ya alcanzaste esa meta de progresión.');
    return;
  }
  if (action === 'select-season') { selectedSeasonId = host.querySelector('#season-select')?.value || selectedSeasonId; render(); showToast('Temporada seleccionada.'); return; }
  if (action === 'add-crown') { register('corona', { tema: host.querySelector('#crown-theme')?.value }); return; }
  if (action === 'add-answer') { register('respuestaCorrecta'); showToast('Acierto registrado.'); return; }
  if (action === 'add-currency') {
    const selectedMoney = host.querySelector('#currency-select')?.value;
    const money = config.monedas.find(item => item.id === selectedMoney) || config.monedas[0];
    if (!money) { showToast('Añade una moneda a la configuración antes de simular ganancias.'); return; }
    const amount = Math.max(1, Math.min(Number(host.querySelector('#currency-input')?.value) || 1, config.simulacion.xpMaximoPorOperacion));
    register('monedaGanada', { monedaId: money.id, cantidad: amount });
    showToast(`Conseguiste ${amount} ${money.nombre.toLowerCase()}.`);
    return;
  }
  if (action === 'buy-item' || target.dataset.buy) {
    const itemId = target.dataset.buy || host.querySelector('#shop-select')?.value;
    try { saveUser(comprarArticulo(user, itemId, config)); showToast('Compra registrada.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  if (action === 'use-freezer') {
    const item = config.tienda.articulos.find(entry => entry.efecto === 'congelar-racha');
    if (!item) { showToast('Añade un congelador de racha a la tienda en Configuración.'); return; }
    const day = addDays(latestSimulationDay(), config.valores.incremento);
    try { saveUser(usarArticulo(user, item.id, config, zonedTimestamp(day, 12))); showToast('Día protegido; tu racha se conserva.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  if (target.dataset.claimMission) {
    try { saveUser(reclamarMision(user, target.dataset.claimMission, config, simulationReference())); showToast('Recompensa de misión cobrada.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  if (target.dataset.claimMilestone) {
    try { saveUser(reclamarHitoDias(user, target.dataset.claimMilestone, config, simulationReference())); showToast('Premio por días conectados cobrado.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  if (target.dataset.claimMonthly) {
    try { saveUser(reclamarPremioMensual(user, selectedMonthKey, target.dataset.claimMonthly, config, simulationReference())); showToast('Premio mensual cobrado.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  if (target.dataset.claimCollection) {
    try { saveUser(reclamarRecompensaColeccion(user, target.dataset.claimCollection, config, simulationReference())); showToast('Premio de colección cobrado.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  if (target.dataset.seasonClaim) {
    try { saveUser(reclamarRecompensaTemporada(user, selectedSeasonId, target.dataset.seasonClaim, config)); showToast('Premio de temporada cobrado.'); }
    catch (error) { showToast(error.message); }
    return;
  }
  if (target.dataset.selectTraje) {
    const outfit = config.trajes.find(item => item.id === target.dataset.selectTraje);
    if (!outfit || !engine.estaDesbloqueado(outfit.seDesbloqueaCon, user)) return;
    saveUser(seleccionarTraje(user, outfit.id));
    showToast(`${outfit.nombre} equipado.`);
    return;
  }
  if (target.dataset.selectPet) {
    const pet = listarMascotas(user, config).find(item => item.id === target.dataset.selectPet);
    if (!pet?.desbloqueado) return;
    saveUser(seleccionarMascota(user, pet.id, config));
    showToast(`${pet.nombre} ahora te acompaña.`);
    return;
  }
  if (target.dataset.selectCustomization) {
    const item = config.tienda.articulos.find(entry => entry.id === target.dataset.selectCustomization);
    if (!item || !(obtenerInventario(user, config)[item.id] > 0)) return;
    saveUser(seleccionarPersonalizacion(user, item.id, config));
    showToast(`${item.nombre} aplicada al avatar.`);
    return;
  }
  if (target.dataset.removeWheel) {
    config.catalogos.ruedas = config.catalogos.ruedas.filter(item => item.id !== target.dataset.removeWheel);
    persistConfig(); render(); host.querySelector('.settings-dialog')?.showModal();
    return;
  }
  if (target.dataset.removeSeason) {
    config.temporadas = config.temporadas.filter(item => item.id !== target.dataset.removeSeason);
    selectedSeasonId = config.temporadas[0]?.id || '';
    persistConfig(); render(); host.querySelector('.settings-dialog')?.showModal();
    return;
  }
  if (action === 'add-wheel') {
    const id = `rueda-${Date.now().toString(36)}`;
    config.catalogos.ruedas.push({ id, nombre: 'Nueva rueda', icono: '🎡', temas: ['Sector 1', 'Sector 2', 'Sector 3'] });
    persistConfig(); render(); host.querySelector('.settings-dialog')?.showModal();
    return;
  }
  if (action === 'add-season') {
    const id = `temporada-${Date.now().toString(36)}`;
    config.temporadas.push({ id, nombre: 'Nueva temporada', fechaInicio: new Date().toISOString().slice(0, 10), fechaFin: '', niveles: clone(config.temporadas[0]?.niveles || [{ id: 'inicio', nombre: 'Inicio', xpNecesario: 0 }, { id: 'explorador', nombre: 'Explorador', xpNecesario: 250 }]) });
    persistConfig(); render(); host.querySelector('.settings-dialog')?.showModal();
    return;
  }
  if (action === 'reset') { resetProfile(); }
});

host.addEventListener('change', event => {
  if (event.target.id === 'calendar-month') {
    selectedMonthKey = event.target.value || selectedMonthKey;
    render();
    return;
  }
  if (event.target.id === 'season-select') {
    selectedSeasonId = event.target.value;
    render();
    return;
  }
  if (event.target.id === 'wheel-select') {
    const picker = host.querySelector('.wheel-picker');
    const button = picker?.querySelector('[data-action="spin-wheel"]');
    if (picker && button) {
      const replacement = document.createElement('div');
      replacement.innerHTML = renderWheelControl();
      picker.replaceChildren(...replacement.firstElementChild.children, button);
    }
  }
});

render();
