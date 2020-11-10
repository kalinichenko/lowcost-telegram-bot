import axios from "axios";
import { Airport } from "../../../types";
import { logger } from "../../../logger";

import { getApiUrl } from "../meta";
import { findAirports } from "../../findAirports";

let iata2arrivalAirports: Record<string, Airport[]>;

export const getDepartureAirports = async (): Promise<
  Record<string, Airport>
> => {
  const apiUrl = await getApiUrl();
  const resp = await axios.get(`${apiUrl}/asset/map?languageCode=en-gb`);
  const departureAirports = resp?.data?.cities?.reduce(
    (acc, { iata: iataCode, shortName: airportName, countryName }) => {
      acc[iataCode] = {
        airportName,
        iataCode,
        countryName,
        fullName: `${airportName.trim()} (${iataCode})`,
      };
      return acc;
    },
    {}
  );
  logger.info(
    "[wizzair] loaded %s airports",
    Object.keys(departureAirports).length
  );

  iata2arrivalAirports = resp?.data?.cities?.reduce((acc, airport) => {
    if (airport.connections) {
      acc[airport.iata] = airport.connections.map(
        ({ iata }) => departureAirports[iata]
      );
    }
    return acc;
  }, {});

  return departureAirports;
};

export const getArrivalAirports = (departureIata: string): Airport[] => {
  return iata2arrivalAirports[departureIata];
};

export const findArrivalAirports = (
  departureIata: string,
  arrivalPhrase: string
): Airport[] => {
  const airports = findAirports(
    arrivalPhrase,
    getArrivalAirports(departureIata)
  );

  logger.debug(
    "[wizzair ]findArrivalAirports(%s, %s) => %o",
    departureIata,
    arrivalPhrase,
    airports
  );
  return airports;
};
