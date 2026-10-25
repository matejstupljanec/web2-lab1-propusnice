import { pool } from "../db/database.ts";
import type { PassStats } from "../pass.ts";

export async function getPassStats(): Promise<PassStats> {
  const results = await pool.query<PassStats>(
    "SELECT (SELECT COUNT(*) FROM passes) AS total, (SELECT COUNT(*) FROM passes WHERE status = 'ACTIVE') AS active",
  );
  return results.rows[0];
}
