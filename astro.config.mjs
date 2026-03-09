// @ts-check
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server', // ← tambah ini

  site: 'https://username.github.io',
  // jika pakai repo bukan root, tambahkan:
  base: '/Stream-Deck-local',
});
