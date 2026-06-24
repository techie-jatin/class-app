import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const hashes: Record<string, string> = {
    PLACEHOLDER_SUPER: await bcrypt.hash("superadmin123", 12),
    PLACEHOLDER_ADMIN: await bcrypt.hash("admin123", 12),
    PLACEHOLDER_FAC: await bcrypt.hash("faculty123", 12),
    PLACEHOLDER_STU: await bcrypt.hash("student123", 12),
  };

  for (const [placeholder, hash] of Object.entries(hashes)) {
    await pool.query("UPDATE users SET password_hash = $1 WHERE password_hash = $2", [hash, placeholder]);
  }

  console.log("Passwords seeded successfully");
  await pool.end();
}

main().catch(console.error);
