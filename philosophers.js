import { sartreTopics } from './sartre.js';
import { philosopherExpansion } from './philosopher-expansion.js';

const hues = ['#7252a3', '#df8d40', '#cf5d74', '#4d9b8e', '#5586c9', '#bd5caa'];
const sector = (name, short, color, rows) => [name, short, color, rows];
const q = (prompt, answer, ...distractors) => [prompt, answer, ...distractors];

export const philosopherData = [
  { key: 'sartre', name: 'Jean-Paul Sartre', note: 'Existencialismo, libertad y compromiso', topics: sartreTopics },
  { key: 'nietzsche', name: 'Friedrich Nietzsche', note: 'Genealogía, valores y voluntad de poder', topics: [
    sector('Lo apolíneo y lo dionisíaco', 'Apolíneo / dionisíaco', hues[0], [
      q('En El nacimiento de la tragedia, ¿qué expresa principalmente lo apolíneo?', 'Forma, medida, individuación e imagen', 'Éxtasis que disuelve la individualidad', 'La obediencia a una ley moral universal', 'La explicación científica del sufrimiento'),
      q('¿Qué expresa principalmente lo dionisíaco en la interpretación nietzscheana de la tragedia?', 'La embriaguez, la música y la experiencia de unidad que desborda al individuo', 'La serenidad de las formas claramente delimitadas', 'La separación racional entre sujeto y mundo', 'La renuncia cristiana a toda celebración'),
      q('¿Cómo surge la tragedia ática según el joven Nietzsche?', 'De la tensión creadora entre impulsos apolíneos y dionisíacos', 'De la victoria definitiva de la razón sobre el mito', 'De la sustitución de la música por el diálogo filosófico', 'De la negación completa de lo dionisíaco'),
      q('¿Qué sería una lectura simplificadora de lo apolíneo y lo dionisíaco?', 'Tratarlos como una oposición entre bien y mal que debe resolverse eliminando uno', 'Reconocer que ambos impulsos cooperan en la tragedia', 'Relacionar lo apolíneo con la forma artística', 'Vincular lo dionisíaco con la música y la embriaguez'),
    ]),
    sector('Genealogía de la moral', 'Genealogía moral', hues[1], [
      q('¿Qué pregunta guía el método genealógico de Nietzsche?', 'En qué condiciones históricas surgieron nuestros valores y qué formas de vida expresan', 'Qué mandatos morales son eternos por definición', 'Qué conducta produce mayor obediencia social', 'Qué principios pueden deducirse sin atender a la historia'),
      q('¿Cómo caracteriza Nietzsche la moral de señores?', 'Valora afirmativamente lo noble y poderoso desde su propia perspectiva', 'Nace exclusivamente del resentimiento de los impotentes', 'Define primero el mal y luego llama bueno a quien lo evita', 'Identifica lo bueno con la igualdad de todas las fuerzas'),
      q('¿Qué inversión caracteriza el origen de la moral de esclavos en la genealogía nietzscheana?', 'El resentimiento llama malvado al poderoso y bueno al humilde o impotente', 'Los nobles consideran malvado todo acto de generosidad', 'La compasión deja de tener cualquier valor social', 'Los valores se derivan de una demostración lógica neutral'),
      q('¿Qué significa “malo” en la distinción inicial de la moral de señores?', 'Lo bajo o común, sin que equivalga todavía al mal moral de la moral de esclavos', 'El enemigo metafísico de todo bien', 'El pecador que transgrede una ley divina', 'La persona que no comparte una verdad científica'),
    ]),
    sector('Perspectivismo y verdad', 'Perspectivismo', hues[2], [
      q('¿Qué sostiene el perspectivismo de Nietzsche?', 'Conocemos e interpretamos desde perspectivas; esto no vuelve equivalentes todas las interpretaciones', 'No existe ninguna diferencia entre una interpretación y una invención arbitraria', 'Un observador sin perspectiva puede conocer la realidad completa', 'La verdad consiste siempre en una opinión mayoritaria'),
      q('¿Qué critica Nietzsche al ideal de una verdad totalmente “sin perspectiva”?', 'Que imagina un conocer separado de todo interés, cuerpo e interpretación', 'Que la ciencia use observaciones repetibles', 'Que existan desacuerdos entre investigadores', 'Que algunas creencias sean revisadas por evidencia'),
      q('¿Cómo se relaciona el perspectivismo con la objetividad?', 'Ampliar y contrastar perspectivas puede enriquecer el conocimiento', 'La objetividad exige no tener cuerpo ni historia', 'Toda perspectiva debe aceptarse como igualmente verdadera', 'La objetividad desaparece si hay más de un observador'),
      q('¿Cuál afirmación evita confundir perspectivismo con relativismo absoluto?', 'Las interpretaciones pueden compararse por su alcance y por lo que permiten comprender', 'Ninguna afirmación puede ser mejor que otra', 'La verdad es solo el gusto privado de quien habla', 'Una interpretación se vuelve verdadera si se impone'),
    ]),
    sector('Voluntad de poder', 'Voluntad de poder', hues[3], [
      q('¿Cómo conviene entender la voluntad de poder en Nietzsche?', 'Como un nombre para dinámicas de expansión, organización e interpretación de fuerzas', 'Como el deseo consciente de ocupar cargos políticos', 'Como una sustancia espiritual idéntica en todos los seres', 'Como una ley física cuantificada por Nietzsche'),
      q('¿Por qué reducir la voluntad de poder a “querer mandar sobre otras personas” es insuficiente?', 'Porque Nietzsche la aplica más ampliamente a formas de crecimiento, configuración y superación', 'Porque Nietzsche niega que existan conflictos de poder', 'Porque solo habla de la voluntad de obedecer', 'Porque considera que el poder es exclusivamente económico'),
      q('En una lectura nietzscheana, ¿qué puede hacer una fuerza activa?', 'Interpretar y dar forma a lo que encuentra', 'Limitarse siempre a reaccionar contra una ofensa', 'Eliminar toda diferencia entre los seres', 'Obedecer una finalidad universal externa'),
      q('¿Qué no debe inferirse automáticamente de la voluntad de poder?', 'Que toda acción tenga por único fin dominar políticamente a alguien', 'Que haya relaciones de fuerza', 'Que los valores puedan expresar formas de vida', 'Que una interpretación transforme lo interpretado'),
    ]),
    sector('Nihilismo y transvaloración', 'Nihilismo', hues[4], [
      q('¿Qué indica la fórmula “Dios ha muerto” en Nietzsche?', 'La pérdida de fuerza cultural de los fundamentos supremos tradicionales y la crisis de sus valores', 'La demostración de que nunca existió ninguna religión', 'El triunfo definitivo de una moral científica', 'La desaparición literal de toda creencia individual'),
      q('¿Qué riesgo abre el nihilismo?', 'Que los valores supremos pierdan credibilidad y la vida parezca carecer de sentido', 'Que todas las personas se vuelvan automáticamente libres', 'Que la ciencia resuelva por sí sola todo problema moral', 'Que ya no sea posible formular ninguna pregunta'),
      q('¿Qué busca la transvaloración de los valores?', 'Reexaminar y crear valores en vez de conservarlos solo por tradición', 'Cambiar una autoridad religiosa por una obediencia idéntica a la ciencia', 'Restaurar sin crítica todos los valores antiguos', 'Probar que cualquier valor tiene el mismo efecto'),
      q('¿Qué diferencia a la crítica nietzscheana de una simple invitación al desorden?', 'Exige evaluar qué valores afirman o empobrecen la vida', 'Declara que ninguna acción tiene consecuencias', 'Propone obedecer cada impulso pasajero', 'Sostiene que la historia debe detenerse'),
    ]),
    sector('Eterno retorno y superación', 'Retorno / superación', hues[5], [
      q('¿Qué pregunta plantea la idea del eterno retorno como prueba existencial?', 'Si afirmarías esta vida hasta querer vivirla de nuevo, con todo lo que contiene', 'Si el universo repite cada acontecimiento según una ley física ya probada', 'Si el pasado puede modificarse mediante la memoria', 'Si una acción se vuelve buena cuando se repite'),
      q('¿Qué representa el Übermensch en Así habló Zaratustra?', 'Una figura de superación y creación de valores, no una categoría biológica o racial', 'El gobernante con derecho natural a someter a otros', 'El creyente que restaura los valores tradicionales', 'Un ideal de igualdad política ya alcanzado'),
      q('¿Qué relación tiene la autosuperación con la creación de valores?', 'Quien se supera no se limita a recibir valores heredados como definitivos', 'Superarse consiste en obedecer sin examinar la tradición', 'Crear valores elimina toda disciplina personal', 'La superación busca regresar a una esencia fija'),
      q('¿Por qué el eterno retorno no debe presentarse sin matices como teoría cosmológica demostrada?', 'Porque también funciona en la obra como experimento de afirmación y valoración de la vida', 'Porque Nietzsche niega que el tiempo exista', 'Porque solo describe una creencia religiosa antigua', 'Porque demuestra que nada cambia en la experiencia'),
    ]),
  ]},
  { key: 'camus', name: 'Albert Camus', note: 'Absurdo, rebelión y solidaridad', topics: [
    sector('El absurdo', 'Absurdo', hues[0], [
      q('¿Cómo nace el absurdo en Camus?', 'Del encuentro entre la demanda humana de sentido y el silencio del mundo', 'De la demostración de que el mundo es moralmente perverso', 'De la certeza de que nada existe fuera de la mente', 'De una contradicción lógica dentro de cada deseo'),
      q('¿Qué postura evita tanto la evasión como la desesperación ante el absurdo?', 'Mirarlo de frente y continuar viviendo sin inventar una garantía absoluta', 'Suponer que una religión resuelve racionalmente toda pregunta', 'Concluir que cualquier acción carece de importancia', 'Esperar a que la ciencia otorgue un sentido final'),
      q('¿Por qué Camus rechaza el suicidio como respuesta filosófica al absurdo?', 'Porque elimina al sujeto que podría sostener la confrontación lúcida con el absurdo', 'Porque cree que el suicidio es imposible en toda circunstancia', 'Porque supone que el suicidio demuestra la inmortalidad', 'Porque considera que el sufrimiento siempre es útil'),
      q('¿Qué entiende Camus por “vivir sin apelación”?', 'No recurrir a una garantía trascendente para evitar la tensión de la existencia', 'Negar que existan otros seres humanos', 'Abandonar toda decisión práctica', 'Aceptar que el destino determina cada acto'),
    ]),
    sector('Sísifo y la lucidez', 'Sísifo', hues[1], [
      q('¿Por qué Camus imagina a Sísifo feliz?', 'Porque su lucidez y su desafío hacen suyo el destino que no puede cambiar', 'Porque finalmente logra dejar la piedra en la cima', 'Porque los dioses cancelan su castigo', 'Porque descubre una recompensa después de la muerte'),
      q('¿Qué momento destaca Camus en el mito de Sísifo?', 'El descenso, cuando el personaje es consciente de su condición', 'La primera vez que empuja la piedra sin conocer el castigo', 'La desaparición de la montaña', 'La explicación científica del origen de los dioses'),
      q('¿Qué simboliza la tarea repetida de Sísifo?', 'Una condición sin solución final que puede afrontarse con lucidez', 'La prueba de que todo trabajo repetido es inútil', 'La promesa de progreso acumulativo', 'La obligación de aceptar cualquier castigo como justo'),
      q('¿Qué convierte el desafío de Sísifo en algo distinto de una esperanza de rescate?', 'La aceptación lúcida de su situación, sin esperar que desaparezca por intervención externa', 'La certeza de que la piedra dejará de caer', 'La confianza en una recompensa futura', 'La pérdida de conciencia durante el esfuerzo'),
    ]),
    sector('Rebelión y límites', 'Rebelión', hues[2], [
      q('¿Qué afirma inicialmente quien se rebela, según Camus?', 'Que hay un límite que no debe ser traspasado y una dignidad que merece respeto', 'Que toda regla debe obedecerse sin excepción', 'Que la violencia no puede ocurrir en la historia', 'Que cada individuo posee una verdad privada incuestionable'),
      q('¿Por qué la rebelión puede crear solidaridad?', 'Porque al defender una dignidad compartida, el rebelde descubre algo común con otros', 'Porque todos los rebeldes quieren ocupar el mismo poder', 'Porque la solidaridad exige borrar las diferencias', 'Porque una rebelión elimina de inmediato la injusticia'),
      q('¿Qué peligro identifica Camus en la rebelión que se vuelve absoluta?', 'Que justifique el asesinato ilimitado en nombre de un futuro perfecto', 'Que reconozca límites a la acción', 'Que busque aliviar un sufrimiento concreto', 'Que se oponga a una injusticia presente'),
      q('¿Qué relación propone Camus entre rebelión y medida?', 'La rebelión necesita límites para no negar la dignidad que afirma', 'La medida obliga a aceptar cualquier abuso', 'La rebelión alcanza su fin cuando elimina toda discusión', 'La moderación consiste en no actuar ante la injusticia'),
    ]),
    sector('Libertad sin absolutos', 'Libertad', hues[3], [
      q('¿Qué libertad encuentra Camus frente al absurdo?', 'Una libertad vivida sin apelar a un sentido último garantizado', 'La capacidad de controlar todos los hechos futuros', 'La independencia completa respecto de otras personas', 'La obediencia a un plan universal ya conocido'),
      q('¿Por qué la ausencia de un sentido trascendente no conduce necesariamente a la pasividad?', 'Porque aún se puede actuar, elegir y responder ante sufrimientos concretos', 'Porque demuestra que cada acción será recompensada', 'Porque hace imposible distinguir entre acciones', 'Porque el mundo deja de imponer límites materiales'),
      q('¿Qué significa mantener la tensión del absurdo?', 'No suprimir ninguno de sus polos: la exigencia humana ni el silencio del mundo', 'Resolverlo afirmando una explicación definitiva', 'Negar que las personas busquen sentido', 'Transformar el absurdo en una ley moral universal'),
      q('¿Qué distingue la libertad absurda de la omnipotencia?', 'La libertad se ejerce dentro de límites que no controla por completo', 'La libertad permite cambiar el pasado', 'La libertad elimina toda dependencia corporal', 'La libertad evita tener que elegir'),
    ]),
    sector('Peste y solidaridad', 'Solidaridad', hues[4], [
      q('En La peste, ¿qué representa principalmente la respuesta del doctor Rieux?', 'Hacer su trabajo contra el sufrimiento sin necesitar una victoria definitiva', 'Buscar fama como salvador de la ciudad', 'Afirmar que la enfermedad tiene una causa moral', 'Esperar que una autoridad externa actúe por todos'),
      q('¿Qué expresa la “decencia” en la conducta de Rieux?', 'Cumplir con lo que corresponde frente al dolor, aunque no haya heroísmo grandioso', 'Obedecer toda orden sin evaluar sus efectos', 'Creer que el bien elimina para siempre el mal', 'Convertir la epidemia en un castigo ejemplar'),
      q('¿Por qué la peste puede leerse más allá de una epidemia literal?', 'También permite pensar la expansión del mal, la opresión y las respuestas colectivas', 'Porque la novela niega que exista una enfermedad física', 'Porque cada personaje representa una doctrina única sin ambigüedad', 'Porque el relato afirma que toda calamidad es inevitable'),
      q('¿Qué postura comparten quienes ayudan en la ciudad?', 'La acción solidaria importa aun cuando no garantice erradicar todo sufrimiento', 'La ayuda solo vale si asegura una victoria final', 'El aislamiento individual es la única respuesta racional', 'La enfermedad distingue con exactitud a culpables e inocentes'),
    ]),
    sector('Medida y responsabilidad', 'Medida', hues[5], [
      q('¿Qué es la medida en la reflexión política de Camus?', 'Un límite que impide que la justicia proclamada se convierta en justificación del crimen', 'Una regla para no cuestionar a ninguna autoridad', 'La búsqueda de una sociedad sin conflictos visibles', 'Una fórmula matemática para repartir la libertad'),
      q('¿Qué critica Camus en las ideologías que sacrifican vidas presentes por un futuro perfecto?', 'Que conviertan a personas reales en medios para una abstracción histórica', 'Que intenten disminuir la violencia', 'Que reconozcan la incertidumbre política', 'Que propongan reformas graduales'),
      q('¿Cómo se relacionan justicia y rebelión en Camus?', 'La rebelión nace de una exigencia de justicia, pero debe limitar los medios que emplea', 'La justicia autoriza cualquier medio si el fin es correcto', 'La rebelión deja de tener valor si no vence', 'La justicia depende solo de la intención privada'),
      q('¿Qué significa la solidaridad camusiana en una situación de sufrimiento?', 'Actuar junto a otros sin convertir la ayuda en prueba de superioridad moral', 'Esperar que todos compartan una misma doctrina', 'Imponer el sacrificio como condición para pertenecer', 'Renunciar a toda responsabilidad individual'),
    ]),
  ]},
  { key: 'hegel', name: 'Georg Wilhelm Friedrich Hegel', note: 'Dialéctica, reconocimiento e historia', topics: [
    sector('Dialéctica y contradicción', 'Dialéctica', hues[0], [
      q('¿Qué describe mejor el movimiento dialéctico en Hegel?', 'Una figura de pensamiento se desarrolla al encontrar tensiones que la transforman', 'Una disputa en la que siempre vence la opinión más popular', 'Un método para aplicar una regla fija a casos particulares', 'La sustitución de toda contradicción por una opinión neutral'),
      q('¿Qué significa Aufhebung en el uso hegeliano?', 'Cancelar y conservar a la vez aspectos de una figura al superarla', 'Rechazar por completo toda idea anterior', 'Repetir sin cambios una etapa histórica', 'Suspender el juicio porque no hay conocimiento'),
      q('¿Por qué la contradicción no es para Hegel solo un error que debe borrarse?', 'Puede revelar límites internos y conducir a una forma más desarrollada', 'Porque cualquier afirmación contradictoria es verdadera', 'Porque la lógica no tiene lugar en su filosofía', 'Porque las contradicciones solo aparecen en el lenguaje'),
      q('¿Qué diferencia una superación dialéctica de una simple síntesis conciliadora?', 'La nueva figura conserva y reorganiza momentos de la tensión, no los mezcla sin criterio', 'La síntesis elige siempre un punto medio aritmético', 'La superación elimina todos los elementos previos', 'La conciliación supone que nunca hubo conflicto'),
    ]),
    sector('Conciencia y reconocimiento', 'Reconocimiento', hues[1], [
      q('¿Qué necesita la autoconciencia para confirmarse como tal en Hegel?', 'El reconocimiento de otra autoconciencia', 'La ausencia completa de relaciones sociales', 'La contemplación de un objeto sin mediación', 'La obediencia a una autoridad natural'),
      q('¿Por qué la relación entre señor y siervo es inestable?', 'El señor depende del trabajo del siervo y recibe un reconocimiento desigual', 'El siervo no participa en ninguna actividad', 'El señor alcanza reconocimiento plenamente recíproco', 'Ambos abandonan de inmediato toda relación'),
      q('¿Qué puede aprender el siervo mediante el trabajo?', 'A dar forma al mundo y reconocerse en el producto de su actividad', 'Que la conciencia desaparece cuando trabaja', 'Que el señor es independiente de toda labor', 'Que la libertad consiste en no transformar objetos'),
      q('¿Por qué el reconocimiento unilateral no satisface plenamente?', 'Porque la confirmación proviene de alguien cuya autonomía no se reconoce en igualdad', 'Porque el reconocimiento solo puede venir de un objeto', 'Porque la autoconciencia no se relaciona con otras', 'Porque toda relación elimina necesariamente la libertad'),
    ]),
    sector('Espíritu e historia', 'Espíritu e historia', hues[2], [
      q('¿Qué nombra el Espíritu (Geist) en la filosofía hegeliana?', 'La vida racional e histórica que se realiza en prácticas e instituciones compartidas', 'Una entidad sobrenatural separada de toda sociedad', 'La suma de sensaciones privadas de una persona', 'Una fuerza física que mueve los planetas'),
      q('¿Cómo entiende Hegel la historia universal?', 'Como un proceso inteligible en el que se transforma la conciencia de la libertad', 'Como una sucesión de hechos sin ninguna relación posible', 'Como el progreso lineal de la tecnología únicamente', 'Como la repetición idéntica de un ciclo sin cambios'),
      q('¿Qué significa que la libertad se desarrolle históricamente?', 'Que su comprensión y realización toman formas concretas en distintos pueblos e instituciones', 'Que cada época inventa una libertad sin relación con las demás', 'Que solo las personas aisladas pueden ser libres', 'Que la libertad equivale siempre a hacer lo que se desea'),
      q('¿Qué precaución evita simplificar el “fin de la historia” hegeliano?', 'No reducir la racionalidad histórica a que ya no ocurran acontecimientos', 'Afirmar que Hegel niega cualquier cambio histórico', 'Suponer que todas las instituciones existentes son perfectas', 'Identificar historia con una cronología de gobernantes'),
    ]),
    sector('Libertad e instituciones', 'Libertad', hues[3], [
      q('¿Qué entiende Hegel por libertad concreta?', 'Una libertad que se realiza en relaciones e instituciones éticas, además de la voluntad individual', 'La ausencia absoluta de normas comunes', 'La obediencia mecánica a cualquier autoridad', 'La capacidad de elegir sin considerar a los demás'),
      q('¿Qué es la vida ética (Sittlichkeit)?', 'La vida de normas y prácticas compartidas en familia, sociedad civil y Estado', 'La moral privada separada de toda institución', 'Una lista de mandatos religiosos inmutables', 'La costumbre, aunque contradiga toda libertad'),
      q('¿Qué papel cumple la sociedad civil en los Principios de la filosofía del derecho?', 'Esfera de necesidades, trabajo, intercambio y asociaciones entre particulares', 'Espacio exclusivo de vínculos familiares afectivos', 'La unidad inmediata de la voluntad universal', 'El ámbito donde desaparecen los intereses particulares'),
      q('¿Por qué Hegel no identifica libertad con arbitrariedad individual?', 'Porque una voluntad puede ser libre al reconocerse en normas racionales compartidas', 'Porque toda decisión individual es necesariamente falsa', 'Porque la libertad consiste en no tener deseos', 'Porque el Estado decide cada pensamiento privado'),
    ]),
    sector('Lógica y realidad', 'Lógica', hues[4], [
      q('¿Qué estudia la Ciencia de la lógica de Hegel?', 'Las determinaciones conceptuales más fundamentales y sus relaciones', 'Solo las reglas formales de los silogismos escolares', 'La psicología experimental de los individuos', 'La clasificación empírica de las especies naturales'),
      q('¿Qué relación propone Hegel entre pensamiento y ser?', 'Las categorías del pensamiento y las estructuras de lo real no son ámbitos completamente ajenos', 'El pensamiento crea a voluntad todos los hechos físicos', 'La realidad es una ilusión privada sin estructura', 'El lenguaje determina por completo el universo material'),
      q('¿Qué significa “lo racional es real” en una lectura cautelosa?', 'Que lo efectivamente desarrollado puede comprenderse mediante su estructura racional, no que todo hecho sea justo', 'Que cualquier cosa existente merece aprobación moral', 'Que la razón solo describe deseos individuales', 'Que ningún cambio político puede ser legítimo'),
      q('¿Qué distinción conviene conservar al leer a Hegel?', 'Existencia inmediata y realidad efectiva en sentido filosófico no son sinónimos simples', 'Toda existencia es necesariamente racional y perfecta', 'La realidad efectiva equivale a una opinión subjetiva', 'La lógica no tiene relación con la realidad'),
    ]),
    sector('Arte, religión y filosofía', 'Formas del espíritu', hues[5], [
      q('¿Cómo distingue Hegel arte, religión y filosofía como formas del Espíritu absoluto?', 'Presentan el contenido absoluto, respectivamente, en intuición sensible, representación y concepto', 'Son tres religiones históricas que deben sucederse', 'La filosofía elimina cualquier contenido de arte y religión', 'El arte conoce por conceptos y la filosofía solo por imágenes'),
      q('¿Qué significa que el arte presente una verdad en forma sensible?', 'Que hace aparecer una significación mediante una configuración perceptible', 'Que toda obra es una copia exacta de la naturaleza', 'Que la belleza sustituye cualquier pensamiento', 'Que la materia carece de importancia para el arte'),
      q('¿Qué limita a la religión frente al saber filosófico en el esquema hegeliano?', 'Expresa su contenido mediante imágenes y representaciones, no solo en forma conceptual', 'Carece de cualquier contenido de verdad', 'Se ocupa exclusivamente de rituales políticos', 'Es idéntica a una demostración matemática'),
      q('¿Qué quiere decir la conocida tesis sobre el “fin del arte” en Hegel?', 'Que el arte ya no es para la modernidad la forma suprema de expresar la verdad, no que deje de producirse', 'Que toda producción artística terminó literalmente', 'Que el arte nunca tuvo relación con la verdad', 'Que los museos sustituyen a la filosofía'),
    ]),
  ]},
  { key: 'heidegger', name: 'Martin Heidegger', note: 'Ser, existencia y temporalidad', topics: [
    sector('Ser y Dasein', 'Ser y Dasein', hues[0], [
      q('¿Qué nombra Dasein en Ser y tiempo?', 'El ente que somos y para quien su propio ser está en cuestión', 'La totalidad de objetos físicos sin conciencia', 'Una sustancia mental separada del cuerpo', 'Un nombre técnico para cualquier ser vivo'),
      q('¿Qué diferencia hay entre preguntar por el ser y enumerar entes?', 'Preguntar por el ser interroga qué significa que algo sea, no solo qué cosas existen', 'Son preguntas idénticas con distinto vocabulario', 'La pregunta por el ser busca un ente más pequeño', 'Enumerar entes demuestra que el ser no existe'),
      q('¿Por qué el Dasein es “ser-en-el-mundo”?', 'Porque existe ya implicado en un mundo de significados y ocupaciones', 'Porque está contenido físicamente dentro del planeta', 'Porque contempla el mundo desde fuera como sujeto puro', 'Porque todos sus actos son movimientos espaciales'),
      q('¿Qué significa que el Dasein sea posibilidad?', 'Que su existencia se comprende desde maneras de ser que puede asumir', 'Que puede realizar cualquier cosa sin límites', 'Que carece de pasado y de situación', 'Que sus posibilidades son solo fantasías futuras'),
    ]),
    sector('Ser-en-el-mundo y cuidado', 'Mundo y cuidado', hues[1], [
      q('¿Cómo encontramos normalmente los útiles en la vida cotidiana?', 'Como algo “a la mano” dentro de una actividad y una red de referencias', 'Como objetos aislados observados primero sin uso', 'Como cosas cuyo significado depende solo de su masa', 'Como representaciones mentales sin relación práctica'),
      q('¿Qué puede revelar una herramienta rota?', 'La red de remisiones y propósitos que suele pasar inadvertida al usarla', 'Que los objetos nunca tienen significado práctico', 'Que toda comprensión del mundo es teórica', 'Que el Dasein deja de estar en el mundo'),
      q('¿Qué significa cuidado (Sorge) en el análisis existencial?', 'La estructura unitaria de estar ya en un mundo, proyectarse y ocuparse de entes', 'Una emoción compasiva que aparece ocasionalmente', 'La obligación moral de ayudar a cualquier persona', 'La preocupación por evitar toda posibilidad'),
      q('¿Por qué el mundo no es simplemente la suma de cosas presentes?', 'Porque es una trama de significatividad en la que las cosas pueden aparecer como relevantes', 'Porque las cosas materiales no existen', 'Porque cada individuo inventa arbitrariamente su entorno', 'Porque solo existe lo que se usa como herramienta'),
    ]),
    sector('Ser-para-la-muerte', 'Muerte', hues[2], [
      q('¿Qué hace de la muerte una posibilidad privilegiada para el Dasein?', 'Es propia, insuperable y cierta, aunque su cuándo permanezca indeterminado', 'Es un acontecimiento que otra persona puede experimentar en mi lugar', 'Es una posibilidad que puede realizarse y luego revertirse', 'Es una experiencia cuyo momento exacto siempre se conoce'),
      q('¿Qué puede abrir la anticipación de la muerte?', 'Asumir la finitud propia y apropiarse de posibilidades sin diluirlas en el “uno”', 'La prueba de que existe otra vida determinada', 'El rechazo de todo proyecto presente', 'La certeza de que ninguna decisión importa'),
      q('¿Qué significa que la muerte sea “la posibilidad de la imposibilidad”?', 'Que en ella se cierra la posibilidad de seguir existiendo como Dasein', 'Que la muerte es una opción entre muchas equivalentes', 'Que toda imposibilidad es mortal', 'Que la muerte solo significa dejar de imaginar'),
      q('¿Por qué Heidegger distingue la muerte propia de la muerte de otra persona?', 'La muerte ajena puede acompañarse, pero nadie puede asumir por otro su morir', 'Porque la muerte ajena no afecta a quienes sobreviven', 'Porque solo la muerte ajena es un hecho biológico', 'Porque la muerte propia puede ser observada desde fuera'),
    ]),
    sector('Autenticidad y el uno', 'Autenticidad', hues[3], [
      q('¿Qué es el “uno” (das Man) en Ser y tiempo?', 'La forma impersonal de las interpretaciones y expectativas cotidianas compartidas', 'Un individuo colectivo que gobierna toda sociedad', 'Una entidad metafísica que decide cada acción', 'El nombre de la conciencia moral auténtica'),
      q('¿Ser auténtico significa aislarse de los demás?', 'No; significa asumir las propias posibilidades dentro de un mundo compartido', 'Sí, porque toda relación impide la autenticidad', 'Sí, porque el Dasein no tiene existencia social', 'No; significa obedecer mejor las convenciones'),
      q('¿Qué expresa la resolución (Entschlossenheit)?', 'Asumir lúcidamente posibilidades propias sin escapar de la situación arrojada', 'Decidir con certeza todos los resultados futuros', 'Eliminar la angustia mediante una regla universal', 'Retirarse de cualquier compromiso práctico'),
      q('¿Por qué autenticidad e inautenticidad no equivalen a bien y mal moral?', 'Son modos existenciales de asumir o evadir el propio poder-ser', 'Porque Heidegger afirma que toda acción es moralmente igual', 'Porque la autenticidad significa cometer errores', 'Porque la moralidad depende únicamente de las leyes'),
    ]),
    sector('Angustia y temporalidad', 'Angustia y tiempo', hues[4], [
      q('¿Qué revela la angustia, a diferencia del miedo?', 'La extrañeza del estar-en-el-mundo sin dirigirse necesariamente a un objeto amenazante concreto', 'La presencia de un peligro específico identificable', 'La certeza de que una decisión futura será incorrecta', 'La reacción exclusiva ante el dolor físico'),
      q('¿Cómo es temporal la existencia del Dasein?', 'Se proyecta hacia posibilidades desde un haber-sido y actúa en situaciones presentes', 'Vive solo en el instante presente sin historia', 'Repite el pasado sin abrir futuros', 'Experimenta el tiempo como una secuencia externa únicamente'),
      q('¿Qué significa “haber-sido” en la temporalidad existencial?', 'El pasado asumido como aquello desde lo cual el Dasein ya está proyectándose', 'Un archivo de hechos que no influye en el presente', 'Una posibilidad futura todavía no elegida', 'La memoria voluntaria de todos los acontecimientos'),
      q('¿Por qué el tiempo originario no es solo una línea de “ahoras”?', 'Porque futuro, haber-sido y presente se articulan en la estructura del cuidado', 'Porque Heidegger niega que haya relojes', 'Porque pasado y futuro son idénticos', 'Porque solo existe una eternidad inmóvil'),
    ]),
    sector('Verdad y desocultamiento', 'Verdad', hues[5], [
      q('¿Qué sentido originario de verdad recupera Heidegger?', 'Desocultamiento o apertura en la que los entes pueden mostrarse', 'Correspondencia imposible entre cualquier frase y un objeto', 'Opinión subjetiva que reemplaza la evidencia', 'Consenso social sin relación con lo que aparece'),
      q('¿Heidegger sostiene que las proposiciones nunca son verdaderas?', 'No; analiza la verdad proposicional sobre el trasfondo de una apertura previa', 'Sí; considera que toda proposición es falsa', 'Sí; porque el lenguaje no puede referirse a entes', 'No; afirma que toda opinión corresponde a la realidad'),
      q('¿Qué quiere decir que la verdad tenga carácter de apertura?', 'Que algo debe poder mostrarse dentro de un horizonte de comprensión', 'Que cualquier cosa queda completamente expuesta', 'Que el sujeto crea los entes por nombrarlos', 'Que la verdad depende solo de la sinceridad'),
      q('¿Qué relación guarda el ocultamiento con la verdad?', 'Lo que se desoculta nunca queda necesariamente revelado en todos sus aspectos', 'El ocultamiento demuestra que no hay verdad', 'La verdad exige que nada permanezca oculto', 'La verdad es la suma de secretos individuales'),
    ]),
  ]},
  { key: 'roig', name: 'Arturo Andrés Roig', note: 'A priori antropológico y sujeto latinoamericano', topics: [
    sector('A priori antropológico', 'A priori antropológico', hues[0], [
      q('¿Qué formula el “a priori antropológico” de Roig?', 'El acto de un sujeto histórico que se tiene a sí mismo como valioso para ejercer el pensar', 'Una estructura biológica universal que determina toda cultura', 'Una verdad lógica anterior a cualquier lenguaje', 'Un método para eliminar la perspectiva del filósofo'),
      q('¿Por qué Roig vincula el filosofar con “ponernos a nosotros mismos como valiosos”?', 'Porque el sujeto debe reconocerse con derecho a pensar y a producir su propia palabra', 'Porque todo valor se reduce al orgullo personal', 'Porque la filosofía exige ignorar la historia', 'Porque solo los individuos célebres pueden filosofar'),
      q('¿Qué implica el a priori antropológico para la historia de la filosofía?', 'Que filosofar también supone una decisión histórica de afirmación del sujeto', 'Que la filosofía comienza solo con principios innatos', 'Que el sujeto no cambia a través del tiempo', 'Que la historia es irrelevante para el pensamiento'),
      q('¿Qué interpretación sería reductora del a priori antropológico?', 'Tratarlo como una propiedad psicológica individual desligada de condiciones históricas', 'Relacionarlo con la autoafirmación de un sujeto', 'Vincularlo con el comienzo del filosofar', 'Comprenderlo como una categoría histórico-social'),
    ]),
    sector('Sujeto e historia latinoamericana', 'Sujeto e historia', hues[1], [
      q('¿Qué busca una historia de las ideas latinoamericanas en Roig?', 'Reconstruir prácticas y discursos de sujetos concretos, no solo una lista de sistemas importados', 'Medir qué país produjo más filósofos famosos', 'Probar que América Latina carece de pensamiento propio', 'Reemplazar documentos históricos por doctrinas universales'),
      q('¿Cómo entiende Roig al sujeto latinoamericano?', 'Como un sujeto plural e histórico, capaz de afirmarse y transformar sus circunstancias', 'Como una identidad racial homogénea e inmutable', 'Como una copia pasiva de Europa', 'Como un individuo aislado de todo conflicto social'),
      q('¿Qué función cumple el contexto en la lectura roigiana de un texto filosófico?', 'Permite comprender las preguntas y proyectos de los sujetos que lo produjeron', 'Impide evaluar cualquier argumento', 'Sustituye el análisis conceptual por biografía', 'Demuestra que las ideas no pueden viajar entre culturas'),
      q('¿Qué corrige una historia de las ideas centrada solo en autores canónicos?', 'La invisibilización de actores, movimientos y formas colectivas de pensamiento', 'El exceso de atención a las condiciones históricas', 'La presencia de debates políticos en la filosofía', 'La posibilidad de comparar distintos períodos'),
    ]),
    sector('Filosofar y reconocimiento', 'Reconocimiento', hues[2], [
      q('¿Qué relación establece Roig entre filosofar y reconocimiento?', 'Reconocer al sujeto como valioso y con derecho a elaborar su propio discurso', 'Aceptar sin crítica el reconocimiento que concede una metrópoli', 'Sustituir la argumentación por una identidad compartida', 'Considerar valioso solo el pensamiento europeo'),
      q('¿Por qué la afirmación de un “nosotros” no debe borrar las diferencias?', 'Porque los sujetos históricos son plurales y sus proyectos pueden entrar en conflicto', 'Porque Roig niega que haya experiencias comunes', 'Porque toda identidad colectiva es necesariamente falsa', 'Porque el pensamiento no puede ser social'),
      q('¿Qué diferencia la autoafirmación crítica de un nacionalismo excluyente?', 'La primera exige revisar condiciones de dominación y no convertir la identidad en esencia cerrada', 'La autoafirmación requiere rechazar cualquier intercambio cultural', 'El nacionalismo excluyente incluye todas las diferencias', 'Ambos términos significan exactamente lo mismo'),
      q('¿Qué expresa una voz filosófica propia?', 'La capacidad de elaborar preguntas y conceptos desde una situación histórica, en diálogo crítico', 'El rechazo de toda lectura de autores extranjeros', 'La obligación de repetir una tradición local sin cambios', 'La producción de ideas sin referencias ni argumentos'),
    ]),
    sector('Crítica de la dependencia', 'Dependencia', hues[3], [
      q('¿Qué examina la crítica roigiana de la dependencia cultural?', 'Las relaciones que subordinan la producción y valoración de saberes', 'La imposibilidad de traducir cualquier texto', 'La inferioridad intelectual de una región', 'La necesidad de aislar una cultura de otras'),
      q('¿Qué sería una forma de dependencia en la actividad filosófica?', 'Usar categorías ajenas como universales sin examinar qué realidad explican o silencian', 'Dialogar críticamente con una tradición europea', 'Traducir un concepto y discutir sus límites', 'Comparar argumentos de distintas regiones'),
      q('¿Por qué criticar la dependencia no equivale a rechazar todo pensamiento europeo?', 'Porque el problema es la subordinación acrítica, no el origen geográfico de una idea', 'Porque Roig defiende copiar toda doctrina europea', 'Porque las ideas carecen de historia', 'Porque toda filosofía se produce en aislamiento'),
      q('¿Qué práctica ayuda a superar una dependencia intelectual?', 'Producir interpretación propia y someterla a discusión crítica', 'Cambiar de autoridad externa sin revisar el método', 'Evitar el diálogo con cualquier otra tradición', 'Afirmar que toda idea local es verdadera por ser local'),
    ]),
    sector('Utopía y futuro', 'Utopía', hues[4], [
      q('¿Qué papel puede cumplir la utopía en el pensamiento crítico de Roig?', 'Abrir posibilidades históricas y orientar la transformación, sin confundirse con un plano infalible', 'Predecir con exactitud el futuro político', 'Negar que existan condiciones materiales', 'Justificar cualquier sacrificio presente'),
      q('¿Qué diferencia una función crítica de la utopía de una fantasía evasiva?', 'La primera confronta el presente con posibilidades y tareas históricas', 'La utopía crítica no se relaciona con la acción', 'La fantasía siempre ofrece mejores argumentos', 'La utopía exige abandonar toda evaluación'),
      q('¿Por qué el futuro importa para un sujeto histórico?', 'Porque sus proyectos pueden abrir cursos de acción que no están garantizados de antemano', 'Porque el futuro determina completamente cada elección', 'Porque el presente no tiene consecuencias', 'Porque la historia avanza de manera idéntica en todos los pueblos'),
      q('¿Qué cuidado debe tenerse al hablar de emancipación?', 'No presentar un proyecto histórico como si su éxito estuviera asegurado', 'Evitar toda crítica de la injusticia', 'Suponer que emancipación significa uniformidad cultural', 'Afirmar que la libertad es solo individual'),
    ]),
    sector('Universales y particularidad', 'Universalidad', hues[5], [
      q('¿Cómo puede una filosofía situada alcanzar significación universal?', 'Elaborando problemas desde una experiencia concreta que puede entrar en diálogo con otras', 'Eliminando toda referencia a su contexto', 'Repitiendo definiciones aceptadas en todas partes', 'Rechazando cualquier comparación intercultural'),
      q('¿Qué cuestiona Roig en el uso de un universal abstracto?', 'Que oculte la situación particular desde la que se presenta como neutral', 'Que toda idea tenga alcance más allá de su lugar', 'Que existan conceptos compartidos', 'Que los argumentos puedan traducirse'),
      q('¿Qué relación es más adecuada entre lo particular y lo universal?', 'La particularidad puede revisar y enriquecer lo universal en diálogo crítico', 'Lo particular debe desaparecer para pensar', 'Lo universal es siempre una imposición sin excepciones', 'Ambos ámbitos no pueden relacionarse'),
      q('¿Qué evita convertir la filosofía latinoamericana en una esencia fija?', 'Reconocer su pluralidad histórica y su capacidad de transformación', 'Definirla por una única tradición ancestral', 'Separarla de toda discusión contemporánea', 'Afirmar que solo existe una identidad legítima'),
    ]),
  ]},
  { key: 'dussel', name: 'Enrique Dussel', note: 'Ética de la liberación y exterioridad', topics: [
    sector('Totalidad y exterioridad', 'Exterioridad', hues[0], [
      q('¿Qué nombra la “exterioridad” en Dussel?', 'La alteridad de quien no queda agotado ni reconocido por el orden dominante', 'Un espacio físico fuera de todas las ciudades', 'La ausencia de cualquier relación social', 'Una región metafísica sin personas'),
      q('¿Qué riesgo contiene la totalidad cuando se absolutiza?', 'Integrar o excluir al otro reduciéndolo a las categorías del sistema', 'Permitir que toda persona cuestione sus límites', 'Reconocer que existen distintas comunidades', 'Crear relaciones de responsabilidad mutua'),
      q('¿Por qué el otro no puede reducirse a una pieza del sistema?', 'Porque su alteridad plantea una exigencia que el orden vigente no puede definir por completo', 'Porque carece de toda relación con la sociedad', 'Porque el otro siempre comparte los mismos valores', 'Porque toda diferencia es solo geográfica'),
      q('¿Qué muestra el rostro del otro en la reflexión ética dusseliana?', 'La vulnerabilidad y la demanda que interpelan mi responsabilidad', 'Una prueba de que toda norma es relativa', 'Una imagen que debe analizarse solo estéticamente', 'Una autoridad que ya resolvió cada conflicto'),
    ]),
    sector('Ética de la liberación', 'Ética', hues[1], [
      q('¿Qué criterio material ocupa un lugar central en la ética de Dussel?', 'La producción, reproducción y desarrollo de la vida humana en comunidad', 'La obediencia formal a cualquier ley vigente', 'La maximización del éxito de un individuo', 'La coherencia lógica sin consideración de consecuencias'),
      q('¿Por qué la vida humana es un criterio ético y no solo biológico?', 'Porque incluye condiciones sociales y materiales para vivir con dignidad', 'Porque toda supervivencia física hace justa cualquier acción', 'Porque la ética se reduce a la medicina', 'Porque elimina la importancia de la libertad'),
      q('¿Qué obliga a revisar una norma que produce víctimas?', 'Su pretensión de validez debe confrontarse con el daño y la exclusión que genera', 'La norma es justa por estar formalmente aprobada', 'Las víctimas deben adaptarse al sistema', 'El daño importa solo si fue intencional'),
      q('¿Qué tres dimensiones suelen articularse en la ética dusseliana?', 'Vida material, validez intersubjetiva y factibilidad de la acción', 'Intención privada, fama y tradición', 'Naturaleza, belleza y autoridad', 'Verdad lógica, utilidad y castigo'),
    ]),
    sector('Víctimas y crítica', 'Víctimas', hues[2], [
      q('¿Qué lugar tienen las víctimas en la crítica ética de Dussel?', 'Hacen visible el costo de un sistema y cuestionan su pretensión de legitimidad', 'Confirman que toda institución es necesariamente injusta', 'Son únicamente quienes pierden una elección', 'No aportan conocimiento sobre la sociedad'),
      q('¿Qué significa una crítica “desde las víctimas”?', 'Examinar el orden desde quienes padecen sus efectos negativos y exclusiones', 'Dar por correcta cualquier propuesta de quien sufre', 'Sustituir el análisis por compasión privada', 'Negar que las instituciones puedan cumplir funciones'),
      q('¿Qué distingue a una víctima de un concepto abstracto de injusticia?', 'La experiencia concreta permite identificar daños y mecanismos que el discurso oficial puede ocultar', 'La víctima siempre conoce todas las causas del daño', 'La injusticia solo existe si alguien la denuncia', 'La experiencia individual vuelve innecesaria toda teoría'),
      q('¿Qué respuesta reclama la existencia de víctimas en un orden social?', 'Transformar críticamente las prácticas e instituciones que producen su negatividad', 'Limitarse a describirlas sin modificar nada', 'Atribuir toda responsabilidad a decisiones individuales', 'Esperar que el sistema se corrija automáticamente'),
    ]),
    sector('Comunidad y validez', 'Comunidad', hues[3], [
      q('¿Qué exige la dimensión intersubjetiva de una norma?', 'Que quienes resultan afectados puedan participar en condiciones de diálogo', 'Que la mayoría decida sin escuchar a nadie', 'Que la norma sea antigua y conocida', 'Que el experto determine unilateralmente lo justo'),
      q('¿Cómo se relaciona consenso y justicia en Dussel?', 'El acuerdo es necesario, pero debe confrontarse también con la vida y la situación de las víctimas', 'El consenso mayoritario vuelve justa cualquier decisión', 'El consenso no tiene ninguna función ética', 'La justicia depende solo de una intención individual'),
      q('¿Qué significa una comunidad de comunicación ideal?', 'Un horizonte crítico de participación simétrica, no una descripción de que toda sociedad ya lo cumple', 'Una comunidad histórica sin desacuerdos', 'Un grupo que excluye a quien no comparte su idioma', 'Una reunión donde solo hablan especialistas'),
      q('¿Por qué la participación de los afectados es relevante?', 'Porque una norma puede parecer válida para quienes deciden y perjudicar a quienes no tienen voz', 'Porque las personas afectadas siempre tienen una única opinión', 'Porque elimina la necesidad de argumentos', 'Porque los expertos nunca pueden aportar conocimiento'),
    ]),
    sector('Modernidad y colonialidad', 'Modernidad', hues[4], [
      q('¿Qué cuestiona Dussel en la narrativa eurocéntrica de la modernidad?', 'Que presente su desarrollo como exclusivamente interno y oculte la conquista y la colonialidad', 'Que Europa haya producido pensamiento filosófico', 'Que existan intercambios entre regiones', 'Que la modernidad haya transformado instituciones'),
      q('¿Qué destaca la lectura de Dussel sobre 1492?', 'La incorporación de América a una historia mundial mediante conquista y dominación', 'El comienzo de toda civilización humana', 'La independencia política inmediata de América', 'La desaparición completa de las culturas indígenas'),
      q('¿Qué aporta la idea de transmodernidad?', 'Pensar un proyecto que dialogue críticamente con la modernidad desde voces excluidas', 'Restaurar sin cambios un pasado premoderno', 'Imitar el modelo europeo con mayor eficiencia', 'Abandonar toda ciencia y tecnología'),
      q('¿Qué evita una crítica de la modernidad convertida en rechazo total?', 'Distinguir sus logros emancipadores de sus estructuras de dominación', 'Afirmar que la conquista fue un intercambio neutral', 'Suponer que todas las culturas son idénticas', 'Negar que existan conocimientos científicos'),
    ]),
    sector('Praxis y liberación', 'Praxis', hues[5], [
      q('¿Qué es la praxis de liberación?', 'Una acción colectiva que transforma relaciones e instituciones que producen opresión', 'Una intención moral sin efectos en el mundo', 'El retiro individual de toda vida pública', 'La sustitución de una élite por otra sin alterar el sistema'),
      q('¿Por qué la liberación no es solo un cambio de gobernantes?', 'Porque exige modificar condiciones materiales e institucionales que reproducen dominación', 'Porque la política no influye en la vida cotidiana', 'Porque todo cambio institucional es imposible', 'Porque la liberación ocurre únicamente en la conciencia'),
      q('¿Qué papel cumple la crítica en la praxis?', 'Comprender las causas de la negatividad para orientar una transformación factible', 'Reemplazar toda organización por espontaneidad', 'Probar que el futuro está garantizado', 'Describir una injusticia sin buscar alternativas'),
      q('¿Qué relación propone Dussel entre liberación y responsabilidad?', 'La acción debe responder a las personas afectadas y evaluar sus consecuencias', 'La causa justa vuelve inocuos todos los medios', 'La responsabilidad desaparece en la acción colectiva', 'El éxito es el único criterio ético'),
    ]),
  ]},
  { key: 'zea', name: 'Leopoldo Zea', note: 'Identidad, historia y emancipación latinoamericana', topics: [
    sector('Filosofía e identidad', 'Identidad', hues[0], [
      q('¿Cómo aborda Zea la pregunta por la identidad latinoamericana?', 'Como una búsqueda histórica y crítica, no como una esencia racial inmutable', 'Como la recuperación de una cultura sin influencias externas', 'Como una definición biológica válida para todos', 'Como un problema que solo Europa puede resolver'),
      q('¿Qué significa “asumir” la historia propia en Zea?', 'Reconocerla críticamente, incluidas las dependencias y conflictos que la constituyen', 'Celebrar cada episodio histórico sin evaluarlo', 'Rechazar toda herencia cultural europea', 'Sustituir el pasado por una identidad futura inventada'),
      q('¿Por qué la identidad no se reduce a copiar modelos ajenos?', 'Porque exige apropiarlos y responder desde una situación histórica propia', 'Porque todo pensamiento extranjero es inválido', 'Porque las culturas no pueden aprender unas de otras', 'Porque la identidad se define solo por el idioma'),
      q('¿Qué evita convertir la identidad latinoamericana en una esencia cerrada?', 'Entenderla como proyecto plural que se forma históricamente', 'Afirmar que existe una única experiencia continental', 'Excluir los intercambios culturales', 'Identificarla con una sola época'),
    ]),
    sector('Historicismo', 'Historicismo', hues[1], [
      q('¿Qué aporta el historicismo de Zea a la filosofía?', 'Comprender las ideas en relación con la situación histórica desde la que se formulan', 'Negar que haya argumentos válidos', 'Reducir las ideas a la biografía privada del autor', 'Sostener que cada época carece de relación con las demás'),
      q('¿Qué quiere decir que el pensamiento está situado?', 'Que responde a problemas y circunstancias concretas, sin quedar por ello fuera del diálogo racional', 'Que solo puede entenderlo quien vivió exactamente esa época', 'Que su validez depende únicamente del lugar de nacimiento', 'Que no puede compararse con otras ideas'),
      q('¿Qué crítica dirige Zea a una historia filosófica que parte solo de Europa?', 'Que puede presentar experiencias europeas como medida universal y relegar otras historias', 'Que Europa nunca produjo filosofía', 'Que los conceptos no viajan entre regiones', 'Que la cronología debe eliminarse'),
      q('¿Qué diferencia el historicismo de un relativismo que vuelve incomunicables las culturas?', 'El historicismo estudia situaciones para hacer posible una comprensión y diálogo concretos', 'El relativismo sostiene que hay contextos históricos', 'El historicismo afirma que todos los argumentos son iguales', 'El historicismo prohíbe traducir conceptos'),
    ]),
    sector('Dependencia y emancipación', 'Dependencia', hues[2], [
      q('¿Qué es la dependencia cultural en la crítica de Zea?', 'La subordinación que lleva a imitar modelos sin responder a la propia realidad', 'El intercambio intelectual entre diferentes países', 'La traducción de una obra extranjera', 'La existencia de desacuerdos políticos internos'),
      q('¿Cómo se supera la imitación según Zea?', 'Asimilando críticamente ideas y usándolas para comprender problemas propios', 'Prohibiendo la lectura de autores extranjeros', 'Copiando modelos con más fidelidad', 'Afirmando que toda tradición local es perfecta'),
      q('¿Qué relación existe entre emancipación política y cultural?', 'La independencia formal puede coexistir con dependencia intelectual y económica', 'La independencia política elimina de inmediato toda dependencia', 'La cultura no se relaciona con la política', 'La emancipación exige aislamiento económico'),
      q('¿Por qué no basta con adoptar un vocabulario filosófico europeo?', 'Porque hay que examinar qué problemas resuelve y desde qué experiencia habla', 'Porque las palabras europeas no pueden traducirse', 'Porque toda filosofía debe inventar un idioma nuevo', 'Porque los conceptos no tienen historia'),
    ]),
    sector('Humanismo y reconocimiento', 'Humanismo', hues[3], [
      q('¿Qué defiende el humanismo de Zea?', 'El reconocimiento de la humanidad compartida sin borrar las diferencias históricas', 'La superioridad de una cultura sobre las demás', 'La uniformidad política como condición de igualdad', 'La exclusión de la filosofía de otras regiones'),
      q('¿Qué cuestiona Zea en la idea de que unos pueblos son “más humanos” que otros?', 'La jerarquía que niega reconocimiento y justifica la dominación', 'La existencia de diferencias entre sociedades', 'La posibilidad de diálogo intercultural', 'La influencia de la historia en las ideas'),
      q('¿Cómo se relacionan igualdad y diferencia en este humanismo?', 'La igualdad de dignidad no exige que las culturas sean idénticas', 'La igualdad requiere abandonar toda diferencia', 'Las diferencias justifican jerarquías de humanidad', 'La dignidad depende del desarrollo económico'),
      q('¿Qué significa reconocerse en una humanidad común?', 'Dialogar desde diferencias históricas sin convertirlas en inferioridad', 'Aceptar una cultura única como modelo', 'Renunciar a las demandas locales', 'Evitar debatir sobre injusticias'),
    ]),
    sector('América y el mundo', 'América y el mundo', hues[4], [
      q('¿Qué lugar ocupa América en la historia universal según Zea?', 'Debe comprenderse como participante y sujeto de esa historia, no como apéndice', 'Es un continente fuera de toda historia', 'Solo entra en la historia cuando imita a Europa', 'Representa una etapa idéntica en todos sus países'),
      q('¿Qué supone hablar de una historia mundial desde América?', 'Revisar relatos que convierten una experiencia regional en patrón único', 'Reemplazar una hegemonía por otra', 'Negar los procesos de conquista', 'Eliminar toda comparación entre regiones'),
      q('¿Qué importancia tiene el encuentro entre culturas en el pensamiento de Zea?', 'Puede ser espacio de conflicto y también de apropiación y diálogo', 'Siempre produce una síntesis pacífica', 'No modifica las identidades', 'Demuestra que una cultura debe desaparecer'),
      q('¿Qué evita una visión latinoamericana de la historia convertida en aislamiento?', 'Situar la experiencia americana en relaciones globales desiguales y recíprocas', 'Negar toda influencia externa', 'Afirmar que América comparte una sola trayectoria', 'Excluir los debates universales'),
    ]),
    sector('Proyecto y futuro', 'Proyecto', hues[5], [
      q('¿Qué significa construir un proyecto propio en Zea?', 'Responder creativamente a la circunstancia sin limitarse a repetir modelos', 'Predecir el desarrollo inevitable de cada país', 'Recuperar una sociedad anterior sin cambios', 'Abandonar toda relación con el resto del mundo'),
      q('¿Por qué la emancipación es una tarea histórica y no un hecho concluido?', 'Porque las formas de dependencia pueden persistir y transformarse después de la independencia', 'Porque ninguna sociedad ha logrado independencia política', 'Porque el futuro no influye en la política', 'Porque toda historia vuelve exactamente al inicio'),
      q('¿Qué relación guarda el futuro con la interpretación del pasado?', 'Los proyectos presentes reinterpretan la historia para abrir posibilidades de acción', 'El futuro cambia literalmente los acontecimientos pasados', 'El pasado no ofrece ninguna orientación', 'La historia determina una sola meta inevitable'),
      q('¿Qué distingue un proyecto emancipador de una nueva imitación?', 'Que parte de necesidades propias y dialoga críticamente con otros pueblos', 'Que rechaza todo conocimiento extranjero', 'Que adopta una forma política idéntica a otra nación', 'Que presenta su resultado como garantizado'),
    ]),
  ]},
];

const completePhilosopherData = philosopherData.map(author => ({
  ...author,
  topics: author.topics.map((topic, index) => [topic[0], topic[1], topic[2], [...topic[3], ...philosopherExpansion[author.key][index]]]),
}));
export const philosopherRouletteTopics = completePhilosopherData.map((author, i) => {
  const rows = author.topics.flatMap(([, , , questions]) => questions);
  const selected = Array.from({ length: 8 }, (_, n) => rows[Math.floor(n * rows.length / 8)]);
  return [author.name, author.name.split(' ').slice(-1)[0], hues[i % hues.length], selected];
});
export const philosopherByKey = Object.fromEntries(completePhilosopherData.map(item => [item.key, item]));
