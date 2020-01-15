import { map, first } from "lodash";
import pool from "./pool";
import objKeysToCamelCase from "../utils/objKeysToCamelCase";
import { Airport } from "../types";

export const getAirports = async (name: string): Promise<Airport[]> => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
        airport_name,
        iata_code,
        city_name,
        country_name
      FROM airports
      WHERE LOWER(airport_name) LIKE '%' || $1 || '%' OR LOWER(iata_code)=$1`,
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

export const getAirportByIataCode = async (
  iataCode: string
): Promise<Airport> => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
        airport_name,
        iata_code,
        city_name,
        country_name
      FROM airports
      WHERE LOWER(iata_code) = $1`,
      [iataCode.toLowerCase()]
    );
    client.release();
    // console.log(`airports requested: ${result.rows.length} records`);
    return objKeysToCamelCase(first(result.rows));
  } catch (err) {
    console.error(err);
    throw new Error("Request for airports failed");
  }
};
