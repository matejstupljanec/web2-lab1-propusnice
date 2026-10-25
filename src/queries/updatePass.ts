import { pool } from "../db/database.ts";
import type { Status } from "../status.ts";
import { validate } from "uuid";

export async function updatePass(
  id: string,
  newStatus: Status,
): Promise<boolean> {
  if (!validate(id)) return false;

  const result = await pool.query(
    `UPDATE passes SET status = $1 WHERE id = $2`,
    [newStatus, id],
  );
  return result.rowCount === 1;
}
