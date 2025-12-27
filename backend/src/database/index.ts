// src/database/index.ts
// Database connection and exports
// Uses postgres.js with Drizzle ORM

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization - create connection when first accessed
let queryClient: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDatabase() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
  }

  // Disable prefetch as it is not supported for "Transaction" pool mode
  queryClient = postgres(connectionString, { prepare: false });
  
  // Create Drizzle instance
  dbInstance = drizzle(queryClient, { schema });
  
  console.log('✅ Database connection initialized');
  
  return dbInstance;
}

// Export for direct use - proxy that initializes on first access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const database = initializeDatabase();
    return database[prop as keyof typeof database];
  }
});

export { queryClient };

// Export all schema tables and types
export * from './schema';
