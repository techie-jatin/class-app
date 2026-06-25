import { defineConfig } from "drizzle-kit";
import path from "path";

const rawUrl =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

/**
 * Encode special characters in the password portion of a postgres URL so
 * drizzle-kit (which uses URL parsing internally) doesn't choke on chars
 * like /, +, ! that are valid in passwords but not in URLs.
 */
function encodePasswordInUrl(url: string): string {
  const match = url.match(
    /^(postgres(?:ql)?:\/\/)([^:]+):(.+)@([^@]+)$/,
  );
  if (!match) return url;
  const [, protocol, user, password, rest] = match;
  return `${protocol}${user}:${encodeURIComponent(password)}@${rest}`;
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: encodePasswordInUrl(rawUrl),
    ssl: true,
  },
});
