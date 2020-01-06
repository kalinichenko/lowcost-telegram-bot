process.env.NTBA_FIX_319 = 1;
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const TOKEN = process.env.TELEGRAM_TOKEN;
const newSearchKeyboard = require("./keyboards/new-search-keyboard");

const {
  departureScene,
  arrivalScene,
  departureDateScene,
  arrivalDateScene,
  searchResultScene,
  passengersScene
} = require("./new-search-scenes");
const {
  DEPARTURE_SCENE,
  ARRIVAL_DATE_SCENE,
  SEARCH_RESULT_SCENE
} = require("./scenes");
const { NEW_SEARCH_ACTION, MAIN_MENU_ACTION } = require("./actions");
const { SEARCH_COMMAND } = require("./commands");

const url = process.env.APP_URL || "https://ryanair-price-hunter.herokuapp.com";

const bot = new Telegraf(TOKEN);
bot.telegram.setWebhook(`${url}/bot${TOKEN}`);

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

bot.command(SEARCH_COMMAND, ctx => ctx.scene.enter(DEPARTURE_SCENE));
bot.action(NEW_SEARCH_ACTION, ctx => ctx.scene.enter(DEPARTURE_SCENE));
bot.action("One way", ctx => {
  ctx.scene.leave(ARRIVAL_DATE_SCENE);
  ctx.scene.enter(SEARCH_RESULT_SCENE);
});

const mainMenu = ctx => {
  return ctx.reply("Welcome to Ryanair bot.", newSearchKeyboard);
};

bot.action(MAIN_MENU_ACTION, mainMenu);
bot.on("message", mainMenu);
bot.launch();

module.exports = bot;
