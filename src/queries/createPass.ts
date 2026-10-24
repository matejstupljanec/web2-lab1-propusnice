import { pool } from "../db/database.ts";
import type { Pass } from "../pass.ts";

export async function createPass(
  name: string,
  document: string,
): Promise<Pass> {
  const result = await pool.query<Pass>(
    `INSERT INTO passes (name, document) VALUES ($1, $2) RETURNING id, name, document, issued_at AS "issuedAt", status`,
    [name.trim(), document.trim()],
  );

  return result.rows[0];
}
