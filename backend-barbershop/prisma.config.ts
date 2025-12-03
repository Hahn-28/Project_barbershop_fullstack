import { defineConfig } from 'prisma/config';

export default defineConfig({
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL!, 
  },
});
