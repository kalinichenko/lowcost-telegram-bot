import { get } from "lodash";
import { getAirportByIataCode } from "../ryanair/airports";
import formatShortDate from "./formatShortDate";
import { Subscription } from "../db/flightSubscriptions";
import formatDateTime from "./formatDateTime";

const getAirportName = async (iataCode: string): Promise<string> =>
  get(await getAirportByIataCode(iataCode), "airportName");

export default async (subscription: Subscription): Promise<string> => {
  const {
    departureIataCode,
    arrivalIataCode,
    departureDateMin,
    departureDateMax,
    arrivalDateMin,
    arrivalDateMax,
    durationMin,
    durationMax,
    adults,
    teens,
    children,
    infants,
    id,
    price,
    updatedAt,
  } = subscription;

  const depratureAirport: string = await getAirportName(departureIataCode);
  const arrivalAirport: string = await getAirportName(arrivalIataCode);

  const departureDates: string = `Departure: ${
    formatShortDate(departureDateMin) +
    (departureDateMax ? " - " + formatShortDate(departureDateMax) : "")
  }\n`;

  const arrivalDates: string = arrivalDateMin
    ? `Arrival: ${
        formatShortDate(arrivalDateMin) +
        (arrivalDateMax ? " - " + formatShortDate(arrivalDateMax) : "")
      }\n`
    : "";

  const durations: string = durationMin
    ? `Trip duration: ${durationMin}${durationMax && " - " + durationMax}\n`
    : "";

  return (
    `<b>${depratureAirport} (${departureIataCode}) - ${arrivalAirport} (${arrivalIataCode})</b>\n` +
    departureDates +
    arrivalDates +
    durations +
    `${adults > 1 ? "Adults: " + adults + "\n" : ""}` +
    `${teens > 0 ? "Teens: " + teens + "\n" : ""}` +
    `${children > 0 ? "Children: " + children + "\n" : ""}` +
    `${infants > 0 ? "Infants: " + infants + "\n" : ""}` +
    `Last price: ${price} EUR\n` +
    `Updated at ${formatDateTime(updatedAt)}\n` +
    `Remove subscription: /remove_subscription_${id}\n`
  );
};
