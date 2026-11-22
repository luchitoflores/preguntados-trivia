import { defineConfig } from 'vite';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'preguntas-filosofia-ruleta';
export default defineConfig({
  // En Actions, Pages publica en /<repositorio>/; Sites y desarrollo usan la raíz.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/' + repository + '/' : '/',
});
