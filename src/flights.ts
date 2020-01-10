import { head, get } from "lodash";
import {
  getAllFlightSubscriptions,
  Subscription
} from "./db/flightSubscriptions";
import {
  getFlightPrice,
  saveFlightPrice,
  updateFlightPrice
} from "./db/flightPrices";
import { getRyanairFlight } from "./ryanair/availability";
import getRyanairUrl from "./ryanair/availability/getUrl";
import flightFormatter from "./utils/flightFormatter";
import { bot } from "./bot";

export const scanFlights = async () => {
  const subscriptions = await getAllFlightSubscriptions();
  console.log(subscriptions);
  subscriptions.forEach(async (subscription: Subscription) => {
    const subscriptionId = subscription.id;
    const flightPrice = head(
      await getFlightPrice({
        subscriptionId
      })
    );

    const cheapestFlight = await getRyanairFlight(subscription);
    const nextCheapestPrice =
      get(cheapestFlight, "outbound.amount", 0) +
      get(cheapestFlight, "inbound.amount", 0);

    console.log(cheapestFlight, nextCheapestPrice);

    if (flightPrice) {
      updateFlightPrice({
        price: nextCheapestPrice,
        subscriptionId
      });
      const priceChange = Math.abs(nextCheapestPrice - flightPrice.price);
      if (priceChange > flightPrice.price / 20) {
        notify({
          subscription,
          cheapestFlight,
          oldPrice: flightPrice.price
        });
      }
      console.log("priceChange:", priceChange);
    } else {
      saveFlightPrice({
        price: nextCheapestPrice,
        subscriptionId
      });
    }
  });

  // console.log(subscriptions);
};

const notify = async ({ subscription, cheapestFlight, oldPrice }) => {
  const {
    chatId,
    departureIataCode,
    arrivalIataCode,
    departureTime,
    arrivalTime
  } = subscription;

  const url = getRyanairUrl({
    departureIataCode,
    arrivalIataCode,
    departureTime,
    arrivalTime
  });

  const outbound = cheapestFlight.outbound
    ? await flightFormatter(cheapestFlight.outbound)
    : "";

  const inbound = cheapestFlight.inbound
    ? await flightFormatter(cheapestFlight.inbound)
    : "";

  const response =
    `Old price: ${oldPrice}\n` +
    outbound +
    inbound +
    `Buy ticket <a href="${url}">here</>`;
  bot.telegram.sendMessage(chatId, response, { parse_mode: "HTML" });
};
