import { logicMemories } from './logic-expansion.js';
const inference = [
  ['ponendo ponens|modus ponens', {
    clue: 'En «si P, entonces Q», P es el antecedente (la condición) y Q el consecuente (lo que se sigue). Modus ponens afirma P y aplica la regla para obtener Q.',
    steps: ['Regla: si llueve, se moja la calle.', 'Dato: llueve.', 'Conclusión: se moja la calle.'],
    why: 'La regla dice que P basta para Q. Cuando aceptamos la regla y afirmamos P, podemos concluir Q. Es una inferencia válida: la conclusión se sigue de las premisas.',
  }],
  ['tollendo tollens|modus tollens', {
    clue: 'Modus tollens parte de «si P, entonces Q» y niega Q. Si falta el resultado que P exigiría, ¿podría haberse dado P manteniendo verdadera la regla?',
    steps: ['Regla: si llueve, se moja la calle.', 'Dato: la calle no está mojada.', 'Conclusión: no llueve.'],
    why: 'Si P fuera verdadero, Q tendría que ser verdadero. Como Q es falso, P también debe ser falso para conservar la regla. Es una inferencia válida.',
  }],
  ['tollendo ponens', {
    clue: 'Aquí aparece «P o Q»: al menos una de las dos afirmaciones es verdadera. Si descartas una, examina cuál queda. Se llama silogismo disyuntivo.',
    steps: ['Premisa: Ana está en casa o en la biblioteca.', 'Dato: Ana no está en casa.', 'Conclusión: Ana está en la biblioteca.'],
    why: 'La disyunción asegura al menos una alternativa. Si una es falsa, la otra debe ser verdadera. No se necesita suponer que «o» excluye que ambas sean verdaderas.',
  }],
  ['afirmación del consecuente|afirmar el consecuente|Si llueve, se moja la calle', {
    clue: 'Afirmar el consecuente es empezar por el resultado Q y concluir que ocurrió P. Revisa si ese resultado podría tener otra causa: una condición suficiente no es necesariamente la única.',
    steps: ['Regla: si llueve, se moja la calle.', 'Dato: la calle está mojada.', 'Conclusión apresurada: llovió. Pero también pudo pasar un camión de limpieza.'],
    why: 'Este razonamiento es una falacia: de «si P, entonces Q» y «Q» no se puede asegurar «P». Q podría ocurrir por otra causa. Reconocer la forma de la falacia es una respuesta correcta al ejercicio; no significa que la inferencia sea válida.',
  }],
  ['negación del antecedente|negar el antecedente', {
    clue: 'Negar el antecedente es decir «no P» y concluir «no Q». La regla solo dice qué pasa si ocurre P; no dice que P sea la única manera de que ocurra Q.',
    steps: ['Regla: si llueve, se moja la calle.', 'Dato: no llueve.', 'Conclusión apresurada: la calle no se moja. Pero podrían estar regándola.'],
    why: 'Es una falacia: de «si P, entonces Q» y «no P» no se sigue «no Q». El resultado Q puede darse por otra vía. Identificar esta forma no equivale a considerarla válida.',
  }],
];
const exactFormal = new Set([
  '¿Qué principio impide afirmar y negar lo mismo en el mismo sentido?',
  '¿Qué reúne un concepto universal?',
  '¿Qué tipo de juicio es «algunos metales son líquidos»?',
  '¿Cuál contradice a «todos los S son P»?',
  '¿Qué forma tiene «si P, entonces Q; P; luego Q»?',
  '¿Qué hace válido un argumento deductivo?',
  '¿Qué determina la figura de un silogismo categórico?',
  '¿Qué tipo de silogismo usa proposiciones condicionales como premisas?',
  '¿Qué es «esta oración es falsa» en su lectura autorreferencial?',
  '¿Dónde aparece el término medio en la primera figura?',
  '¿Qué silogismo deja implícita una premisa?',
  '¿Qué estudian las ciencias formales?',
]);
export function formalGuide(prompt) {
  if (!prompt) return null;
  if (logicMemories.has(prompt)) return { kind: /equivalencia/.test(prompt) ? 'symbols' : 'inference', clue: logicMemories.get(prompt), steps: [] };
  const rule = inference.find(([pattern]) => new RegExp(pattern, 'i').test(prompt));
  if (rule) return { kind: 'inference', ...rule[1] };
  if (prompt.includes('si P, entonces Q; P; luego Q')) return { kind: 'inference', ...inference[0][1] };
  if (/[∧∨→↔¬]/.test(prompt)) return {
    kind: 'symbols',
    clue: 'P y Q representan afirmaciones que pueden ser verdaderas o falsas. Lee primero el conector: «y» exige ambas; «o» permite al menos una; «si… entonces…» expresa una condición.',
    steps: ['Ejemplo: P = «llueve»; Q = «se moja la calle».', 'P ∧ Q se lee «llueve y se moja la calle».', 'Una fórmula siempre verdadera es una tautología; siempre falsa, una contradicción; si puede variar, una contingencia.'],
  };
  if (!exactFormal.has(prompt)) return null;
  if (prompt.includes('esta oración es falsa')) return { kind: 'concepts', clue: 'Aquí la oración habla de sí misma. Prueba las dos posibilidades: ¿qué ocurre si la consideras verdadera y qué ocurre si la consideras falsa?', steps: ['Si fuera verdadera, lo que afirma exigiría que fuera falsa.', 'Si fuera falsa, no sería cierto que es falsa, y parecería verdadera.', 'La dificultad nace de aplicar verdadero y falso a esa autorreferencia.'] };
  if (prompt.includes('ciencias formales')) return { kind: 'concepts', clue: 'Distingue estudiar una estructura abstracta de observar un hecho del mundo. La lógica y las matemáticas justifican resultados mediante demostraciones.', steps: ['Observar que hoy llueve estudia un hecho.', 'Demostrar qué se sigue de unas premisas estudia una relación lógica.', 'Las ciencias formales trabajan con estructuras y relaciones abstractas.'] };
  if (prompt.includes('concepto universal')) return { kind: 'concepts', clue: 'Un concepto no es necesariamente el nombre de un individuo. «Universal» indica que se puede aplicar a varios casos.', steps: ['«Este perro» señala un individuo.', '«Perro» puede aplicarse a muchos individuos por rasgos compartidos.', 'El alcance del concepto se distingue del número de casos que estemos observando ahora.'] };
  if (prompt.includes('afirmar y negar lo mismo')) return { kind: 'concepts', clue: 'Revisa si se habla de lo mismo, al mismo tiempo y en el mismo sentido. Cambiar alguna de esas condiciones puede eliminar una aparente contradicción.', steps: ['«La puerta está abierta» y «la puerta no está abierta» se oponen si hablamos de la misma puerta al mismo tiempo.', 'Que ayer estuviera abierta y hoy cerrada no es una contradicción.', 'La regla se llama principio de no contradicción.'] };
  return {
    kind: 'concepts',
    clue: 'Una premisa es una afirmación de partida; la conclusión es lo que se obtiene de ella. «Todos» habla del grupo entero y «algunos» significa al menos uno. En un silogismo, S y P nombran grupos y M es el término que los conecta.',
    steps: ['Ejemplo: todos los mamíferos son animales. Todos los perros son mamíferos. Por tanto, todos los perros son animales.', '«Mamíferos» es el término medio: conecta las premisas y no aparece en la conclusión.', 'Validez significa que, si las premisas fueran verdaderas, la conclusión no podría ser falsa.'],
  };
}
const terms = {
  'Modus ponens': 'Regla válida: afirma la condición y obtiene su consecuencia.',
  'Modus tollens': 'Regla válida: niega la consecuencia y descarta la condición.',
  'Afirmación del consecuente': 'Falacia: toma el resultado como prueba de la condición.',
  'Negación del antecedente': 'Falacia: niega la condición y supone que el resultado es imposible.',
  'Una tautología': 'Una fórmula verdadera en todos los casos posibles.',
  Tautología: 'Verdadera con cualquier combinación de valores.',
  Contradicción: 'Falsa con cualquier combinación de valores.',
  'Una contradicción': 'Una fórmula falsa en todos los casos posibles.',
  Contingencia: 'Verdadera en algunos casos y falsa en otros.',
  'Una contingencia': 'Una fórmula que puede resultar verdadera o falsa.',
  'Particular afirmativo': 'Afirma algo de al menos un miembro de un grupo.',
  'Universal afirmativo': 'Afirma algo de todos los miembros de un grupo.',
  'Particular negativo': 'Niega algo de al menos un miembro de un grupo.',
  'Universal negativo': 'Niega algo de todos los miembros de un grupo.',
  'No contradicción': 'No afirmar y negar lo mismo a la vez y en el mismo sentido.',
  'Algún S no es P': 'Al menos un miembro del grupo S no pertenece al grupo P.',
  'Ningún S es P': 'Los grupos S y P no comparten ningún miembro.',
  'Algún S es P': 'Al menos un miembro del grupo S pertenece al grupo P.',
  'Todos los P son S': 'Cada miembro del grupo P pertenece también al grupo S.',
  Hipotético: 'Un silogismo que utiliza condiciones del tipo «si… entonces…».',
  Categórico: 'Un silogismo que relaciona clases o grupos.',
  Entimema: 'Un argumento que deja sin decir una de sus premisas.',
};
function literal(value) {
  const text = value.trim();
  return {P: 'llueve', A: 'llueve', Q: 'se moja la calle', B: 'se moja la calle', '¬P': 'no llueve', '¬A': 'no llueve', '¬Q': 'no se moja la calle', '¬B': 'no se moja la calle'}[text];
}
function statement(value) {
  const text = value.trim();
  if (text.startsWith('∴')) { const rest = statement(text.slice(1)); return rest ? 'por tanto, ' + rest : null; }
  const match = /^([¬]?[PQAB])\s*([→∨∧↔])\s*([¬]?[PQAB])$/.exec(text);
  if (!match) return literal(text);
  const left = literal(match[1]); const right = literal(match[3]);
  if (match[2] === '→') return `si ${left}, entonces ${right}`;
  return `${left} ${{'∨': 'o', '∧': 'y', '↔': 'si y solo si'}[match[2]]} ${right}`;
}
export function formalOptionHelp(prompt, option) {
  if (!formalGuide(prompt)) return null;
  if (terms[option]) return terms[option];
  if (!/[∧∨→↔¬∴]/.test(option)) return null;
  const parts = option.split(';').map(statement);
  if (parts.some(part => !part)) return null;
  return parts.map(part => part[0].toUpperCase() + part.slice(1)).join('. ') + '.';
}

