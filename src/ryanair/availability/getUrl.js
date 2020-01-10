const dayjs = require("dayjs");
const querystring = require("querystring");
import { getQueryParams } from "./getQueryParams";

const BASE_PATH = "https://www.ryanair.com/gb/en/trip/flights/select";

export default ({
  departureIataCode,
  arrivalIataCode,
  departureTime,
  arrivalTime
}) => {
  return `${BASE_PATH}?${querystring.stringify(
    getQueryParams({
      departureIataCode,
      arrivalIataCode,
      departureDate: dayjs(departureTime).format("YYYY-MM-DD"),
      flexDays: 2,
      arrivalDate: arrivalTime && dayjs(arrivalTime).format("YYYY-MM-DD")
    })
  )}`;
};
