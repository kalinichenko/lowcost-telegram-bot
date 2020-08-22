const axios = require("axios");
const querystring = require("querystring");
import { get, isEmpty, reduce, minBy } from "lodash";
import { Flight } from "../../types";

import { getQueryParams } from "./getQueryParams";
import { logger } from "../../logger";

const findCheapestFlights = ({ dates, departureIataCode, arrivalIataCode }) => {
  const cheapestFlights = reduce(
    dates,
    (acc, date) => {
      if (!isEmpty(date.flights)) {
        const cheapestFlight = minBy(date.flights, (f) =>
          get(f.regularFare, "fares.0.amount")
        );

        const flight: Flight = {
          amount: get(cheapestFlight, "regularFare.fares.0.amount"),
          departureTime: get(cheapestFlight, "time.0"),
          arrivalTime: get(cheapestFlight, "time.1"),
          departureIataCode,
          arrivalIataCode,
          dateOut: new Date(date.dateOut),
        };
        acc.push(flight);
      }
      return acc;
    },
    []
  );
  logger.debug("cheapest flights from reponse: %o", cheapestFlights);
  return cheapestFlights;
};

export const getCheapestFlights = (props) => {
  const params = getQueryParams(props);
  logger.trace(
    "requesting endpoint: %s",
    `https://www.ryanair.com/api/booking/v4/en-gb/availability?${querystring.stringify(
      params
    )}`
  );

  return axios
    .get("https://www.ryanair.com/api/booking/v4/en-gb/availability", {
      params,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
      },
    })
    .then((resp) => {
      logger.trace("raw response: %o", resp.data);

      const dates = get(resp.data, "trips.0.dates");

      return findCheapestFlights({
        dates,
        arrivalIataCode: props.arrivalIataCode,
        departureIataCode: props.departureIataCode,
      });
    })
    .catch((error) => {
      const { status } = error.response;
      if (status !== 404) {
        logger.error("errors: %o", error);
        logger.error("params: %o", params);
      }
      return [];
    });
};
