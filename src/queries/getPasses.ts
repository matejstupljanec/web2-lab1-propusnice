import { pool } from "../db/database.ts";

export async function getPasses() {
  const results = await pool.query(
    `SELECT  id, name, document, issued_at AS "issuedAt", status FROM passes ORDER BY issued_at DESC`,
  );
  return results.rows;
}
