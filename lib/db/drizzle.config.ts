import { defineConfig } from "drizzle-kit";
import path from "path";

const rawUrl =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

/**
 * Percent-encode only the password segment of a postgres URL so that
 * drizzle-kit's internal URL parser doesn't misinterpret special chars
 * (/, +, !, @, etc.) in the password as URL structure.
 *
 * We check whether the password already contains a percent-encoded
 * sequence before encoding to avoid double-encoding.
 */
function encodePasswordInUrl(url: string): string {
  const match = url.match(
    /^(postgres(?:ql)?:\/\/)([^:]+):(.+)@([^@]+)$/,
  );
  if (!match) return url;
  const [, protocol, user, password, rest] = match;

  // Only encode if the password isn't already percent-encoded
  const isAlreadyEncoded = /%[0-9A-Fa-f]{2}/.test(password);
  const encodedPassword = isAlreadyEncoded
    ? password
    : encodeURIComponent(password);

  return `${protocol}${user}:${encodedPassword}@${rest}`;
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: encodePasswordInUrl(rawUrl),
    ssl: true,
  },
});
