import { map } from "lodash";
import pool from "./pool";
import objKeysToCamelCase from "../utils/objKeysToCamelCase";

export const saveFlightPrice = async ({ price, subscriptionId }) => {
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO flight_prices(
        price,
        subscription_id
      ) values($1,$2)`,
      [price, subscriptionId]
    );
    // console.log(`Flight price added`);
    client.release();
  } catch (err) {
    console.error(err);
    throw new Error("Add flight prices failed");
  }
};

export const updateFlightPrice = async ({ price, subscriptionId }) => {
  try {
    const client = await pool.connect();
    await client.query(
      `
      UPDATE flight_prices
      SET price=$1
      WHERE subscription_id=$2
      `,
      [price, subscriptionId]
    );
    // console.log(`Flight price updated`);
    client.release();
  } catch (err) {
    console.error(err);
    throw new Error("Update flight price failed");
  }
};

export const removeFlightPrice = async (subscriptionId: number) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `DELETE FROM flight_prices WHERE subscription_id=$1 RETURNING *`,
      [subscriptionId]
    );
    client.release();
    // console.log(`Flights removed: ${result.rows.length} records`);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw new Error("Flight alert price removal failed");
  }
};

export const getFlightPrice = async ({ subscriptionId }) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
        subscription_id,
        price
      FROM flight_prices
      WHERE subscription_id=$1`,
      [subscriptionId]
    );
    client.release();
    // console.log(`flight prices requested: ${result.rows.length} records`);
    return map(result.rows, objKeysToCamelCase);
  } catch (err) {
    console.error(err);
    throw new Error("Request for flight prices failed");
  }
};
