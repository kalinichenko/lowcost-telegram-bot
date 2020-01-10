import { SEARCH_ACTION } from "../actions";
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton("Search now", SEARCH_ACTION)
]);

export const searchNowKeyboard = Extra.markup(keyboard);
