const { map } = require("lodash");

const pool = require("./pool");
const objKeysToCamelCase = require("../utils/objKeysToCamelCase");

const getFlightSubscriptions = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query({
      text: `SELECT
          id,
          chat_id,
          origin,
          destination,
          departure_date_min,
          departure_date_max,
          duration_min,
          duration_max
        FROM flight_subscriptions`
    });
    client.release();
    console.log(
      `flight subscriptions requested: ${result.rows.length} records`
    );
    return map(result.rows, objKeysToCamelCase);
  } catch (err) {
    console.error(err);
    throw new Error("Request for prices failed");
  }
};

module.exports = {
  getFlightSubscriptions
};
