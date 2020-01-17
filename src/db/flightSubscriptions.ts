import { map, get } from "lodash";

import pool from "./pool";
import objKeysToCamelCase from "../utils/objKeysToCamelCase";
import { SearchRequest } from "../types";
import formatDate from "../utils/formatDate";

export interface Subscription extends SearchRequest {
  id?: number;
  chatId: number;
  price?: number;
  updatedAt?: Date;
}

export const addFlightSubscriptions = async ({
  chatId,
  departureIataCode,
  arrivalIataCode,
  departureDateMin,
  departureDateMax,
  arrivalDateMin,
  arrivalDateMax,
  durationMin,
  durationMax,
  adults = 1,
  teens = 0,
  children = 0,
  infants = 0,
  price
}: Subscription): Promise<number> => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO flight_subscriptions(
          chat_id,
          departure_iata_code,
          arrival_iata_code,
          departure_date_min,
          departure_date_max,
          arrival_date_min,
          arrival_date_max,
          duration_min,
          duration_max,
          adults,
          teens,
          children,
          infants,
          price,
          updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
      [
        chatId,
        departureIataCode,
        arrivalIataCode,
        departureDateMin,
        departureDateMax,
        arrivalDateMin,
        arrivalDateMax,
        durationMin,
        durationMax,
        adults,
        teens,
        children,
        infants,
        price,
        new Date()
      ]
    );
    client.release();
    return result.rows[0].id;
  } catch (err) {
    console.error(err);
    throw new Error("Request for adding price alert failed");
  }
};

export const getMyFlightSubscriptions = async (
  chatId
): Promise<Subscription[]> => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
          id,
          chat_id,
          departure_iata_code,
          arrival_iata_code,
          departure_date_min,
          departure_date_max,
          arrival_date_min,
          arrival_date_max,
          duration_min,
          duration_max,
          adults,
          teens,
          children,
          infants,
          price,
          updated_at
        FROM flight_subscriptions
        WHERE chat_id=$1`,
      [chatId]
    );
    client.release();
    return formatSubscriptions(result.rows);
  } catch (err) {
    console.error(err);
    throw new Error("Request for flight subscriptions failed");
  }
};

export const updateMySubscription = async ({ price, subscriptionId }) => {
  try {
    const client = await pool.connect();
    await client.query(
      `UPDATE flight_subscriptions
      SET price=$1,
      updated_at=$2
      WHERE id=$3`,
      [price, new Date(), subscriptionId]
    );
    client.release();
  } catch (err) {
    console.error(err);
    throw new Error("Update flight price failed");
  }
};

export const getAllFlightSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT
          id,
          chat_id,
          departure_iata_code,
          arrival_iata_code,
          departure_date_min,
          departure_date_max,
          arrival_date_min,
          arrival_date_max,
          duration_min,
          duration_max,
          adults,
          teens,
          children,
          infants,
          price,
          updated_at
        FROM flight_subscriptions`
    );
    client.release();
    return formatSubscriptions(result.rows);
  } catch (err) {
    console.error(err);
    throw new Error("Request for flight subscriptions failed");
  }
};

const formatSubscriptions = subsctiptions => {
  return map(subsctiptions, s => {
    const camelCased = objKeysToCamelCase(s);

    return {
      ...camelCased,
      departureDateMin: formatDate(camelCased.departureDateMin),
      departureDateMax: formatDate(camelCased.departureDateMax),
      arrivalDateMin: formatDate(camelCased.arrivalDateMin),
      arrivalDateMax: formatDate(camelCased.arrivalDateMax)
    };
  });
};

export const removeFlightSubscriptions = async (id: number) => {
  try {
    const client = await pool.connect();
    await client.query(
      `DELETE
        FROM flight_subscriptions
        WHERE id=$1`,
      [id]
    );
    client.release();
  } catch (err) {
    console.error(err);
    throw new Error("Request for flight subscriptions removal failed");
  }
};
