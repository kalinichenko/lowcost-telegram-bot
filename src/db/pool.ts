import { Pool } from "pg";

const ssl = process.env.hasOwnProperty("DATABASE_SSL")
  ? process.env.DATABASE_SSL === "true"
  : true;

export default new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: ssl && { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
