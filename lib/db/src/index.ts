import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const rawUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set.");
}

function buildPoolConfig(url: string): pg.PoolConfig {
  const match = url.match(
    /^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:@[\]]+|\[[^\]]+\]):(\d+)\/([^?#]+)/,
  );
  if (match) {
    const [, user, password, host, port, database] = match;
    return { user, password, host, port: Number(port), database, ssl: { rejectUnauthorized: false } };
  }
  return { connectionString: url, ssl: { rejectUnauthorized: false } };
}

export const pool = new Pool(buildPoolConfig(rawUrl));
export const db = drizzle(pool, { schema });
export * from "./schema";
