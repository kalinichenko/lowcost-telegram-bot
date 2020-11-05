import axios from "axios";
import { logger } from "../../logger";
import { Airport } from "../../types";

export const getDepartureAirports = async (): Promise<
  Record<string, Airport>
> => {
  const resp = await axios.get(
    "https://www.ryanair.com/api/locate/v1/autocomplete/airports"
  );
  const departureAirports = resp?.data?.reduce(
    (
      acc,
      {
        code: iataCode,
        name: airportName,
        city: { name: cityName },
        country: { name: countryName },
      }
    ) => {
      acc[iataCode.toLowerCase()] = {
        airportName,
        iataCode,
        cityName,
        countryName,
        fullName: `${airportName} (${iataCode})`,
      };
      return acc;
    },
    {}
  );
  logger.info(
    "[ryanair] loaded %s airports",
    Object.keys(departureAirports).length
  );
  return departureAirports;
};
