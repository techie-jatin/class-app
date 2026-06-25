// Full seed script for Supabase database
// Run: node scripts/src/seedSupabase.mjs
import bcrypt from "/home/runner/workspace/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js";
import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";

const { Pool } = pg;

const rawUrl = process.env.SUPABASE_DATABASE_URL;
if (!rawUrl) throw new Error("SUPABASE_DATABASE_URL not set");

const match = rawUrl.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:@]+):(\d+)\/([^?]+)/);
if (!match) throw new Error("Could not parse SUPABASE_DATABASE_URL");
const [, user, password, host, port, database] = match;

const pool = new Pool({
  user, password, host, port: Number(port), database,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Connected to Supabase. Seeding...");

    // Hash passwords
    const [superHash, adminHash, facHash, stuHash] = await Promise.all([
      bcrypt.hash("superadmin123", 12),
      bcrypt.hash("admin123", 12),
      bcrypt.hash("faculty123", 12),
      bcrypt.hash("student123", 12),
    ]);
    console.log("Passwords hashed.");

    // Clear existing data in dependency order
    await client.query("DELETE FROM security_events");
    await client.query("DELETE FROM activity_logs");
    await client.query("DELETE FROM device_sessions");
    await client.query("DELETE FROM system_settings");
    await client.query("DELETE FROM notifications");
    await client.query("DELETE FROM certificates");
    await client.query("DELETE FROM lecture_progress");
    await client.query("DELETE FROM live_classes");
    await client.query("DELETE FROM lectures");
    await client.query("DELETE FROM notes");
    await client.query("DELETE FROM course_access");
    await client.query("DELETE FROM batch_members");
    await client.query("DELETE FROM batches");
    await client.query("DELETE FROM courses");
    await client.query("DELETE FROM users");
    console.log("Cleared existing data.");

    // Insert users
    const usersResult = await client.query(`
      INSERT INTO users (email, password_hash, full_name, mobile_number, role, status, qualification, expertise, experience, occupation, interested_course)
      VALUES
        ('superadmin@tradingacademy.com', $1, 'Super Admin', '9000000001', 'superadmin', 'active', NULL, NULL, NULL, NULL, NULL),
        ('admin@tradingacademy.com', $2, 'Platform Admin', '9000000002', 'admin', 'active', NULL, NULL, NULL, NULL, NULL),
        ('john.faculty@tradingacademy.com', $3, 'John Smith', '9000000003', 'faculty', 'active', 'MBA Finance', 'Technical Analysis, Options Trading', '8 years', NULL, NULL),
        ('jane.faculty@tradingacademy.com', $3, 'Jane Doe', '9000000004', 'faculty', 'active', 'CFA', 'Algorithmic Trading, Risk Management', '6 years', NULL, NULL),
        ('alice@student.com', $4, 'Alice Johnson', '9000000005', 'student', 'active', NULL, NULL, NULL, 'Software Engineer', 'Technical Analysis'),
        ('bob@student.com', $4, 'Bob Williams', '9000000006', 'student', 'active', NULL, NULL, NULL, 'Trader', 'Options Trading'),
        ('carol@student.com', $4, 'Carol Davis', '9000000007', 'student', 'active', NULL, NULL, NULL, 'Analyst', 'Algorithmic Trading'),
        ('david@student.com', $4, 'David Brown', '9000000008', 'student', 'active', NULL, NULL, NULL, 'Investor', 'Risk Management')
      RETURNING id, email, role
    `, [superHash, adminHash, facHash, stuHash]);

    const users = {};
    for (const row of usersResult.rows) {
      users[row.email] = row.id;
    }
    console.log("Users seeded:", Object.keys(users).length);

    const johnId = users["john.faculty@tradingacademy.com"];
    const janeId = users["jane.faculty@tradingacademy.com"];
    const aliceId = users["alice@student.com"];
    const bobId = users["bob@student.com"];
    const carolId = users["carol@student.com"];
    const davidId = users["david@student.com"];

    // Insert courses
    const coursesResult = await client.query(`
      INSERT INTO courses (name, description, thumbnail, status, faculty_id)
      VALUES
        ('Technical Analysis Masterclass', 'Learn to read charts, identify patterns, and make informed trading decisions using technical analysis tools.', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', 'active', $1),
        ('Options Trading Strategies', 'Master options contracts, Greeks, spreads, and advanced options strategies for consistent returns.', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', 'active', $1),
        ('Algorithmic Trading with Python', 'Build automated trading systems using Python, backtesting frameworks, and live market data APIs.', 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400', 'active', $2),
        ('Risk Management Fundamentals', 'Understand position sizing, portfolio diversification, and systematic risk controls for capital preservation.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400', 'active', $2)
      RETURNING id, name
    `, [johnId, janeId]);

    const courses = {};
    for (const row of coursesResult.rows) {
      courses[row.name] = row.id;
    }
    console.log("Courses seeded:", Object.keys(courses).length);

    const c1 = courses["Technical Analysis Masterclass"];
    const c2 = courses["Options Trading Strategies"];
    const c3 = courses["Algorithmic Trading with Python"];
    const c4 = courses["Risk Management Fundamentals"];

    // Insert batches
    const batchesResult = await client.query(`
      INSERT INTO batches (name, course_id, start_date, end_date)
      VALUES
        ('Batch 2025-A', $1, '2025-01-15', '2025-04-15'),
        ('Batch 2025-B', $2, '2025-02-01', '2025-05-01'),
        ('Batch 2025-C', $3, '2025-03-01', '2025-06-30')
      RETURNING id, name
    `, [c1, c2, c3]);

    const batches = {};
    for (const row of batchesResult.rows) {
      batches[row.name] = row.id;
    }
    console.log("Batches seeded:", Object.keys(batches).length);

    // Batch members
    await client.query(`
      INSERT INTO batch_members (batch_id, user_id, role) VALUES
        ($1, $4, 'student'), ($1, $5, 'student'),
        ($2, $5, 'student'), ($2, $6, 'student'),
        ($3, $6, 'student'), ($3, $7, 'student')
    `, [batches["Batch 2025-A"], batches["Batch 2025-B"], batches["Batch 2025-C"], aliceId, bobId, carolId, davidId]);

    // Course access
    await client.query(`
      INSERT INTO course_access (course_id, student_id) VALUES
        ($1, $5), ($1, $6),
        ($2, $6), ($2, $7),
        ($3, $7), ($3, $8),
        ($4, $5), ($4, $8)
    `, [c1, c2, c3, c4, aliceId, bobId, carolId, davidId]);
    console.log("Course access seeded.");

    // Insert lectures
    await client.query(`
      INSERT INTO lectures (title, description, course_id, youtube_video_id, faculty_id) VALUES
        ('Introduction to Chart Reading', 'Learn the basics of candlestick charts and price action.', $1, 'dQw4w9WgXcQ', $5),
        ('Support & Resistance Levels', 'Identify key support and resistance zones on any timeframe.', $1, 'M7lc1UVf-VE', $5),
        ('Moving Averages Explained', 'SMA, EMA, and WMA: when and how to use each effectively.', $1, 'ZSt9tm3RoUU', $5),
        ('RSI and Momentum Indicators', 'Master RSI, MACD, and Stochastic for timing entries.', $1, 'eY52Zl2LMRY', $5),
        ('Options Basics: Calls and Puts', 'Understand the fundamentals of options contracts.', $2, 'SD7DdBkwqqY', $5),
        ('The Greeks: Delta, Gamma, Theta', 'Learn how options pricing changes with market conditions.', $2, 'BFgKlFqCrlo', $5),
        ('Python for Trading — Setup', 'Configure your Python environment for algorithmic trading.', $3, 'rfscVS0vtbw', $6),
        ('Building a Backtesting Engine', 'Write a simple backtester from scratch in Python.', $3, 'v_T1fu_M8lE', $6),
        ('Position Sizing Strategies', 'Fixed fractional, Kelly criterion, and volatility-based sizing.', $4, 'IkS-i8KrZUs', $6),
        ('Portfolio Diversification', 'Build a resilient multi-asset portfolio with controlled correlation.', $4, 'Rq9yxVmCgWI', $6)
    `, [c1, c2, c3, c4, johnId, janeId]);
    console.log("Lectures seeded.");

    // Insert live classes
    const now = new Date();
    const future1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const future2 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const future3 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString();

    // params: $1=c1 $2=c2 $3=c3 $4=future1 $5=future2 $6=future3 $7=johnId $8=janeId
    await client.query(`
      INSERT INTO live_classes (title, description, course_id, scheduled_at, youtube_url, faculty_id) VALUES
        ('Live Q&A: Chart Patterns Deep Dive', 'Interactive session on complex chart patterns and real trade setups.', $1, $4, 'https://meet.google.com/abc-defg-hij', $7),
        ('Options Strategy Workshop', 'Hands-on workshop building iron condors and butterfly spreads.', $2, $5, 'https://meet.google.com/klm-nopq-rst', $7),
        ('Algo Trading: Live Coding Session', 'Build a momentum strategy live with the class.', $3, $6, 'https://meet.google.com/uvw-xyza-bcd', $8)
    `, [c1, c2, c3, future1, future2, future3, johnId, janeId]);
    console.log("Live classes seeded.");

    // Insert notes
    await client.query(`
      INSERT INTO notes (file_name, course_id, drive_file_id, drive_view_url, faculty_id) VALUES
        ('Technical Analysis Cheat Sheet.pdf', $1, 'mock-drive-id-001', 'https://drive.google.com/file/d/mock001/view', $5),
        ('Chart Patterns Reference Guide.pdf', $1, 'mock-drive-id-002', 'https://drive.google.com/file/d/mock002/view', $5),
        ('Options Greeks Quick Reference.pdf', $2, 'mock-drive-id-003', 'https://drive.google.com/file/d/mock003/view', $5),
        ('Python Trading Libraries Overview.pdf', $3, 'mock-drive-id-004', 'https://drive.google.com/file/d/mock004/view', $6),
        ('Risk Management Formulas.pdf', $4, 'mock-drive-id-005', 'https://drive.google.com/file/d/mock005/view', $6)
    `, [c1, c2, c3, c4, johnId, janeId]);
    console.log("Notes seeded.");

    // Insert notifications
    const adminId = users["admin@tradingacademy.com"];
    const superadminId = users["superadmin@tradingacademy.com"];
    await client.query(`
      INSERT INTO notifications (title, message, target, sent_by_id) VALUES
        ('Welcome to Trading Academy!', 'We are excited to have you on the platform. Explore your courses and start learning today.', 'all', $1),
        ('New Courses Available', 'Check out our latest additions: Algorithmic Trading with Python and Risk Management Fundamentals.', 'students', $1),
        ('Faculty Meeting Scheduled', 'All faculty members are requested to attend the monthly review meeting on the first Friday.', 'faculty', $2)
    `, [adminId, superadminId]);
    console.log("Notifications seeded.");

    // Insert system settings
    await client.query(`
      INSERT INTO system_settings (platform_name, support_email, contact_number, maintenance_mode)
      VALUES ('Trading Academy', 'support@tradingacademy.com', '+91 98765 43210', 'false')
    `);
    console.log("System settings seeded.");

    // Insert certificates for alice
    await client.query(`
      INSERT INTO certificates (student_id, course_id, certificate_number, issue_date)
      VALUES ($1, $2, 'TA-CERT-2025-001', '2025-04-15')
    `, [aliceId, c1]);
    console.log("Certificates seeded.");

    console.log("\n✅ Seed complete! Demo credentials:");
    console.log("  SuperAdmin: superadmin@tradingacademy.com / superadmin123");
    console.log("  Admin:      admin@tradingacademy.com / admin123");
    console.log("  Faculty:    john.faculty@tradingacademy.com / faculty123");
    console.log("  Student:    alice@student.com / student123");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error("Seed failed:", e.message); process.exit(1); });
