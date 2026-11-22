// Original exercises aligned with the recorded syllabus: inference, syllogisms and symbolic operations.
const entries = [
  {
    row: ['¿Qué forma corresponde al silogismo hipotético, que encadena dos condiciones?', 'P → Q; Q → R; ∴ P → R', 'P → Q; R → Q; ∴ P → R', 'P → Q; Q → R; ∴ R → P', 'P → Q; Q → R; ∴ P → ¬R'],
    memory: 'Hipotético: trabaja con condiciones. En una cadena, busca el eslabón compartido y distingue el inicio del final.',
    why: 'Si P lleva a Q y Q lleva a R, entonces P lleva a R. Por ejemplo: si estudio, me preparo; si me preparo, mejoro mis posibilidades. Bajo esas premisas, estudiar lleva a mejorar mis posibilidades. No se puede invertir la cadena sin otra premisa.',
  },
  {
    row: ['¿Qué forma corresponde a la regla de conjunción, que reúne dos afirmaciones ya aceptadas?', 'P; Q; ∴ P ∧ Q', 'P ∨ Q; ∴ P ∧ Q', 'P; ∴ P ∧ Q', 'P ∧ Q; ∴ ¬P'],
    memory: 'Con-junción: juntar. Revisa qué información está realmente disponible antes de reunirla.',
    why: 'La conjunción permite afirmar P y Q juntas cuando ya disponemos de ambas. Si sabemos que Ana estudia y también sabemos que Ana trabaja, podemos decir que estudia y trabaja. Conocer solo P no autoriza a inventar Q.',
  },
  {
    row: ['¿Qué forma corresponde a la simplificación, que toma una parte de una conjunción?', 'P ∧ Q; ∴ P', 'P ∨ Q; ∴ P', 'P; ∴ Q', 'P ∧ Q; ∴ ¬Q'],
    memory: 'Simplificar: conservar una parte sin añadir información. Mira qué conector une los datos.',
    why: 'Si P y Q son verdaderas conjuntamente, cada una es verdadera. De «Ana estudia y trabaja» se sigue «Ana estudia». Esto no funciona con «o»: saber que estudia o trabaja no nos dice cuál de las dos ocurre.',
  },
  {
    row: ['¿Qué forma corresponde a la adición, que permite introducir una disyunción a partir de una afirmación?', 'P; ∴ P ∨ Q', 'P; ∴ P ∧ Q', 'P ∨ Q; ∴ Q', 'P; ∴ ¬Q'],
    memory: 'Adición: agregar una alternativa. Distingue proponer alternativas de asegurar que ambas ocurren.',
    why: 'En lógica clásica, «o» es inclusiva: basta que una alternativa sea verdadera. Si sabemos P, podemos afirmar P o Q aunque no sepamos si Q ocurre. Esto no demuestra Q ni permite afirmar P y Q a la vez.',
  },
  {
    row: ['¿Qué forma corresponde al dilema constructivo, que combina dos condiciones con una alternativa entre sus antecedentes?', 'P → Q; R → S; P ∨ R; ∴ Q ∨ S', 'P → Q; R → S; P ∨ R; ∴ Q ∧ S', 'P → Q; R → S; Q ∨ S; ∴ P ∧ R', 'P → Q; R → S; P ∨ R; ∴ ¬Q ∧ ¬S'],
    memory: 'Dilema: dos rutas. Constructivo: atiende a lo que se afirma. Mantén separados los datos de cada ruta.',
    why: 'Hay dos rutas: P conduce a Q y R conduce a S. Si se cumple P o R, se cumple Q o S. No podemos asegurar las dos conclusiones juntas, porque la premisa no asegura que ocurran ambos antecedentes.',
  },
  {
    row: ['¿Qué forma corresponde al dilema destructivo, que usa la negación de al menos uno de dos consecuentes?', 'P → Q; R → S; ¬Q ∨ ¬S; ∴ ¬P ∨ ¬R', 'P → Q; R → S; ¬Q ∨ ¬S; ∴ ¬P ∧ ¬R', 'P → Q; R → S; ¬P ∨ ¬R; ∴ ¬Q ∨ ¬S', 'P → Q; R → S; ¬Q ∨ ¬S; ∴ P ∧ R'],
    memory: 'Destructivo: atiende a las negaciones. Dilema: revisa dos rutas, sin confundir «una u otra» con «las dos».',
    why: 'Si una de las consecuencias exigidas no ocurre, tampoco ocurre su antecedente correspondiente. De no Q o no S concluimos no P o no R. La disyunción no permite asegurar que ambos antecedentes sean falsos.',
  },
  {
    row: ['¿Qué argumento tiene la forma de Bárbara, un silogismo categórico de la primera figura?', 'Todos los M son P; todos los S son M; ∴ todos los S son P', 'Todos los M son P; todos los S son P; ∴ todos los S son M', 'Todos los M son P; ningún S es M; ∴ ningún S es P', 'Algunos M son P; todos los S son M; ∴ todos los S son P'],
    memory: 'Bárbara tiene tres vocales A. En la clasificación tradicional, A es universal afirmativa. Busca el término que conecta los grupos.',
    why: 'Bárbara tiene el modo AAA de la primera figura: el grupo S está incluido en M, y M en P; por eso S está incluido en P. «Mamíferos son animales; perros son mamíferos; por tanto, perros son animales» muestra la estructura. M es el término medio y desaparece de la conclusión.',
  },
  {
    row: ['¿Qué argumento tiene la forma de Celarent, un silogismo categórico de la primera figura?', 'Ningún M es P; todos los S son M; ∴ ningún S es P', 'Ningún M es P; todos los S son P; ∴ todos los S son M', 'Ningún M es P; algunos S son P; ∴ todos los S son M', 'Ningún M es P; todos los S son M; ∴ algunos S son P'],
    memory: 'Celarent conserva las vocales E-A-E. E es universal negativa; A, universal afirmativa. Localiza primero el grupo que hace de puente.',
    why: 'Celarent tiene el modo EAE de la primera figura. Ningún miembro de M pertenece a P, y todos los S pertenecen a M; por eso ningún S pertenece a P. Por ejemplo: ningún pez es mamífero; todos los salmones son peces; por tanto, ningún salmón es mamífero.',
  },
  {
    row: ['En lógica clásica, ¿qué equivalencia expresa la ley de doble negación?', '¬¬P ↔ P', '¬¬P ↔ ¬P', '¬¬P ↔ (P ∧ ¬P)', '¬¬P ↔ (P ∨ ¬P)'],
    memory: 'Dos veces «no»: examina el alcance de cada negación. No confundas dos negaciones de una afirmación con negar dos afirmaciones distintas.',
    why: 'En lógica clásica, negar dos veces una afirmación devuelve su valor inicial: no es cierto que no P equivale a P. Si P es verdadera, ambas son verdaderas; si P es falsa, ambas son falsas. La ley se refiere a la negación lógica, no a usos coloquiales como «no vino nadie».',
  },
  {
    row: ['¿Qué equivalencia es la ley de De Morgan para negar una conjunción?', '¬(P ∧ Q) ↔ (¬P ∨ ¬Q)', '¬(P ∧ Q) ↔ (¬P ∧ ¬Q)', '¬(P ∧ Q) ↔ (P ∨ Q)', '¬(P ∧ Q) ↔ (P ∧ Q)'],
    memory: 'De Morgan: la negación afecta a todo el grupo. Observa los paréntesis y comprueba casos antes de elegir el conector.',
    why: 'Negar que P y Q ocurran juntas no exige que ambas sean falsas: basta con que falle una. Por eso «no ambas» equivale a «no P o no Q». «No estudio y trabajo a la vez» puede cumplirse porque no estudio, porque no trabajo o porque no hago ninguna de las dos cosas.',
  },
  {
    row: ['¿Qué equivalencia es la ley de De Morgan para negar una disyunción?', '¬(P ∨ Q) ↔ (¬P ∧ ¬Q)', '¬(P ∨ Q) ↔ (¬P ∨ ¬Q)', '¬(P ∨ Q) ↔ (P ∧ Q)', '¬(P ∨ Q) ↔ (P ∨ Q)'],
    memory: 'Lee dónde empieza y termina la negación. Prueba qué sucede si una de las alternativas fuera verdadera; luego revisa qué exige negar el grupo entero.',
    why: 'La disyunción inclusiva es verdadera si al menos una alternativa es verdadera. Para negarla deben ser falsas las dos: no P y no Q. «No es cierto que estudio o trabajo» equivale, en esta lectura lógica, a «no estudio y no trabajo».',
  },
];
export const additionalLogic = entries.map(entry => entry.row);
export const logicLessons = new Map(entries.map(entry => [entry.row[0], entry.why]));
export const logicMemories = new Map(entries.map(entry => [entry.row[0], entry.memory]));
