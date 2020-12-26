import * as ryanair from "./ryanair/airports";
import * as wizzair from "./wizzair/airports";
import { Airport } from "../types";
import { logger } from "../logger";
import { findAirports } from "./findAirports";

const locale2airports: Record<string, Record<string, Airport>> = {};

const getDepartureAirports = async (
  locale: string
): Promise<Record<string, Airport>> => {
  if (!locale2airports[locale]) {
    const [a, b] = await Promise.all([
      ryanair.getDepartureAirports(locale),
      // wizzair.getDepartureAirports(),
    ]);
    locale2airports[locale] = { ...a, ...b };
  }
  return locale2airports[locale];
};

export const findDepartureAirports = async (
  nameOrIata: string,
  locale: string
): Promise<Airport[]> => {
  const departureAirports = await getDepartureAirports(locale);
  const airportsByNameOrIata = findAirports(
    nameOrIata,
    Object.values(departureAirports)
  );

  logger.debug(
    "findDepartureAirports(%s) => %o",
    nameOrIata,
    airportsByNameOrIata
  );
  return airportsByNameOrIata;
};

const getDepartureAirportByIataCode = async (
  iataCode: string,
  locale: string
): Promise<Airport> => {
  const departureAirports = await getDepartureAirports(locale);
  return departureAirports[iataCode.toLowerCase()];
};

export const getDepartureAirportName = async (
  iataCode: string,
  locale: string
) => {
  const { airportName } = await getDepartureAirportByIataCode(iataCode, locale);
  return airportName;
};

export const findArrivalAirports = async (
  departureIata: string,
  arrivalPhrase: string,
  locale: string
): Promise<Airport[]> => {
  const [a, b] = await Promise.all([
    ryanair.findArrivalAirports(departureIata, arrivalPhrase, locale),
    // wizzair.findArrivalAirports(departureIata, arrivalPhrase),
  ]);
  return [...(a || []), ...(b || [])].filter(
    (value, index, self) =>
      self.findIndex(({ iataCode }) => iataCode === value.iataCode) === index
  );
};
