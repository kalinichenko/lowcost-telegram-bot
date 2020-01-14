process.env.NTBA_FIX_319 = "1";
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const TOKEN = process.env.TELEGRAM_TOKEN;
import { mainMenuKeyboard } from "./keyboards/main-menu-keyboard";
import searchRequestFormatter from "./utils/subscriptionFormatter";
import { map, join, last, split, isEmpty } from "lodash";

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
import { DEPARTURE_SCENE } from "./scenes";

import {
  NEW_SEARCH_ACTION,
  MAIN_MENU_ACTION,
  SUBSCRIPTION_LIST_ACTION
} from "./actions";

const url = process.env.APP_URL || "https://ryanair-price-hunter.herokuapp.com";

export const bot = new Telegraf(TOKEN);
bot.telegram.setWebhook(`${url}/bot${TOKEN}`);

const exitHandler = async signal => {
  await bot.telegram.deleteWebhook();
  console.log(signal);
  process.exit(0);
};

process.on("SIGTERM", exitHandler);
process.on("SIGINT", exitHandler);
process.on("SIGUSR1", exitHandler);
process.on("SIGUSR2", exitHandler);

process.on("unhandledRejection", async (reason, promise) => {
  if (reason && reason instanceof Error) {
    console.log(reason.message, reason.stack);
  }
  await bot.telegram.deleteWebhook();
  console.log("Unhandled Promise");
  process.exit(1);
});

process.on("uncaughtException", async reason => {
  if (reason && reason instanceof Error) {
    console.log(reason.message, reason.stack);
  }
  await bot.telegram.deleteWebhook();
  console.log("Unexpected Error");
  process.exit(1);
});

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

bot.action(MAIN_MENU_ACTION, mainMenu);
bot.on("message", mainMenu);
bot.launch();
