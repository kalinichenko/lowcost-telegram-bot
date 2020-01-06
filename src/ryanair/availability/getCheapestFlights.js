const axios = require("axios");
const querystring = require("querystring");
const { get, isEmpty, reduce, minBy } = require("lodash");

const getQueryParams = require("./getQueryParams");

const findCheapestFlights = ({ dates, origin, destination }) =>
  reduce(
    dates,
    (acc, date) => {
      if (!isEmpty(date.flights)) {
        const cheapestFlight = minBy(date.flights, f =>
          get(f.regularFare, "fares.0.amount")
        );

        acc.push({
          amount: get(cheapestFlight, "regularFare.fares.0.amount"),
          departureTime: get(cheapestFlight, "time.0"),
          arrivalTime: get(cheapestFlight, "time.1"),
          origin,
          destination
        });
      }
      return acc;
    },
    []
  );

const getCheapestFlights = props => {
  const params = getQueryParams(props);
  console.log(
    `https://www.ryanair.com/api/booking/v4/en-gb/availability?${querystring.stringify(
      params
    )}`
  );

  return axios
    .get("https://www.ryanair.com/api/booking/v4/en-gb/availability", {
      params,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
      }
    })
    .then(resp => {
      const dates = get(resp.data, "trips.0.dates");

      return findCheapestFlights({
        dates,
        destination: props.destination,
        origin: props.origin
      });
    })
    .catch(error => {
      const { status } = error.response;
      if (status !== 404) {
        console.log("errors:", error);
        console.error("params:", params);
      }
      return [];
    });
};

module.exports = getCheapestFlights;
