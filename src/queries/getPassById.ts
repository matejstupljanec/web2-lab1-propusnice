import { pool } from "../db/database.ts";
import type { Pass } from "../pass.ts";
import { validate } from "uuid";

export async function getPassById(id: string): Promise<Pass | undefined> {
  if (!validate(id)) return undefined;

  const result = await pool.query<Pass>(
    `SELECT id, name, document, issued_at AS "issuedAt", status FROM passes WHERE id = $1`,
    [id],
  );
  return result.rows[0];
}
