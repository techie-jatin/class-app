import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const rawUrl =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Parse a postgres connection string manually so special characters in the
 * password (e.g. /, +, !) don't break the built-in URL parser.
 * Format: postgres[ql]://user:password@host:port/database[?params]
 */
function parseConnectionString(url: string): pg.PoolConfig {
  const match = url.match(
    /^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:@]+):(\d+)\/([^?]+)/,
  );
  if (!match) {
    // Fall back to raw connection string and hope it parses
    return { connectionString: url, ssl: { rejectUnauthorized: false } };
  }
  const [, user, password, host, port, database] = match;
  return {
    user,
    password,
    host,
    port: Number(port),
    database,
    ssl: { rejectUnauthorized: false },
  };
}

const poolConfig = rawUrl.startsWith("postgres")
  ? parseConnectionString(rawUrl)
  : { connectionString: rawUrl };

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });

export * from "./schema";
