import {
  Atom, ArrowsClockwise, Bank, BookOpen, Brain, Buildings, Compass, Eye, Flame,
  Gear, Ghost, Globe, Handshake, Heart, Hourglass, Lightbulb, Moon, Scales,
  Palette, Shield, Skull, Sparkle, Sun, Tree, Users, Waves, Wind,
} from 'phosphor-react';
import { GiCaveEntrance } from 'react-icons/gi';

// Paleta común tipo Preguntados. Las pieles oscuras usan una variante más luminosa.
export const wheelColors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
export const darkWheelColors = ['#A07AFF', '#FFB84D', '#12D991', '#FF4D4D', '#448EFF', '#FF4DAA'];

const generalIcons = [Buildings, Lightbulb, Globe, Handshake, Gear, Eye];

// Cada tema recibe un icono semántico. Si una rueda tiene temas similares,
// getWheelSectorIcon elige otro icono libre para evitar repetirlo en esa rueda.
const topicIconRules = [
  [/latinoamericana|filosof[ií]a latino|liberaci[oó]n|exterioridad|alteridad|reconocimiento/, Handshake],
  [/antigua|medieval|historia|grecia|roma|escol[aá]stic/, Buildings],
  [/moderna|ilustraci[oó]n|raz[oó]n|ciencia|humanismo/, Lightbulb],
  [/contempor[aá]nea|actual|mundo|global/, Globe],
  [/metaf[ií]sica|ser |ser$|realidad|ontolog[ií]a|dasein/, Brain],
  [/l[oó]gica|dial[eé]ctica|argument|inferencia/, Gear],
  [/e[té]tica|moral|deber|justicia|responsabilidad/, Scales],
  [/conocimiento|verdad|perspectiv|epistem|doxa|mirada/, Eye],
  [/caverna|sombra|apariencia/, GiCaveEntrance],
  [/existencia|libertad|angustia|mala fe|compromiso/, Ghost],
  [/absurdo|s[ií]sifo|tiempo|retorno|temporal/, Hourglass],
  [/voluntad|nihilismo|apol[ií]neo|dionis[ií]aco|poder|fuego/, Flame],
  [/idea|esp[ií]ritu|conciencia|raz[oó]n/, Sparkle],
  [/naturaleza|vida|ecolog|physis/, Tree],
  [/pol[ií]tica|estado|comunidad|sociedad/, Bank],
  [/solidaridad/, Handshake],
  [/cuerpo|afecto|amor|cuidado|coraz[oó]n/, Heart],
  [/religi[oó]n|fe|dios|trascendencia/, Moon],
  [/arte|tragedia|po[eé]tica|est[eé]tica/, Palette],
  [/rebel|resistencia|l[ií]mite|violencia/, Shield],
  [/identidad|cultura|pueblo|latino|roig|zea/, Users],
  [/cr[ií]tica|libro|obra|texto/, BookOpen],
  [/eterno|infinito|absoluto/, ArrowsClockwise],
  [/materia|f[ií]sica|[aá]tomo|naturaleza/, Atom],
  [/espacio|mundo|tierra|geograf[ií]a/, Compass],
  [/misterio|oscuridad|abismo|muerte/, Skull],
  [/serenidad|zen|contemplaci[oó]n/, Waves],
  [/luz|sol|amanecer/, Sun],
  [/noche|sue[nñ]o|inconsciente/, Moon],
  [/viento|cambio|devenir|movimiento/, Wind],
];

const fallbackIcons = [Compass, Atom, Heart, Tree, Waves, Palette, Users, Sparkle, Wind, Shield, BookOpen, Bank];

export function getWheelSectorIcon(topic, index = 0, used = new Set()) {
  const normalized = String(topic || '').toLocaleLowerCase('es');
  const preferred = topicIconRules.find(([pattern]) => pattern.test(normalized))?.[1];
  if (preferred && !used.has(preferred)) {
    used.add(preferred);
    return preferred;
  }
  const start = Math.max(0, index) % fallbackIcons.length;
  const alternative = [...fallbackIcons.slice(start), ...fallbackIcons.slice(0, start)]
    .find(Icon => !used.has(Icon));
  const Icon = alternative || fallbackIcons[start];
  used.add(Icon);
  return Icon;
}

// En la ruleta general, cada sector representa a una persona distinta.
const philosopherIcons = {
  sartre: Ghost,
  nietzsche: Skull,
  camus: Hourglass,
  hegel: ArrowsClockwise,
  heidegger: Tree,
  roig: Users,
  dussel: Handshake,
  zea: Globe,
  platon: GiCaveEntrance,
  kant: Scales,
  socrates: Brain,
};

export function getPhilosopherWheelIcon(key, used = new Set()) {
  const preferred = philosopherIcons[key];
  if (preferred && !used.has(preferred)) {
    used.add(preferred);
    return preferred;
  }
  return getWheelSectorIcon(key, used.size, used);
}

// Registro central: también define la paleta y el icono representativo de cada rueda.
export const wheels = {
  ejes: { nombre: 'Ejes temáticos', skin: 'skin-ejes', colores: wheelColors, temas: ['Antigua y medieval', 'Filosofía moderna', 'Filosofía contemporánea', 'Filosofía latinoamericana', 'Lógica y ética', 'Conocimiento y verdad'], icono: Compass, iconos: generalIcons },
  platon: { nombre: 'Ruleta · Platón', skin: 'skin-caverna', colores: darkWheelColors, filosofo: 'platon', temas: ['Caverna', 'Doxa', 'Ideas'], icono: GiCaveEntrance },
  sartre: { nombre: 'Ruleta · Sartre', skin: 'skin-existencial', colores: darkWheelColors, filosofo: 'sartre', temas: ['Libertad', 'Existencia'], icono: Ghost },
  nietzsche: { nombre: 'Ruleta · Nietzsche', skin: 'skin-abismo', colores: darkWheelColors, filosofo: 'nietzsche', temas: ['Superhombre', 'Voluntad'], icono: Skull },
  kant: { nombre: 'Ruleta · Kant', skin: 'skin-kant', colores: wheelColors, filosofo: 'kant', temas: ['Razón', 'Deber', 'Crítica'], icono: Scales },
  camus: { nombre: 'Ruleta · Camus', skin: 'skin-existencial', colores: darkWheelColors, filosofo: 'camus', temas: ['Absurdo', 'Rebelión'], icono: Hourglass },
  hegel: { nombre: 'Ruleta · Hegel', skin: 'skin-kant', colores: wheelColors, filosofo: 'hegel', temas: ['Dialéctica', 'Espíritu'], icono: ArrowsClockwise },
  heidegger: { nombre: 'Ruleta · Heidegger', skin: 'skin-existencial', colores: darkWheelColors, filosofo: 'heidegger', temas: ['Ser', 'Dasein'], icono: Tree },
  roig: { nombre: 'Ruleta · Arturo Andrés Roig', skin: 'skin-kant', colores: wheelColors, filosofo: 'roig', temas: ['A priori antropológico', 'Liberación'], icono: Users },
  dussel: { nombre: 'Ruleta · Enrique Dussel', skin: 'skin-kant', colores: wheelColors, filosofo: 'dussel', temas: ['Ética de la liberación', 'Exterioridad'], icono: Handshake },
  zea: { nombre: 'Ruleta · Leopoldo Zea', skin: 'skin-kant', colores: wheelColors, filosofo: 'zea', temas: ['Identidad', 'Filosofía latinoamericana'], icono: Globe },
};
