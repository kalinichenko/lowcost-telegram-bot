import * as ryanair from "./ryanair/airports";
import * as wizzair from "./wizzair/airports";
import { Airport } from "../types";
import { logger } from "../logger";
import { findAirports } from "./findAirports";

let departureAirports: Record<string, Airport>;

const getDepartureAirports = async (): Promise<Record<string, Airport>> => {
  if (!departureAirports) {
    const [a, b] = await Promise.all([
      ryanair.getDepartureAirports(),
      wizzair.getDepartureAirports(),
    ]);
    departureAirports = { ...a, ...b };
  }
  return departureAirports;
};

export const findDepartureAirports = async (
  nameOrIata: string
): Promise<Airport[]> => {
  const departureAirports = await getDepartureAirports();
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

export const getDepartureAirportByIataCode = async (
  iataCode: string
): Promise<Airport> => {
  const departureAirports = await getDepartureAirports();
  return departureAirports[iataCode.toLowerCase()];
};

export const getDepartureAirportName = async (iataCode) => {
  const { airportName } = await getDepartureAirportByIataCode(iataCode);
  return airportName;
};

export const findArrivalAirports = async (
  departureIata: string,
  arrivalPhrase: string
): Promise<Airport[]> => {
  const [a, b] = await Promise.all([
    ryanair.findArrivalAirports(departureIata, arrivalPhrase),
    wizzair.findArrivalAirports(departureIata, arrivalPhrase),
  ]);
  return [...(a || []), ...(b || [])].filter(
    (value, index, self) =>
      self.findIndex(({ iataCode }) => iataCode === value.iataCode) === index
  );
};
