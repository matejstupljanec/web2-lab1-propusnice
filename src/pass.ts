import type { Status } from "./status.ts";

export type Pass = {
  id: string;
  name: string;
  document: string;
  issuedAt: Date;
  status: Status;
};

export type PassStats = {
  total: number;
  active: number;
};
