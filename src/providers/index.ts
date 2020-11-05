import { getDepartureAirports as getDepartureAirportsForRyanair } from "../ryanair/airports";
import { getDepartureAirports as getDepartureAirportsForWizzair } from "../wizzair/airports";
import { getArrivalAirports as getArrivalRyaniarAirports } from "../ryanair/routes";
import { getArrivalAirports as getArrivalWizzairAirports } from "../wizzair/airports";
import { Airport } from "../types";
import { logger } from "../logger";

let departureAirports: Record<string, Airport>;
const ryanairArrivalAirports = {};

const getDepartureAirports = async (): Promise<Record<string, Airport>> => {
  if (!departureAirports) {
    const [a, b] = await Promise.all([
      getDepartureAirportsForRyanair(),
      getDepartureAirportsForWizzair(),
    ]);
    departureAirports = { ...a, ...b };
  }
  return departureAirports;
};

// const getArrivalAirports = async (): Promise<Record<string, Airport>> => {};

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
    findArrivalRyanairAirports(departureIata, arrivalPhrase),
    findArrivalWizzairAirports(departureIata, arrivalPhrase),
  ]);
  return [...a, ...b].filter(
    (value, index, self) =>
      self.findIndex(({ iataCode }) => iataCode === value.iataCode) === index
  );
};

const findArrivalRyanairAirports = async (
  departureIata: string,
  arrivalPhrase: string
): Promise<Airport[]> => {
  if (!ryanairArrivalAirports[departureIata]) {
    ryanairArrivalAirports[departureIata] = await getArrivalRyaniarAirports(
      departureIata
    );
  }
  const arrivalAirports = findAirports(
    arrivalPhrase,
    ryanairArrivalAirports[departureIata]
  );

  logger.debug(
    "findArrivalRyanairAirports(%s, %s) => %o",
    departureIata,
    arrivalPhrase,
    arrivalAirports
  );
  return arrivalAirports;
};

export const findArrivalWizzairAirports = (
  departureIata: string,
  arrivalPhrase: string
): Airport[] => {
  const airports = findAirports(
    arrivalPhrase,
    getArrivalWizzairAirports(departureIata)
  );

  logger.debug(
    "findArrivalWizzairAirports(%s, %s) => %o",
    departureIata,
    arrivalPhrase,
    airports
  );
  return airports;
};

const findAirports = (searchAirport, airports) => {
  const lowedCased = searchAirport?.toLowerCase();
  return airports?.filter(({ fullName }) => {
    return fullName.toLowerCase().includes(lowedCased);
  });
};
