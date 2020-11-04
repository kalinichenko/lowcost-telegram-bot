const dayjs = require("dayjs");
import { getAirportName } from "../providers";

export default async ({
  departureIataCode,
  arrivalIataCode,
  departureTime,
  arrivalTime,
  amount,
}) => {
  const departureAirportName = await getAirportName(departureIataCode);
  const arrivalAirportName = await getAirportName(arrivalIataCode);

  return (
    `<b>${departureAirportName} (${departureIataCode}) - ${arrivalAirportName} (${arrivalIataCode})</b>\n` +
    `Date: ${dayjs(departureTime).format("DD.MM HH:mm")}-${dayjs(
      arrivalTime
    ).format("DD.MM HH:mm")}\n` +
    `Price: ${amount} EUR\n`
  );
};
