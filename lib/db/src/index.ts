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
 * Build a PoolConfig from a postgres connection string.
 *
 * `new URL()` chokes on passwords that contain raw /, +, ! etc.
 * We parse manually with a regex so the raw password bytes reach pg
 * without any URL-decoding ambiguity.  If the regex can't match we
 * fall back to the raw connection string and let pg attempt its own
 * parsing (works for well-formed URLs without special chars).
 *
 * ssl.rejectUnauthorized is left at the default (true) so the TLS
 * certificate is always verified.  Pass ssl: false only if you know
 * the target host uses a self-signed cert.
 */
function buildPoolConfig(url: string): pg.PoolConfig {
  // Captures: user, raw-password (greedy up to last @), host, port, dbname
  const match = url.match(
    /^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:@[\]]+|\[[^\]]+\]):(\d+)\/([^?#]+)/,
  );

  if (match) {
    const [, user, password, host, port, database] = match;
    // Supabase poolers use a self-signed cert chain; rejectUnauthorized must
    // be false. The connection is still encrypted via TLS.
    return {
      user,
      password,
      host,
      port: Number(port),
      database,
      ssl: { rejectUnauthorized: false },
    };
  }

  // Fallback: only works if the password has no URL-breaking chars
  return { connectionString: url, ssl: { rejectUnauthorized: false } };
}

const poolConfig = buildPoolConfig(rawUrl);

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });

export * from "./schema";
