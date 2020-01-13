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
import { Trip } from "./types";

export const scanFlights = async () => {
  const subscriptions = await getAllFlightSubscriptions();
  // console.log(subscriptions);
  subscriptions.forEach(async (subscription: Subscription) => {
    const subscriptionId = subscription.id;
    const flightPrice = head(
      await getFlightPrice({
        subscriptionId
      })
    );


    const cheapestFlight: Trip = await getRyanairFlight(subscription);
    console.log('updating subscription: ', flightPrice, 'new price: ', cheapestFlight.amount);

    if (flightPrice) {
      updateFlightPrice({
        price: cheapestFlight.amount,
        subscriptionId
      });
      const priceChange = Math.abs(cheapestFlight.amount - flightPrice.price);
      if (priceChange > flightPrice.price / 20) {
        notify(subscription, cheapestFlight, flightPrice.price);
      }
      // console.log("priceChange:", priceChange);
    } else {
      saveFlightPrice({
        price: cheapestFlight.amount,
        subscriptionId
      });
    }
  });

  // console.log(subscriptions);
};

const notify = async (
  subscription: Subscription,
  cheapestFlight: Trip,
  oldPrice: number
) => {
  const { chatId, departureIataCode, arrivalIataCode } = subscription;

  const { outbound, inbound, amount } = cheapestFlight;

  const departureTime = get(outbound, "dateOut");
  const arrivalTime = get(outbound, "dateOut");

  const url = getRyanairUrl({
    departureIataCode,
    arrivalIataCode,
    departureTime,
    arrivalTime
  });

  const outboundMessage = outbound ? await flightFormatter(outbound) : "";
  const inboundMessage = inbound ? await flightFormatter(inbound) : "";

  const response =
    `Old price: ${oldPrice}\n` +
    `New price: ${amount}\n` +
    outboundMessage +
    inboundMessage +
    `Buy ticket <a href="${url}">here</>`;
  bot.telegram.sendMessage(chatId, response, { parse_mode: "HTML" });
};