export const quickMemories = [
  { word: 'Ponens / ponendo', meaning: 'Afirmar: dar algo por verdadero.' },
  { word: 'Tollens / tollendo', meaning: 'Negar: decir que algo no ocurre.' },
  { word: 'Antecedente', meaning: '«Ante» = antes: la condición del «si». ' },
  { word: 'Consecuente', meaning: 'Lo que sigue: la parte del «entonces».' },
];
export function formalHint(prompt) {
  const guide = formalGuide(prompt);
  if (!guide) return null;
  if (logicMemories.has(prompt)) return { kind: guide.kind === 'inference' ? 'rule' : guide.kind, categorical: /Bárbara|Celarent/.test(prompt), memory: logicMemories.get(prompt), cue: 'Separa los datos de la conclusión y comprueba el papel de cada conector. Elige tú la forma que respeta esas relaciones.' };
  if (guide.kind === 'inference') return {
    kind: 'rule',
    cue: 'Separa la regla, el dato y la conclusión. ¿Qué parte se afirma o se niega en el dato? Usa el nombre para orientarte; después decide tú qué se puede concluir.',
  };
  if (guide.kind === 'symbols') return {
    kind: 'symbols',
    cue: 'Prueba distintos valores de verdadero y falso para cada letra. Lee el conector antes de decidir si la expresión completa se cumple.',
  };
  return {
    kind: 'concepts',
    cue: prompt.includes('esta oración es falsa')
      ? 'Prueba leerla suponiendo que es verdadera y luego que es falsa. ¿Se mantiene lo que dice en cada caso?'
      : 'Localiza qué se da por supuesto y qué se quiere concluir. Revisa palabras como «todos», «algunos» y «ninguno»: no hablan de la misma cantidad.',
  };
}
