import { head, get } from "lodash";
import {
  getAllFlightSubscriptions,
  Subscription,
  updateMySubscription,
  removeFlightSubscriptionByChatId,
} from "./db/flightSubscriptions";
import { getRyanairFlight } from "./providers/ryanair/availability";
import getRyanairUrl from "./providers/ryanair/availability/getUrl";
import flightFormatter from "./utils/flightFormatter";
import { bot } from "./bot";
import { Trip } from "./types";
import { logger } from "./logger";
import { i18n } from "./i18n";

export const scanFlights = async () => {
  const subscriptions = await getAllFlightSubscriptions();

  subscriptions.forEach(async (subscription: Subscription) => {
    const cheapestFlight: Trip = await getRyanairFlight(subscription);
    logger.info(
      "updating subscription id: %s new price: %s",
      subscription.id,
      cheapestFlight.amount
    );

    updateMySubscription({
      price: cheapestFlight.amount,
      subscriptionId: subscription.id,
    });
    const priceChange = Math.abs(cheapestFlight.amount - subscription.price);
    if (priceChange > subscription.price / 20) {
      notify(subscription, cheapestFlight);
    }
  });
};

const notify = async (subscription: Subscription, cheapestFlight: Trip) => {
  const {
    chatId,
    departureIataCode,
    arrivalIataCode,
    price: priceBefore,
    locale,
  } = subscription;

  const { outbound, inbound, amount: price } = cheapestFlight;

  const departureTime = get(outbound, "dateOut");
  const arrivalTime = get(inbound, "dateOut");

  const url = getRyanairUrl({
    departureIataCode,
    arrivalIataCode,
    departureTime,
    arrivalTime,
    locale,
  });

  const I18n = i18n.createContext(locale);
  const outboundMessage = outbound ? await flightFormatter(outbound, I18n) : "";
  const inboundMessage = inbound ? await flightFormatter(inbound, I18n) : "";

  const response =
    `<b>New price alert: ${price}EUR</b>\n` +
    `Price before: ${priceBefore}EUR\n` +
    outboundMessage +
    inboundMessage +
    `Buy ticket <a href="${url}">here</>`;
  try {
    await bot.telegram.sendMessage(chatId, response, { parse_mode: "HTML" });
  } catch (e) {
    if (e.code === 403) {
      removeFlightSubscriptionByChatId(chatId);
    }
    logger.error(e);
  }
};
