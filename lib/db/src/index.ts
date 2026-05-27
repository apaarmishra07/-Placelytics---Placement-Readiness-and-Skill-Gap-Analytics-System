import * as schema from "./schema";

import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// At runtime prefer a Postgres connection when DATABASE_URL is provided.
// When not provided, use an in-memory Postgres provided by `pg-mem`
// to avoid native sqlite compilation on platforms without build toolchain.

let db: ReturnType<typeof pgDrizzle>;
let pool: any = undefined;

if (process.env.DATABASE_URL) {
  const { Pool } = pg;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = pgDrizzle(pool, { schema });
} else {
  // Use pg-mem to emulate Postgres in-memory (pure JS, no native builds).
  // Lazily require to keep startup predictable.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { newDb } = require("pg-mem");
  const mem = newDb();
  // Create a pg-compatible adapter
  const adapter = mem.adapters.createPg();
  const { Pool } = adapter;
  // Create a pool backed by pg-mem
  pool = new Pool();
  db = pgDrizzle(pool, { schema });
}

export { pool, db };
export * from "./schema";
