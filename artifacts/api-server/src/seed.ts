import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const hashes: Record<string, string> = {
    PLACEHOLDER_SUPER: await bcrypt.hash("superadmin123", 12),
    PLACEHOLDER_ADMIN: await bcrypt.hash("admin123", 12),
    PLACEHOLDER_FAC: await bcrypt.hash("faculty123", 12),
    PLACEHOLDER_STU: await bcrypt.hash("student123", 12),
  };

  for (const [placeholder, hash] of Object.entries(hashes)) {
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE password_hash = $2",
      [hash, placeholder]
    );
    console.log(`Updated ${result.rowCount} rows for ${placeholder}`);
  }

  await pool.end();
  console.log("Done seeding passwords");
}

main().catch(console.error);
