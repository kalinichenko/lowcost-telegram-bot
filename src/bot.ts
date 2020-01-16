process.env.NTBA_FIX_319 = "1";
import { map, join, last, split, isEmpty } from "lodash";
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
  passengersScene
} from "./new-search-scenes";

import {
  getMyFlightSubscriptions,
  Subscription,
  removeFlightSubscriptions
} from "./db/flightSubscriptions";
import { DEPARTURE_SCENE, SEARCH_RESULT_SCENE } from "./scenes";

import {
  NEW_SEARCH_ACTION,
  MAIN_MENU_ACTION,
  SUBSCRIPTION_LIST_ACTION
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
    passengersScene
  ],
  {
    ttl: 100
  }
);
bot.use(session());
bot.use(stage.middleware());

bot.action(NEW_SEARCH_ACTION, ctx => ctx.scene.enter(DEPARTURE_SCENE));
bot.action(SUBSCRIPTION_LIST_ACTION, async ctx => {
  const chatId = ctx.chat.id;
  const subscriptionList: Subscription[] = await getMyFlightSubscriptions(
    chatId
  );
  if (!isEmpty(subscriptionList)) {
    const msg = join(
      await Promise.all(
        map(subscriptionList, s => {
          return searchRequestFormatter(s);
        })
      ),
      "\n"
    );
    ctx.replyWithHTML(msg);
  } else {
    ctx.replyWithHTML("You have no subscriptions");
  }
});

bot.hears(/^\/remove_subscription_/, ctx => {
  const msg = ctx.message.text;
  const id = last(split(msg, "_"));

  if (id) {
    const subscriptionId = parseInt(id, 10);
    removeFlightSubscriptions(subscriptionId);
    ctx.reply("Subscription removed");
  }
});

const mainMenu = ctx => {
  return ctx.reply("Welcome to Ryanair bot.", mainMenuKeyboard);
};

bot.action(SEARCH_ACTION, ctx => {
  logger.debug("received SEARCH_ACTION action");
  ctx.scene.enter(SEARCH_RESULT_SCENE);
});

bot.action(MAIN_MENU_ACTION, mainMenu);
bot.on("message", mainMenu);
