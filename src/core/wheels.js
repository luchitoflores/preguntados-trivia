import { Brain, Compass, Eye, Flame, Ghost, Scales } from 'phosphor-react';
import { GiCaveEntrance } from 'react-icons/gi';

// Agrega aquí las ruedas; la configuración visual vive en themes.js.
export const wheels = {
  ejes: { nombre: 'Ejes temáticos', skin: 'skin-ejes', colores: ['#8B5CF6', '#F59E0B'], temas: ['Metafísica', 'Ética', 'Lógica'], icono: Compass },
  platon: { nombre: 'Ruleta · Platón', skin: 'skin-caverna', colores: ['#1A0B2E', '#F59E0B'], filosofo: 'platon', temas: ['Caverna', 'Doxa', 'Ideas'], icono: GiCaveEntrance },
  sartre: { nombre: 'Ruleta · Sartre', skin: 'skin-existencial', colores: ['#111827', '#EF4444'], filosofo: 'sartre', temas: ['Libertad', 'Existencia'], icono: Ghost },
  nietzsche: { nombre: 'Ruleta · Nietzsche', skin: 'skin-abismo', colores: ['#111827', '#EF4444'], filosofo: 'nietzsche', temas: ['Superhombre', 'Voluntad'], icono: Flame },
  kant: { nombre: 'Ruleta · Kant', skin: 'skin-kant', colores: ['#1E3A8A', '#60A5FA'], filosofo: 'kant', temas: ['Razón', 'Deber', 'Crítica'], icono: Scales },
  camus: { nombre: 'Ruleta · Camus', skin: 'skin-existencial', colores: ['#111827', '#F59E0B'], filosofo: 'camus', temas: ['Absurdo', 'Rebelión'], icono: Eye },
  hegel: { nombre: 'Ruleta · Hegel', skin: 'skin-kant', colores: ['#1E3A8A', '#A78BFA'], filosofo: 'hegel', temas: ['Dialéctica', 'Espíritu'], icono: Compass },
  heidegger: { nombre: 'Ruleta · Heidegger', skin: 'skin-existencial', colores: ['#111827', '#22C55E'], filosofo: 'heidegger', temas: ['Ser', 'Dasein'], icono: Eye },
  roig: { nombre: 'Ruleta · Arturo Andrés Roig', skin: 'skin-kant', colores: ['#1E3A8A', '#F59E0B'], filosofo: 'roig', temas: ['A priori antropológico', 'Liberación'], icono: Brain },
  dussel: { nombre: 'Ruleta · Enrique Dussel', skin: 'skin-kant', colores: ['#1E3A8A', '#F97316'], filosofo: 'dussel', temas: ['Ética de la liberación', 'Exterioridad'], icono: Brain },
  zea: { nombre: 'Ruleta · Leopoldo Zea', skin: 'skin-kant', colores: ['#1E3A8A', '#14B8A6'], filosofo: 'zea', temas: ['Identidad', 'Filosofía latinoamericana'], icono: Compass },
};
