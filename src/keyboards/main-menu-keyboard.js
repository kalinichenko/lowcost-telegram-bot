import { NEW_SEARCH_ACTION, SUBSCRIPTION_LIST_ACTION } from "../actions";
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const keyboard = Markup.inlineKeyboard(
  [
    Markup.callbackButton(
      String.fromCodePoint(0x1f50d) + " New search",
      NEW_SEARCH_ACTION
    ),
    Markup.callbackButton(
      String.fromCodePoint(0x23f0) + " My price alerts",
      SUBSCRIPTION_LIST_ACTION
    )
  ],
  {
    wrap: () => true
  }
);

export const mainMenuKeyboard = Extra.markup(keyboard);
