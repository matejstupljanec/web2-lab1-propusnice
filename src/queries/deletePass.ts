import { pool } from "../db/database.ts";
import { validate } from "uuid";

export async function deletePass(id: string): Promise<boolean> {
  if (!validate(id)) return false;

  const result = await pool.query(`DELETE FROM passes WHERE id = $1`, [id]);
  return result.rowCount === 1;
}
