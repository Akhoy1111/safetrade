import postgres from 'postgres';
declare let queryClient: ReturnType<typeof postgres> | null;
export declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, unknown>>;
export { queryClient };
export * from './schema';
