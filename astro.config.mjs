import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  integrations: [sitemap()],
  site: 'https://jameswelbes.com',
  base: process.env.PAGES_BASE || '/',
  build: { format: 'directory' }
});
