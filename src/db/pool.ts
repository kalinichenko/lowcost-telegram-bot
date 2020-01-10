import { has } from "lodash";
import { Pool } from "pg";

const ssl = has(process.env, "DATABASE_SSL")
  ? process.env.DATABASE_SSL === "true"
  : true;

export default new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
