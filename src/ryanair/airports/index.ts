import axios from "axios";
import { Airport } from "../../types";
import { logger } from "../../logger";

let __airports__: Airport[];

const getAirports = async () => {
  if (__airports__) {
    return __airports__;
  }
  const resp = await axios.get(
    "https://www.ryanair.com/api/locate/v1/autocomplete/airports"
  );
  __airports__ = resp?.data?.map(
    ({
      code: iataCode,
      name: airportName,
      city: { name: cityName },
      country: { name: countryName },
    }) => ({
      airportName,
      iataCode,
      cityName,
      countryName,
    })
  );
  logger.info("loaded %s airports", __airports__.length);
  return __airports__;
};

export const getAirportsByNameOrIata = async (
  nameOrIata: string
): Promise<Airport[]> => {
  const lowedCased = nameOrIata.toLowerCase();
  const airports = await getAirports();
  const airportsByNameOrIata = airports?.filter(
    ({ airportName, iataCode }) =>
      airportName?.toLowerCase().includes(lowedCased) ||
      iataCode?.toLowerCase().includes(lowedCased)
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
  const lowedCased = iataCode.toLowerCase();
  const airports = await getAirports();
  const airportByIata = airports?.find(({ iataCode }) =>
    iataCode?.toLowerCase().includes(lowedCased)
  );
  logger.debug("getAirportByIataCode(%s) => %o", iataCode, airportByIata);
  return airportByIata;
};
