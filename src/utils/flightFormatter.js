const dayjs = require("dayjs");
import { getDepartureAirportName } from "../providers";

export default async (
  { departureIataCode, arrivalIataCode, departureTime, arrivalTime, amount },
  i18n
) => {
  const departureAirportName = await getDepartureAirportName(
    departureIataCode,
    i18n.locale()
  );
  const arrivalAirportName = await getDepartureAirportName(
    arrivalIataCode,
    i18n.locale()
  );

  const dates = `${dayjs(departureTime).format("DD.MM HH:mm")}-${dayjs(
    arrivalTime
  ).format("DD.MM HH:mm")}`;

  const date = `${i18n.t("date", { date: dates })}\n` || `Date: ${dates}\n`;
  const price =
    `${i18n.t("price", { price: amount })}\n` || `Price: ${amount} EUR\n`;

  return (
    `<b>${departureAirportName} (${departureIataCode}) - ${arrivalAirportName} (${arrivalIataCode})</b>\n` +
    date +
    price
  );
};
