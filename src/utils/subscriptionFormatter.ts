import { getDepartureAirportName } from "../providers";
import formatShortDate from "./formatShortDate";
import { Subscription } from "../db/flightSubscriptions";
import formatDateTime from "./formatDateTime";
import { i18n } from "../i18n";

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
    locale,
  } = subscription;

  const I18n = i18n.createContext(locale);

  const depratureAirport: string = await getDepartureAirportName(
    departureIataCode,
    locale
  );
  const arrivalAirport: string = await getDepartureAirportName(
    arrivalIataCode,
    locale
  );

  const departureDates: string =
    formatShortDate(departureDateMin) +
    (departureDateMax ? " - " + formatShortDate(departureDateMax) : "");

  const arrivalDates: string = arrivalDateMin
    ? `${I18n.t("arrival-dates", {
        dates: `${
          formatShortDate(arrivalDateMin) +
          (arrivalDateMax ? " - " + formatShortDate(arrivalDateMax) : "")
        }`,
      })}\n`
    : "";

  const durations: string = durationMin
    ? `${I18n.t("depature-dates", {
        days: `${durationMin}${durationMax && " - " + durationMax}`,
      })}\n`
    : "";

  return (
    `<b>${depratureAirport} (${departureIataCode}) - ${arrivalAirport} (${arrivalIataCode})</b>\n` +
    `${I18n.t("depature-dates", { dates: departureDates })}\n` +
    arrivalDates +
    durations +
    `${adults > 1 ? `${I18n.t("adults", { num: adults })}` : ""}` +
    `${teens > 0 ? `${I18n.t("teens", { num: teens })}` : ""}` +
    `${children > 0 ? `${I18n.t("children", { num: children })}` : ""}` +
    `${infants > 0 ? `${I18n.t("infants", { num: infants })}` : ""}` +
    `${I18n.t("last-price", { price })}\n` +
    `${I18n.t("updated-at", { date: formatDateTime(updatedAt) })}\n` +
    `${I18n.t("remove-subscription", { id })}\n`
  );
};
