import { philosopherByKey } from './philosophers.js';

// Short concept notes shown after a response. The final sentence connects the
// note to the exact answer selected for that question.
const notes = {
  sartre: [
    'La existencia precede a la esencia: la persona no viene con una definición humana individual ya terminada, sino que se va definiendo en su situación y mediante sus proyectos.',
    'La libertad sartreana no significa poder controlar todo. Significa que, incluso bajo límites reales, cada persona toma posición y responde por el sentido de sus actos.',
    'La mala fe intenta escapar de la tensión entre facticidad (lo dado y ya vivido) y trascendencia (la posibilidad de proyectarse más allá de ello).',
    'El ser-en-sí nombra lo que simplemente es; el ser-para-sí, la conciencia que se distancia de lo dado y puede proyectar posibilidades. No son dos partes separadas de una persona.',
    'La mirada del otro revela que también somos objeto para otra conciencia. Esto puede generar conflicto, pero no implica que toda relación humana sea necesariamente hostil.',
    'La angustia surge al advertir que ninguna regla o autoridad elimina por completo la responsabilidad de elegir; el desamparo expresa la ausencia de garantías trascendentes para esa elección.'
  ],
  nietzsche: [
    'En la tragedia griega, lo apolíneo da forma e individuación, mientras lo dionisíaco expresa embriaguez y desborde. Nietzsche destaca su tensión creadora, no una simple lucha entre bien y mal.',
    'La genealogía pregunta cómo surgieron los valores y qué fuerzas los sostienen. Distingue la valoración afirmativa de los nobles de la inversión reactiva asociada al resentimiento.',
    'El perspectivismo niega el punto de vista absolutamente separado de toda interpretación. No concluye que todas las interpretaciones valgan lo mismo: pueden diferir en alcance y capacidad explicativa.',
    'La voluntad de poder nombra dinámicas de fuerza, interpretación, organización y superación; reducirla al deseo consciente de dominar políticamente empobrece su alcance filosófico.',
    'El nihilismo describe la pérdida de fuerza de los valores supremos heredados. La transvaloración propone revisar y crear valores, no cambiar mecánicamente cada valor por su contrario.',
    'El eterno retorno funciona como una prueba de afirmación de la vida, además de sus lecturas cosmológicas. La superación de sí no consiste en dominar a otros, sino en transformar la propia manera de vivir.'
  ],
  camus: [
    'El absurdo aparece en el encuentro entre nuestra demanda de sentido y un mundo que no ofrece una respuesta final. No es simplemente que la vida sea ridícula o que nada importe.',
    'Sísifo representa la lucidez ante una tarea sin desenlace definitivo. Su felicidad no depende de que venza a los dioses, sino de asumir su condición sin refugiarse en una esperanza falsa.',
    'La rebelión dice “no” a una humillación y, al mismo tiempo, afirma un límite y una dignidad compartidos. Por eso puede abrirse a la solidaridad sin justificar cualquier violencia.',
    'Para Camus, vivir sin una garantía absoluta no elimina la capacidad de elegir. La libertad concreta exige actuar con lucidez y reconocer los límites de nuestras justificaciones.',
    'En La peste, la solidaridad se expresa en acciones concretas frente al sufrimiento. La novela permite pensar tanto una epidemia como otras formas colectivas de mal y opresión.',
    'La medida camusiana limita la pretensión de justificarlo todo en nombre de una causa futura. La responsabilidad exige atender a las vidas afectadas por los medios elegidos.'
  ],
  hegel: [
    'La dialéctica atiende a tensiones internas de una forma de pensamiento o vida y a su transformación. No es una receta universal de tres pasos ni la idea de que cualquier contradicción sea verdadera.',
    'La autoconciencia requiere reconocimiento de otra autoconciencia. Una relación unilateral, como la del señor y el siervo, es inestable porque el reconocimiento que obtiene no es recíproco.',
    'El espíritu se desarrolla históricamente en prácticas, instituciones y formas de conciencia compartidas. No equivale a un fantasma individual ni a la simple suma de opiniones personales.',
    'La libertad no se reduce a hacer lo que se desea en cada instante. También necesita condiciones sociales e instituciones en las que las personas puedan reconocerse como libres.',
    'La lógica hegeliana examina categorías y sus relaciones, incluidas sus tensiones. No afirma que todo hecho existente sea automáticamente justo o que cualquier contradicción resulte aceptable.',
    'Arte, religión y filosofía son modos distintos en que el espíritu comprende lo absoluto. En la filosofía, esa comprensión adopta la forma del concepto; las formas no son intercambiables.'
  ],
  heidegger: [
    'Heidegger pregunta por el sentido del ser y analiza al Dasein como el ente para quien su propio ser está en juego. Dasein no significa simplemente “ser humano” como definición biológica.',
    'Ser-en-el-mundo indica que ya estamos implicados en redes de significado, tareas y relaciones. El cuidado describe esa estructura de estar concernidos por posibilidades, no solo una emoción amable.',
    'La muerte es una posibilidad propia, insuperable y no delegable: otros pueden morir, pero no pueden asumir mi morir. Anticiparla puede individualizar las posibilidades de existencia.',
    'El “uno” nombra modos impersonales de hacer y opinar que dictan lo normal. La autenticidad no exige aislamiento, sino apropiarse de las posibilidades propias en vez de vivirlas solo por inercia.',
    'La angustia puede retirar la familiaridad cotidiana y revelar la finitud. La temporalidad no es solo una sucesión de instantes: la existencia se comprende desde posibilidades, herencias y situaciones presentes.',
    'La verdad como desocultamiento señala que algo puede mostrarse al salir de un ocultamiento. Esto no elimina la corrección de los enunciados, sino que pregunta por la apertura que permite que algo aparezca como verdadero.'
  ],
  roig: [
    'El a priori antropológico parte del acto histórico de afirmarse como sujeto valioso y capaz de filosofar. No es una estructura abstracta separada de las condiciones sociales.',
    'Pensar América Latina requiere reconocer sujetos concretos y sus historias, no tratarlos como casos tardíos de un camino europeo supuestamente único.',
    'Filosofar también implica reconocer a otros como sujetos de palabra y pensamiento. La tarea crítica examina quién puede hablar, desde qué lugar y bajo qué relaciones de poder.',
    'La dependencia no se reduce a una falta de ideas propias: incluye relaciones históricas, económicas y culturales que condicionan la producción y circulación del saber.',
    'La utopía permite proyectar alternativas y orientar la crítica del presente; no es una predicción garantizada ni un plano que suprima la contingencia histórica.',
    'Una filosofía situada puede dialogar con preguntas universales sin borrar su particularidad. Lo universal se construye y revisa desde experiencias históricas diversas.'
  ],
  dussel: [
    'La totalidad es el orden que organiza lo que aparece como normal; la exterioridad permite escuchar a quienes ese orden excluye o reduce a objeto. No significa estar literalmente fuera de toda sociedad.',
    'La ética de la liberación parte de la producción, reproducción y desarrollo de la vida humana en comunidad. No es una autorización para alcanzar fines valiosos mediante cualquier medio.',
    'Las víctimas hacen visible el daño que una institución puede ocultar mientras se presenta como legítima. Su perspectiva inicia la crítica, aunque las soluciones aún requieren diálogo y análisis.',
    'La validez ética requiere participación en condiciones de diálogo; la comunidad real es desigual y por eso debe reconocerse y transformarse. Consenso no equivale automáticamente a justicia.',
    'Dussel analiza la modernidad junto con la conquista y la colonialidad, no solo como progreso interno europeo. Esta lectura muestra costos y relaciones de poder que las narrativas celebratorias omiten.',
    'La praxis de liberación combina reflexión y acción para transformar relaciones que producen exclusión. Es un proceso histórico colectivo, no un acto único ni la sustitución de una dominación por otra.'
  ],
  zea: [
    'Zea aborda la identidad latinoamericana como una construcción histórica y plural, no como una esencia fija. Filosofar desde América implica asumir sus problemas y participar en la conversación universal.',
    'El historicismo considera que las ideas se comprenden en las circunstancias que les dan sentido. Situarlas históricamente no las vuelve meras opiniones ni impide evaluarlas.',
    'La emancipación política no elimina por sí sola dependencias culturales e intelectuales. La crítica busca apropiarse de ideas de forma creativa y responder a condiciones propias.',
    'El humanismo de Zea amplía el reconocimiento de la dignidad y capacidad de todos los pueblos. La igualdad no exige uniformar sus historias ni sus expresiones.',
    'América Latina no debe pensarse como una región aislada: su historia está entrelazada con la del mundo, aunque desde posiciones desiguales que también deben hacerse visibles.',
    'Un proyecto de futuro orienta la acción presente, pero permanece abierto a revisión y participación. No es un destino ya escrito ni una copia de modelos ajenos.'
  ]
};

const explanations = new Map();
for (const [key, author] of Object.entries(philosopherByKey)) {
  author.topics.forEach(([topic, , , rows], i) => {
    for (const [prompt, answer] of rows) {
      explanations.set(prompt, `${notes[key][i]} En esta pregunta, la opción «${answer}» es la correcta porque expresa ese matiz central.`);
    }
  });
}

export function philosopherExplanation(prompt) {
  return explanations.get(prompt);
}
