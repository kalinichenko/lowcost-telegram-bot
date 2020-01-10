import { get } from "lodash";
const Scene = require("telegraf/scenes/base");
import { SEARCH_RESULT_SCENE, DEPARTURE_SCENE } from "../scenes";
import { getRyanairFlight } from "../ryanair/availability";
import getRyanairUrl from "../ryanair/availability/getUrl";
import {
  Subscription,
  addFlightSubscriptions
} from "../db/flightSubscriptions";

import flightFormatter from "../utils/flightFormatter";
import { CREATE_PRICE_ALERT_ACTION, MAIN_MENU_ACTION } from "../actions";

import { searchMenuTrackKeyboard } from "../keyboards/search-menu-track-keyboard";
import { newSearchKeyboard } from "../keyboards/new-search-keyboard";

export const searchResultScene = new Scene(SEARCH_RESULT_SCENE);

searchResultScene.action(MAIN_MENU_ACTION, ctx =>
  ctx.scene.leave(SEARCH_RESULT_SCENE)
);

searchResultScene.enter(async ctx => {
  const { arrivalDateMin, durationMin } = ctx.session.searchParams;
  console.log("context: ", ctx.session.searchParams);

  const cheapestFlight = await getRyanairFlight(ctx.session.searchParams);

  console.log("cheapestFlight", cheapestFlight);

  const IS_ROUND_TRIP = arrivalDateMin || durationMin;

  return IS_ROUND_TRIP
    ? await replyWithRoundTripMessage(
        ctx,
        get(cheapestFlight, "outbound"),
        get(cheapestFlight, "inbound")
      )
    : await replyWithOneWayTripMessage(ctx, get(cheapestFlight, "outbound"));
});

const replyWithOneWayTripMessage = async (ctx, outbound) => {
  if (!outbound) {
    return ctx.replyWithHTML("No flight found", newSearchKeyboard);
  }

  const url = getRyanairUrl({
    ...outbound,
    arrivalTime: null
  });

  const msg =
    `${await flightFormatter(outbound)}\n` +
    `Buy ticket <a href="${url}">here</>\n`;

  return ctx.replyWithHTML(msg, searchMenuTrackKeyboard);
};

const replyWithRoundTripMessage = async (ctx, outbound, inbound) => {
  if (!outbound && !inbound) {
    return ctx.replyWithHTML("No flights found", newSearchKeyboard);
  }

  let urlParams;
  if (outbound && inbound) {
    urlParams = {
      ...outbound,
      arrivalTime: get(inbound, "departureTime")
    };
  } else if (outbound && !inbound) {
    urlParams = {
      ...outbound,
      arrivalTime: null
    };
  } else {
    urlParams = {
      ...inbound,
      arrivalTime: null
    };
  }

  const url = getRyanairUrl(urlParams);

  const msg =
    `${
      outbound ? await flightFormatter(outbound) : "No inbound flight found.\n"
    }\n` +
    `${
      inbound ? await flightFormatter(inbound) : "No inbound flight found.\n"
    }` +
    `Buy tickets <a href="${url}">here</>\n`;

  return ctx.replyWithHTML(msg, searchMenuTrackKeyboard);
};

searchResultScene.action(CREATE_PRICE_ALERT_ACTION, async ctx => {
  const chatId = ctx.chat.id;

  const subscription: Subscription = {
    ...ctx.session.searchParams,
    chatId
  };

  await addFlightSubscriptions(subscription);
  return ctx.reply("Price alert added");
});

searchResultScene.hears("New search", ctx => {
  ctx.scene.leave(SEARCH_RESULT_SCENE);
  ctx.scene.enter(DEPARTURE_SCENE);
});
