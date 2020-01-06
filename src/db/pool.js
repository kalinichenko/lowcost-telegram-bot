const { has } = require("lodash");
const { Pool } = require("pg");

const ssl = has(process.env, "DATABASE_SSL")
  ? process.env.DATABASE_SSL === "true"
  : true;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

module.exports = pool;
