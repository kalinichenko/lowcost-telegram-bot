process.env.NTBA_FIX_319 = "1";
import { map, join, last, split, isEmpty } from "lodash";
import { i18n } from "./i18n";
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
import { mainMenuKeyboard } from "./keyboards/main-menu-keyboard";
import searchRequestFormatter from "./utils/subscriptionFormatter";
import { logger } from "./logger";

import {
  departureScene,
  arrivalScene,
  departureDateScene,
  arrivalDateScene,
  searchResultScene,
  passengersScene,
} from "./new-search-scenes";

import {
  getMyFlightSubscriptions,
  Subscription,
  removeFlightSubscriptionById,
} from "./db/flightSubscriptions";
import {
  DEPARTURE_SCENE,
  PASSENGERS_SCENE,
  SEARCH_RESULT_SCENE,
} from "./scenes";

import {
  NEW_SEARCH_ACTION,
  MAIN_MENU_ACTION,
  SUBSCRIPTION_LIST_ACTION,
  ONE_WAY_ACTION,
} from "./actions";

import { SEARCH_ACTION } from "./actions";

export const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const stage = new Stage(
  [
    departureScene,
    arrivalScene,
    departureDateScene,
    arrivalDateScene,
    searchResultScene,
    passengersScene,
  ],
  {
    ttl: 100,
  }
);

bot.use(i18n.middleware());
bot.use(session());
bot.use(stage.middleware());

bot.action(NEW_SEARCH_ACTION, (ctx) => ctx.scene.enter(DEPARTURE_SCENE));
bot.action(SUBSCRIPTION_LIST_ACTION, async (ctx) => {
  const chatId = ctx.chat.id;
  const subscriptionList: Subscription[] = await getMyFlightSubscriptions(
    chatId
  );
  if (!isEmpty(subscriptionList)) {
    const msg = join(
      await Promise.all(
        map(subscriptionList, (s) => {
          return searchRequestFormatter(s);
        })
      ),
      "\n"
    );
    ctx.replyWithHTML(msg);
  } else {
    ctx.reply(ctx.i18n.t("you-have-no-subscriptions"));
  }
});

bot.hears(/^\/remove_subscription_/, (ctx) => {
  const msg = ctx.message.text;
  const id = last(split(msg, "_"));

  if (id) {
    const subscriptionId = parseInt(id, 10);
    removeFlightSubscriptionById(subscriptionId);
    ctx.reply(ctx.i18n.t("subscription-removed"));
  }
});

const mainMenu = (ctx) => {
  logger.debug("request locale: %s", ctx.i18n.locale());
  return ctx.replyWithHTML(ctx.i18n.t("greeting"), mainMenuKeyboard(ctx));
};

bot.action(SEARCH_ACTION, (ctx) => {
  logger.debug("received SEARCH_ACTION action");
  if (!ctx.session.searchParams) {
    ctx.scene.enter(DEPARTURE_SCENE);
  } else {
    ctx.scene.enter(SEARCH_RESULT_SCENE);
  }
});

bot.action(MAIN_MENU_ACTION, mainMenu);

bot.action(ONE_WAY_ACTION, (ctx) => {
  ctx.scene.enter(PASSENGERS_SCENE);
});

bot.on("message", mainMenu);
