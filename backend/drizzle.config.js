// drizzle.config.js
// Drizzle Kit configuration for migrations and schema management

/** @type { import("drizzle-kit").Config } */
export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
};
