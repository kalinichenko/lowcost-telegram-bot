import axios from "axios";
import { logger } from "../../../logger";
import { Airport } from "../../../types";

const locale2market = {
  ru: "uk-ua",
  en: "en-gb",
};

export const getArrivalAirports = async (
  departureIata: string,
  locale: string
): Promise<Airport[]> => {
  const resp = await axios.get(
    `https://www.ryanair.com/api/locate/v1/autocomplete/routes?departurePhrase=${departureIata}&market=${locale2market[locale]}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
      },
    }
  );
  logger.info(
    "[ryanair] loaded %s arrival airports by departure %s",
    resp.data.length,
    departureIata
  );

  return resp.data.map((airport) => {
    const {
      name: airportName,
      code: iataCode,
      city: { name: cityName },
      country: { name: countryName },
    } = airport.arrivalAirport;

    return {
      airportName,
      iataCode,
      cityName,
      countryName,
      fullName: `${airportName} (${iataCode})`,
    };
  });
};
