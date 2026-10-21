import { pool } from "../db.ts";

export async function getPasses() {
  const results = await pool.query("SELECT * FROM passes");
  return results.rows;
}
