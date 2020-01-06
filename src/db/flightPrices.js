const { map } = require("lodash");
const pool = require("./pool");
const objKeysToCamelCase = require("../utils/objKeysToCamelCase");

const saveFlightPrice = async ({
  price,
  operator,
  outDate,
  inDate,
  subscriptionId
}) => {
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO flight_prices(
        price,
        operator,
        out_date,
        in_date,
        subscription_id
      ) values($1,$2,$3,$4,$5)`,
      [price, operator, outDate, inDate, subscriptionId]
    );
    console.log(`Flight price added`);
    client.release();
  } catch (err) {
    console.error(err);
    throw new Error("Add flight prices failed");
  }
};

const updateFlightPrice = async ({
  price,
  operator,
  subscriptionId,
  outDate,
  inDate
}) => {
  try {
    const client = await pool.connect();
    await client.query(
      `
      UPDATE flight_prices
      SET price=$1,
        out_date=$2,
        in_date=$3
      WHERE operator=$4 AND subscription_id=$5
      `,
      [price, outDate, inDate, operator, subscriptionId]
    );
    console.log(`Flight price updated`);
    client.release();
  } catch (err) {
    console.error(err);
    throw new Error("Add flight price failed");
  }
};

const removeFlightPrice = async ({ subscriptionId, operator }) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM flights WHERE subscription_id=$1 AND operator=$2 RETURNING *`,
      [subscriptionId, operator]
    );
    client.release();
    console.log(`Flights removed: ${result.rows.length} records`);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw new Error("Flights removal failed");
  }
};

const getFlightPrice = async ({ subscriptionId, operator }) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
        subscription_id,
        price, operator,
        out_date,
        in_date
      FROM flight_prices
      WHERE subscription_id=$1 AND operator=$2`,
      [subscriptionId, operator]
    );
    client.release();
    console.log(`flight prices requested: ${result.rows.length} records`);
    return map(result.rows, objKeysToCamelCase);
  } catch (err) {
    console.error(err);
    throw new Error("Request for flight prices failed");
  }
};

module.exports = {
  saveFlightPrice,
  removeFlightPrice,
  getFlightPrice,
  updateFlightPrice
};
