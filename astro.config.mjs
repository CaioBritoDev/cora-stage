import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    includeFiles: ['certificate.pem', 'private-key.key'],
  }),
});