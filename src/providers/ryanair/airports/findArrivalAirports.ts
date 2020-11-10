import { logger } from "../../../logger";
import { Airport } from "../../../types";
import { findAirports } from "../../findAirports";
import { getArrivalAirports } from "./getArrivalAirports";

const ryanairArrivalAirports = {};

export const findArrivalAirports = async (
  departureIata: string,
  arrivalPhrase: string
): Promise<Airport[]> => {
  if (!ryanairArrivalAirports[departureIata]) {
    ryanairArrivalAirports[departureIata] = await getArrivalAirports(
      departureIata
    );
  }
  const arrivalAirports = findAirports(
    arrivalPhrase,
    ryanairArrivalAirports[departureIata]
  );

  logger.debug(
    "[ryanair] findArrivalAirports(%s, %s) => %o",
    departureIata,
    arrivalPhrase,
    arrivalAirports
  );
  return arrivalAirports;
};
