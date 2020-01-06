const dayjs = require("dayjs");
const querystring = require("querystring");
const getQueryParams = require("./getQueryParams");

const BASE_PATH = "https://www.ryanair.com/gb/en/trip/flights/select";

const getUrl = ({ origin, destination, departureTime, arrivalTime }) => {
  return `${BASE_PATH}?${querystring.stringify(
    getQueryParams({
      origin: origin,
      destination: destination,
      departureDate: dayjs(departureTime).format("YYYY-MM-DD"),
      flexDays: 2,
      arrivalDate: arrivalTime && dayjs(arrivalTime).format("YYYY-MM-DD")
    })
  )}`;
};

module.exports = getUrl;
