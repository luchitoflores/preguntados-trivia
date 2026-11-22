import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Download, FileUp, Play, Plus, Save, Trash2 } from 'lucide-react';
import { QUESTION_TYPES, createQuestion, validateQuestion } from './core/question-core.js';
import { wheels } from './core/wheels.js';
import { philosophersRegistry } from './core/philosophers-registry.js';

// Esta clave es solo una barrera casual en el cliente; no protege información confidencial.
const ADMIN_PASSWORD = '12345';
const ADMIN_ROUTE = ['#', '/admin', '-sofia-', '2026'].join('');
const STORAGE_KEY = 'preguntas_custom';
function exitAdmin() { localStorage.removeItem('admin_sofi_auth'); window.location.hash = ''; window.location.reload(); }
const emptyForm = () => ({ id: '', tipo: 'texto-a-texto', rueda: 'ejes', filosofo: '', tema: '', pregunta: '', preguntaImagen: null, preguntaAudio: null, respuesta: '', respuestaImagen: null, respuestaAudio: null, distractores: ['', '', ''], distractorImages: [null, null, null], explicacion: '', pista: '', tiempo: 30 });
const readCustom = () => { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
const dataUrl = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[i + 1] === '\n') i += 1; row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function Login({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  function submit(event) { event.preventDefault(); if (password === ADMIN_PASSWORD) { localStorage.setItem('admin_sofi_auth', 'si'); onUnlock(); } else setError('Clave incorrecta'); }
  return <main className="admin-shell"><form className="admin-card" onSubmit={submit}><h1>Acceso</h1><label>Clave de admin<input autoFocus type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p role="alert">{error}</p>}<button className="primary">Entrar</button></form></main>;
}

function QuestionPreview({ question, onClose }) {
  const [selected, setSelected] = useState(null);
  const [seconds, setSeconds] = useState(question.tiempo_segundos);
  React.useEffect(() => { if (selected !== null || seconds <= 0) return; const id = setInterval(() => setSeconds(s => s - 1), 1000); return () => clearInterval(id); }, [selected, seconds]);
  const options = useMemo(() => [...question.opciones].sort(() => Math.random() - .5), [question]);
  const correct = option => option.texto === question.respuesta_correcta.texto && option.imagen === question.respuesta_correcta.imagen;
  return <div className="admin-overlay"><section className="admin-card admin-preview"><button className="secondary" onClick={onClose}>Volver al editor</button><p>Tiempo: {seconds}s</p>{question.pregunta.imagen && <img className="question-image" src={question.pregunta.imagen} alt="" />}{question.pregunta.texto && <h2>{question.pregunta.texto}</h2>}{question.pregunta.audio && <audio controls src={question.pregunta.audio} />}
    <div className="admin-options">{options.map((option, i) => <button key={i} className={`answer ${selected === i ? correct(option) ? 'correct' : 'incorrect' : ''}`} onClick={() => setSelected(i)} disabled={selected !== null}>{option.imagen && <img className="option-image" src={option.imagen} alt="" />}{option.texto}</button>)}</div>
    {selected !== null && <div className="admin-feedback"><strong>{correct(options[selected]) ? '¡Correcto!' : 'Respuesta incorrecta'}</strong><p>Respuesta: {question.respuesta_correcta.texto}</p><p>{question.respuesta_correcta.explicacion}</p></div>}
  </section></div>;
}

