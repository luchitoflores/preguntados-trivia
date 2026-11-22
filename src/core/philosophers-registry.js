import { Brain, Compass, Eye, Flame, Ghost, Scales } from 'phosphor-react';
import { GiCaveEntrance } from 'react-icons/gi';

// Catálogo central para selectores y formularios del framework.
export const philosophersRegistry = {
  platon: { nombre: 'Platón', nota: 'Ideas, conocimiento y política', imagen: '/philosophy-icon.png', color: '#8B5CF6', temas: ['Caverna', 'Doxa', 'Ideas'], icono: GiCaveEntrance },
  sartre: { nombre: 'Jean-Paul Sartre', nota: 'Existencia, libertad y responsabilidad', imagen: null, color: '#EF4444', temas: ['Libertad', 'Existencia'], icono: Ghost },
  nietzsche: { nombre: 'Friedrich Nietzsche', nota: 'Crítica de la moral y afirmación de la vida', imagen: null, color: '#F97316', temas: ['Superhombre', 'Voluntad'], icono: Flame },
  kant: { nombre: 'Immanuel Kant', nota: 'Razón, deber y autonomía', imagen: null, color: '#3B82F6', temas: ['Razón', 'Deber', 'Crítica'], icono: Scales },
  socrates: { nombre: 'Sócrates', nota: 'Diálogo y examen de la vida', imagen: null, color: '#06B6D4', temas: ['Ética', 'Conocimiento'], icono: Brain },
  caverna: { nombre: 'Caverna de Platón', nota: 'Apariencia y conocimiento', imagen: null, color: '#A855F7', temas: ['Caverna', 'Doxa'], icono: Eye },
  camus: { nombre: 'Albert Camus', nota: 'Absurdo, libertad y rebelión', imagen: null, color: '#F59E0B', temas: ['Absurdo', 'Rebelión'], icono: Eye },
  hegel: { nombre: 'Georg Wilhelm Friedrich Hegel', nota: 'Dialéctica, historia y espíritu', imagen: null, color: '#8B5CF6', temas: ['Dialéctica', 'Espíritu'], icono: Compass },
  heidegger: { nombre: 'Martin Heidegger', nota: 'Ser, existencia y temporalidad', imagen: null, color: '#22C55E', temas: ['Ser', 'Dasein'], icono: Eye },
  roig: { nombre: 'Arturo Andrés Roig', nota: 'Pensamiento latinoamericano y liberación', imagen: null, color: '#F59E0B', temas: ['A priori antropológico', 'Liberación'], icono: Brain },
  dussel: { nombre: 'Enrique Dussel', nota: 'Ética de la liberación', imagen: null, color: '#F97316', temas: ['Ética de la liberación', 'Exterioridad'], icono: Brain },
  zea: { nombre: 'Leopoldo Zea', nota: 'Identidad y filosofía latinoamericana', imagen: null, color: '#14B8A6', temas: ['Identidad', 'Filosofía latinoamericana'], icono: Compass },
};
