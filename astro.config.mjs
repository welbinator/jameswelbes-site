import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://jameswelbes.com',
  base: process.env.PAGES_BASE || '/',
  build: { format: 'directory' }
});
