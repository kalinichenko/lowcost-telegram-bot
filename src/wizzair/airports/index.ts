import axios from "axios";
import { Airport } from "../../types";
import { logger } from "../../logger";

import { getApiUrl } from "../meta";

let iata2airport: Record<string, Airport>;
let iata2arrivalAirports: Record<string, Airport[]>;

export const getAirports = async (): Promise<Airport[]> => {
  if (iata2airport) {
    return Object.values(iata2airport);
  }

  const apiUrl = await getApiUrl();
  const resp = await axios.get(`${apiUrl}/asset/map?languageCode=en-gb`);
  iata2airport = resp?.data?.reduce(
    (acc, { iata: iataCode, shortName: airportName, countryName }) => {
      acc[iataCode] = {
        airportName,
        iataCode,
        countryName,
      };
      return acc;
    },
    {}
  );
  logger.info("[wizzair] loaded %s airports", iata2airport.length);

  iata2arrivalAirports = resp?.data?.reduce((acc, airport) => {
    if (airport.connections) {
      acc[airport.iata] = airport.connections.map(
        ({ iata }) => iata2airport[iata]
      );
    }
    return acc;
  }, {});

  return Object.values(iata2airport);
};

export const getArrivalAirports = (
  departureIata: string,
  arrivalPhrase: string
): Airport[] => {
  if (!iata2arrivalAirports) {
    return null;
  }
  const arrivalAirports: Airport[] = iata2arrivalAirports[departureIata];
  if (!arrivalAirports) {
    return null;
  }
  const phrase = arrivalPhrase.toLowerCase();
  const arrivalAirport = arrivalAirports?.filter(
    ({ airportName, iataCode }) =>
      airportName.toLowerCase().includes(phrase) ||
      iataCode.toLowerCase() === phrase
  );
  logger.debug(
    "[wizzair] arrival airports for departure iata %s by phrase %s: %o",
    departureIata,
    arrivalPhrase,
    arrivalAirport
  );
  return arrivalAirport;
};
