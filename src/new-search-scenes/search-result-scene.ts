import { get } from "lodash";
const Scene = require("telegraf/scenes/base");
import { SEARCH_RESULT_SCENE, DEPARTURE_SCENE } from "../scenes";
import { getRyanairFlight } from "../providers/ryanair/availability";
import getRyanairUrl from "../providers/ryanair/availability/getUrl";
import {
  Subscription,
  addFlightSubscriptions,
} from "../db/flightSubscriptions";

import flightFormatter from "../utils/flightFormatter";
import { CREATE_PRICE_ALERT_ACTION, MAIN_MENU_ACTION } from "../actions";

import { searchMenuTrackKeyboard } from "../keyboards/search-menu-track-keyboard";
import { newSearchKeyboard } from "../keyboards/new-search-keyboard";
import { logger } from "../logger";

export const searchResultScene = new Scene(SEARCH_RESULT_SCENE);

searchResultScene.action(MAIN_MENU_ACTION, (ctx) =>
  ctx.scene.leave(SEARCH_RESULT_SCENE)
);

searchResultScene.enter(async (ctx) => {
  const { arrivalDateMin, durationMin } = ctx.session.searchParams;

  ctx.replyWithHTML(ctx.i18n.t("loading-results"));

  const cheapestFlight = await getRyanairFlight(ctx.session.searchParams);

  if (cheapestFlight) {
    ctx.session.searchParams = {
      ...ctx.session.searchParams,
      price: cheapestFlight.amount,
    };
  }

  const IS_ROUND_TRIP = arrivalDateMin || durationMin;

  if (IS_ROUND_TRIP) {
    replyWithRoundTripMessage(
      ctx,
      cheapestFlight?.outbound,
      cheapestFlight?.inbound
    );
  } else {
    replyWithOneWayTripMessage(ctx, cheapestFlight?.outbound);
  }
});

const replyWithOneWayTripMessage = async (ctx, outbound) => {
  if (!outbound) {
    return ctx.replyWithHTML(
      ctx.i18n.t("no-flights-found"),
      newSearchKeyboard(ctx)
    );
  }

  const url = getRyanairUrl({
    ...outbound,
    arrivalTime: null,
    locale: ctx.i18n.locale(),
  });

  const msg = `${await flightFormatter(
    outbound,
    ctx.i18n
  )}\n${ctx.i18n.t("buy-ticket-here", { url })}\n`;

  logger.trace("reply message: %s", msg);

  ctx.replyWithHTML(msg, searchMenuTrackKeyboard(ctx));
};

const replyWithRoundTripMessage = async (ctx, outbound, inbound) => {
  if (!outbound && !inbound) {
    return ctx.replyWithHTML(
      ctx.i18n.t("no-flights-found"),
      newSearchKeyboard(ctx)
    );
  }

  let urlParams;
  if (outbound && inbound) {
    urlParams = {
      ...outbound,
      arrivalTime: get(inbound, "departureTime"),
    };
  } else if (outbound && !inbound) {
    urlParams = {
      ...outbound,
      arrivalTime: null,
    };
  } else {
    urlParams = {
      ...inbound,
      arrivalTime: null,
    };
  }

  const url = getRyanairUrl(urlParams);

  const msg =
    `${
      outbound
        ? await flightFormatter(outbound, ctx.i18n)
        : `${ctx.i18n.t("no-outbound-flight-found")}\n`
    }\n` +
    `${
      inbound
        ? await flightFormatter(inbound, ctx.i18n)
        : `${ctx.i18n.t("no-inbound-flight-found")}\n`
    }${ctx.i18n.t("buy-ticket-here", { url })}\n`;

  return ctx.replyWithHTML(msg, searchMenuTrackKeyboard(ctx));
};

searchResultScene.action(CREATE_PRICE_ALERT_ACTION, async (ctx) => {
  const chatId = ctx.chat.id;

  const subscription: Subscription = {
    ...ctx.session.searchParams,
    chatId,
  };

  await addFlightSubscriptions(subscription);
  return ctx.reply(ctx.i18n.t("price-alert-added"));
});

searchResultScene.hears("New search", (ctx) => {
  ctx.scene.leave(SEARCH_RESULT_SCENE);
  ctx.scene.enter(DEPARTURE_SCENE);
});