export default function Editor() {
  const [authed, setAuthed] = useState(localStorage.getItem('admin_sofi_auth') === 'si');
  const [items, setItems] = useState(readCustom);
  const [form, setForm] = useState(emptyForm);
  const [extraCount, setExtraCount] = useState(0);
  const [preview, setPreview] = useState(null);
  const [notice, setNotice] = useState('');
  function persist(next) { setItems(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  function update(key, value) { setForm(current => ({ ...current, [key]: value })); }
  async function fileValue(event, key) { const file = event.target.files?.[0]; if (file) update(key, await dataUrl(file)); }
  function toQuestion(source = form) {
    return createQuestion({ id: source.id, tipo: source.tipo, rueda: source.rueda, filosofo: source.filosofo, tema: source.tema,
      pregunta: { texto: source.pregunta, imagen: source.preguntaImagen, audio: source.preguntaAudio },
      respuesta_correcta: { texto: source.respuesta, imagen: source.respuestaImagen, audio: source.respuestaAudio, explicacion: source.explicacion },
      opciones: [{ texto: source.respuesta, imagen: source.respuestaImagen }, ...source.distractores.map((texto, i) => ({ texto, imagen: source.distractorImages?.[i] || null })).filter(o => o.texto || o.imagen)],
      pistas: source.pista ? [source.pista] : [], tiempo_segundos: source.tiempo });
  }
  function save(event) { event.preventDefault(); const result = validateQuestion(toQuestion()); if (result.errors.length) { setNotice(result.errors.join(' ')); return; } persist(form.id ? items.map(q => q.id === form.id ? result.question : q) : [...items, result.question]); setForm(emptyForm()); setExtraCount(0); setNotice('Pregunta guardada en este dispositivo.'); }
  function edit(question) { const distractors = question.opciones.filter(o => !(o.texto === question.respuesta_correcta.texto && o.imagen === question.respuesta_correcta.imagen)); setForm({ id: question.id, tipo: question.tipo, rueda: question.rueda, filosofo: question.filosofo, tema: question.tema, pregunta: question.pregunta.texto, preguntaImagen: question.pregunta.imagen, preguntaAudio: question.pregunta.audio, respuesta: question.respuesta_correcta.texto, respuestaImagen: question.respuesta_correcta.imagen, respuestaAudio: question.respuesta_correcta.audio, distractores: distractors.map(o => o.texto), distractorImages: distractors.map(o => o.imagen), explicacion: question.respuesta_correcta.explicacion, pista: question.pistas[0] || '', tiempo: question.tiempo_segundos }); setExtraCount(Math.max(0, distractors.length - 3)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function exportJson() { const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'preguntas_custom.json'; a.click(); URL.revokeObjectURL(a.href); }
  async function importJson(event) { try { const parsed = JSON.parse(await event.target.files[0].text()); if (!Array.isArray(parsed)) throw Error(); const ids = new Set(items.map(q => q.id)); const valid = []; for (const raw of parsed) { const checked = validateQuestion(raw); if (!checked.errors.length && !ids.has(checked.question.id)) { ids.add(checked.question.id); valid.push(checked.question); } } persist([...items, ...valid]); setNotice(`Importadas ${valid.length}, Fallidas ${parsed.length - valid.length}`); } catch { setNotice('No se pudo leer el JSON.'); } event.target.value = ''; }
  async function importCsv(event) { const parsedRows = parseCsv(await event.target.files[0].text()); const columns = (parsedRows.shift() || []).map(s => s.trim().replace(/^\uFEFF/, '')); const get = (row, name) => row[columns.indexOf(name)] || ''; const parsed = parsedRows.map((row, i) => createQuestion({ id: get(row, 'id') || `CSV_${Date.now()}_${i}`, tipo: get(row, 'tipo') || 'texto-a-texto', rueda: get(row, 'rueda') || 'ejes', pregunta: { texto: get(row, 'pregunta_texto'), imagen: get(row, 'pregunta_imagen') || null }, respuesta_correcta: { texto: get(row, 'respuesta_texto'), explicacion: get(row, 'explicacion') }, opciones: [get(row, 'respuesta_texto'), get(row, 'opcion_1'), get(row, 'opcion_2'), get(row, 'opcion_3')].filter(Boolean).map(texto => ({ texto })) })); const ids = new Set(items.map(q => q.id)); const valid = []; for (const q of parsed) { if (!validateQuestion(q).errors.length && !ids.has(q.id)) { ids.add(q.id); valid.push(q); } } persist([...items, ...valid]); setNotice(`Importadas ${valid.length}, Fallidas ${parsed.length - valid.length}`); event.target.value = ''; }
  if (!authed) return <Login onUnlock={() => setAuthed(true)} />;
  if (preview) return <QuestionPreview question={preview} onClose={() => setPreview(null)} />;
  return <main className="admin-shell"><header className="admin-header"><div><span>FRAMEWORK DE PREGUNTAS</span><h1>Editor de preguntas</h1></div><button className="secondary" onClick={exitAdmin}>Salir de modo Admin</button></header>
    <section className="admin-card"><form onSubmit={save}><div className="admin-grid">
      <label>Tipo<select value={form.tipo} onChange={e => update('tipo', e.target.value)}>{QUESTION_TYPES.filter(t => t !== 'audio-a-palabra').map(t => <option key={t}>{t}</option>)}</select></label>
      <label>Rueda<select value={form.rueda} onChange={e => update('rueda', e.target.value)}>{Object.entries(wheels).map(([id, w]) => <option key={id} value={id}>{w.nombre}</option>)}</select></label>
      <label>Filósofo<select value={form.filosofo} onChange={e => update('filosofo', e.target.value)}><option value="">Sin asignar</option>{Object.entries(philosophersRegistry).map(([id, p]) => <option key={id} value={id}>{p.nombre}</option>)}</select></label>
      <label>Tema<input value={form.tema} onChange={e => update('tema', e.target.value)} /></label>
      <label className="wide">Pregunta<input value={form.pregunta} onChange={e => update('pregunta', e.target.value)} /></label>
      <label>Imagen de pregunta<input type="file" accept="image/*" onChange={e => fileValue(e, 'preguntaImagen')} /></label>
      <label>Audio de pregunta<input type="file" accept="audio/*" onChange={e => fileValue(e, 'preguntaAudio')} /></label>
      <label>Respuesta correcta<input value={form.respuesta} onChange={e => update('respuesta', e.target.value)} /></label>
      <label>Imagen de respuesta<input type="file" accept="image/*" onChange={e => fileValue(e, 'respuestaImagen')} /></label>
      <label>Audio de respuesta<input type="file" accept="audio/*" onChange={e => fileValue(e, 'respuestaAudio')} /></label>
      {form.distractores.slice(0, 3).map((value, i) => <React.Fragment key={i}><label>Distractor {i + 1}<input value={value} onChange={e => update('distractores', form.distractores.map((v, n) => n === i ? e.target.value : v))} /></label><label>Imagen del distractor {i + 1}<input type="file" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (file) { const images = [...form.distractorImages]; images[i] = await dataUrl(file); update('distractorImages', images); } }} /></label></React.Fragment>)}
      {Array.from({ length: extraCount }, (_, i) => <React.Fragment key={`extra-${i}`}><label>Distractor {i + 4}<input value={form.distractores[i + 3] || ''} onChange={e => { const next = [...form.distractores]; next[i + 3] = e.target.value; update('distractores', next); }} /></label><label>Imagen del distractor {i + 4}<input type="file" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (file) { const images = [...form.distractorImages]; images[i + 3] = await dataUrl(file); update('distractorImages', images); } }} /></label></React.Fragment>)}
      <button type="button" className="secondary" onClick={() => { update('distractores', [...form.distractores, '']); update('distractorImages', [...form.distractorImages, null]); setExtraCount(n => n + 1); }}><Plus size={16} /> Añadir Distractor</button>
      <label className="wide">Explicación<textarea value={form.explicacion} onChange={e => update('explicacion', e.target.value)} /></label><label className="wide">Pista<input value={form.pista} onChange={e => update('pista', e.target.value)} /></label>
      <label className="wide">Tiempo: {form.tiempo} segundos<input type="range" min="10" max="90" value={form.tiempo} onChange={e => update('tiempo', Number(e.target.value))} /></label>
    </div><div className="admin-actions"><button className="primary"><Save size={18} /> Guardar Pregunta</button><button type="button" className="secondary" onClick={() => setPreview(toQuestion())}><Play size={17} /> Probar</button></div></form>{notice && <p role="status">{notice}</p>}</section>
    <section className="admin-card"><h2>Preguntas guardadas · {items.length}</h2><div className="admin-actions"><button className="secondary" onClick={exportJson}><Download size={16} /> Exportar a JSON</button><label className="file-button"><FileUp size={16} /> Importar JSON<input type="file" accept="application/json,.json" onChange={importJson} /></label><label className="file-button"><FileUp size={16} /> Importar CSV<input type="file" accept="text/csv,.csv" onChange={importCsv} /></label><button className="secondary" onClick={() => { persist([]); setNotice('Preguntas de prueba eliminadas.'); }}><Trash2 size={16} /> Limpiar preguntas de prueba</button></div>
      <div className="admin-list">{items.map(q => <article key={q.id}><div><b>{q.tipo}</b><p>{q.pregunta.texto || q.id}</p><small>{wheels[q.rueda]?.nombre || q.rueda}</small></div><div className="admin-actions"><button aria-label="Probar" onClick={() => setPreview(q)}><Play size={16} /></button><button aria-label="Probar en Ruleta" title="Probar en Ruleta" onClick={() => { localStorage.setItem('pregunta_siguiente_ruleta', JSON.stringify(q)); setNotice('Pregunta preparada para la siguiente partida local.'); }}><CheckCircle2 size={16} /></button><button aria-label="Editar" onClick={() => edit(q)}><Save size={16} /></button><button aria-label="Duplicar" onClick={() => persist([...items, { ...q, id: `${q.id}_COPY_${Date.now()}` }])}><Copy size={16} /></button><button aria-label="Borrar" onClick={() => persist(items.filter(item => item.id !== q.id))}><Trash2 size={16} /></button></div></article>)}</div>
    </section><button className="admin-back" onClick={exitAdmin}><ArrowLeft size={16} /> Salir</button>
  </main>;
}

export { ADMIN_ROUTE };
