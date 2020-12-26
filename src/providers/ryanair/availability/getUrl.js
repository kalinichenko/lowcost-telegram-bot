const dayjs = require("dayjs");
const querystring = require("querystring");
import { getQueryParams } from "./getQueryParams";

const locale2path = {
  ru: "ua/uk",
  en: "gb/en",
};

export default ({
  departureIataCode,
  arrivalIataCode,
  departureTime,
  arrivalTime,
  locale = "en",
}) => {
  const localePath = locale2path[locale];
  const BASE_PATH = `https://www.ryanair.com/${localePath}/trip/flights/select`;

  return `${BASE_PATH}?${querystring.stringify(
    getQueryParams({
      departureIataCode,
      arrivalIataCode,
      departureDate: dayjs(departureTime).format("YYYY-MM-DD"),
      flexDays: 2,
      arrivalDate: arrivalTime && dayjs(arrivalTime).format("YYYY-MM-DD"),
      locale,
    })
  )}`;
};
