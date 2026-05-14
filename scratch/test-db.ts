import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function test(name: string, url: string | undefined) {
  if (!url) {
    console.log(`${name} is missing`);
    return;
  }
  console.log(`Testing ${name}:`, url.split("@")[1]);
  
  const pool = new Pool({
    connectionString: url,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log(`${name} connected successfully!`);
    client.release();
  } catch (err) {
    console.error(`${name} failed:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await test("DATABASE_URL (Pooler 6543)", process.env.DATABASE_URL);
  await test("DIRECT_URL (Proposed db.<ref>.supabase.co)", "postgresql://postgres.uodchtwydechuszusywk:SUDAp3fQvqC0a2ij@db.uodchtwydechuszusywk.supabase.co:5432/postgres");
  await test("CURRENT DIRECT_URL", process.env.DIRECT_URL);
}

run();
