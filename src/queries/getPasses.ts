import { pool } from "../db/database.ts";

export async function getPasses() {
  const results = await pool.query("SELECT * FROM passes");
  return results.rows;
}
