const { map } = require("lodash");
const pool = require("./pool");
const objKeysToCamelCase = require("../utils/objKeysToCamelCase");

const getAirports = async name => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
        airport_name,
        iata_code,
        city_name,
        country_name
      FROM airports
      WHERE LOWER(airport_name) LIKE '%' || $1 || '%' OR LOWER(iata_code) LIKE '%' || $1 || '%'`,
      [name.toLowerCase()]
    );
    client.release();
    // console.log(`airports requested: ${result.rows.length} records`);
    return map(result.rows, objKeysToCamelCase);
  } catch (err) {
    console.error(err);
    throw new Error("Request for airports failed");
  }
};

module.exports = {
  getAirports
};
