import { NEW_SEARCH_ACTION } from "../actions";
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton(
    String.fromCodePoint(0x1f50d) + " New search",
    NEW_SEARCH_ACTION
  )
]);

export const newSearchKeyboard = Extra.markup(keyboard);
