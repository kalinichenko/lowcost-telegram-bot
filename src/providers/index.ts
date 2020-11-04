import { getDepartureAirports as getDepartureAirportsForRyanair } from "../ryanair/airports";
import { getDepartureAirports as getDepartureAirportsForWizzair } from "../wizzair/airports";
import { Airport } from "../types";
import { logger } from "../logger";

let departureAirports: Record<string, Airport>;

export const getAirportsByNameOrIata = async (
  nameOrIata: string
): Promise<Airport[]> => {
  const lowedCased = nameOrIata.toLowerCase();

  const airportByIata = await getAirportByIataCode(nameOrIata);

  const airportsByNameOrIata = airportByIata
    ? [airportByIata]
    : Object.values(departureAirports).filter(
        ({ airportName, iataCode }) =>
          airportName.toLowerCase().includes(lowedCased) ||
          (lowedCased.includes(airportName.toLowerCase()) &&
            lowedCased.includes(iataCode.toLowerCase()))
      );
  logger.debug(
    "getAirportsByNameOrIata(%s) => %o",
    nameOrIata,
    airportsByNameOrIata
  );
  return airportsByNameOrIata;
};

export const getAirportByIataCode = async (
  iataCode: string
): Promise<Airport> => {
  if (!departureAirports) {
    const [a, b] = await Promise.all([
      getDepartureAirportsForRyanair(),
      getDepartureAirportsForWizzair(),
    ]);
    departureAirports = { ...a, ...b };
  }
  return departureAirports[iataCode.toLowerCase()];
};

export const getAirportName = async (iataCode) => {
  const { airportName } = await getAirportByIataCode(iataCode);
  return airportName;
};
