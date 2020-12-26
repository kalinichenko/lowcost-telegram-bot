import { logger } from "../../../logger";
import { Airport } from "../../../types";
import { findAirports } from "../../findAirports";
import { getArrivalAirports } from "./getArrivalAirports";

const ryanairArrivalAirports = {};

export const findArrivalAirports = async (
  departureIata: string,
  arrivalPhrase: string,
  locale: string
): Promise<Airport[]> => {
  const key = `${departureIata}_${locale}`;

  if (!ryanairArrivalAirports[key]) {
    ryanairArrivalAirports[key] = await getArrivalAirports(
      departureIata,
      locale
    );
  }
  const arrivalAirports = findAirports(
    arrivalPhrase,
    ryanairArrivalAirports[key]
  );

  logger.debug(
    "[ryanair] findArrivalAirports(%s, %s, %s) => %o",
    departureIata,
    arrivalPhrase,
    locale,
    arrivalAirports
  );
  return arrivalAirports;
};
