import axios from "axios";
import { map, get, filter, includes, toLower } from "lodash";
import { Airport } from "../../types";
import { logger } from "../../logger";

const departure2arrivals = {};

const getArrivalsByDeparture = async (
  departureIata: string
): Promise<Airport[]> => {
  if (departure2arrivals[departureIata]) {
    return Promise.resolve(departure2arrivals[departureIata]);
  }
  const resp = await axios.get(
    `https://www.ryanair.com/api/locate/v1/autocomplete/routes?departurePhrase=${departureIata}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
      },
    }
  );
  departure2arrivals[departureIata] = map(resp.data, (airport) => {
    const arrivalAirport = airport?.arrivalAirport;
    return {
      airportName: arrivalAirport?.name,
      iataCode: arrivalAirport?.code,
      cityName: arrivalAirport?.city.name,
      countryName: arrivalAirport?.country.name,
    };
  });
  return departure2arrivals[departureIata];
};

export const getArrivalAirport = async (
  departureIata: string,
  arrivalPhrase: string
) => {
  const airports: Airport[] = await getArrivalsByDeparture(departureIata);
  const phrase = toLower(arrivalPhrase);
  const arrivalAirport = filter(airports, ({ airportName, iataCode }) => {
    return (
      includes(toLower(airportName), phrase) || toLower(iataCode) === phrase
    );
  });
  logger.debug(
    "getArrivalAirport(%s, %s) => %o",
    departureIata,
    arrivalPhrase,
    arrivalAirport
  );
  return arrivalAirport;
};
