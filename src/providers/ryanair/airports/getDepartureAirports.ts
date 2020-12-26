import axios from "axios";
import { logger } from "../../../logger";
import { Airport } from "../../../types";

const locale2market = {
  ru: "uk-ua",
  en: "en-gb",
};

export const getDepartureAirports = async (
  locale: string
): Promise<Record<string, Airport>> => {
  const resp = await axios.get(
    `https://www.ryanair.com/api/locate/v1/autocomplete/airports?market=${locale2market[locale]}`
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
    "[ryanair] loaded %s airports for locale %s",
    Object.keys(departureAirports).length,
    locale
  );
  return departureAirports;
};
