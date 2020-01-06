const dayjs = require("dayjs");
const { head, get } = require("lodash");
const { getAirports } = require("../db/airports");

const getAirportName = async iataCode =>
  get(head(await getAirports(iataCode)), "airportName");

const flightFormatter = async ({
  origin,
  destination,
  departureTime,
  arrivalTime,
  amount
}) => {
  const originCityName = await getAirportName(origin);
  const destinationCityName = await getAirportName(destination);

  return (
    `<b>${originCityName} (${origin}) - ${destinationCityName} (${destination})</b>\n` +
    `Departure: ${dayjs(departureTime).format("DD.MM HH:mm")}\n` +
    `Arrival: ${dayjs(arrivalTime).format("DD.MM HH:mm")}\n` +
    `Price: ${amount}\n`
  );
};
module.exports = flightFormatter;
