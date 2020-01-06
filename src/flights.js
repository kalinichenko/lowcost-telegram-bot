const { head } = require("lodash");
const dayjs = require("dayjs");
const { getFlightSubscriptions } = require("./db/flightSubscriptions");
const {
  getFlightPrice,
  saveFlightPrice,
  updateFlightPrice
} = require("./db/flightPrices");
const getRyanairFlight = require("./ryanair/availability");
const getRyanairUrl = require("./ryanair/availability/getUrl");
const bot = require("./bot");

const scanFlights = async () => {
  const subscriptions = await getFlightSubscriptions();
  subscriptions.forEach(async subscription => {
    const cheapestFlight = head(
      await getFlightPrice({
        subscriptionId: subscription.id,
        operator: "ryanair"
      })
    );
    // console.log(cheapestFlight);

    const nextCheapestFlight = await getRyanairFlight(subscription);

    if (cheapestFlight) {
      updateFlightPrice(nextCheapestFlight);
      const priceChange = Math.abs(
        nextCheapestFlight.price - cheapestFlight.price
      );
      if (priceChange > 20) {
        notify({
          cheapestFlight,
          nextCheapestFlight,
          subscription
        });
      }
    } else {
      saveFlightPrice(nextCheapestFlight);
    }
  });

  // console.log(subscriptions);
};

const notify = ({
  subscription: { chatId, origin, destination },
  cheapestFlight: { price: oldPrice },
  nextCheapestFlight: { outDate, inDate, price }
}) => {
  const url = getRyanairUrl({
    origin,
    destination,
    outDate,
    inDate
  });
  // console.log(url);
  const response =
    `Route: ${origin}-${destination}\n` +
    `Departure: ${dayjs(outDate).format("DD.MM HH:mm")}\n` +
    `Arrival: ${dayjs(inDate).format("DD.MM HH:mm")}\n` +
    `New price: ${price}\n` +
    `Old price: ${oldPrice}\n` +
    `Buy ticket <a href="${url}">here</>`;

  bot.telegram.sendMessage(chatId, response, { parse_mode: "HTML" });
};

module.exports = {
  scanFlights
};
