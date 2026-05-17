import postgres from "postgres";
import { env } from "./env.js";

export const sql = postgres(env.databaseUrl, {
  max: 4,
  idle_timeout: 20,
});

export type Sql = typeof sql;
