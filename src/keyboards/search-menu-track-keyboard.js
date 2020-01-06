const {
  NEW_SEARCH_ACTION,
  MAIN_MENU_ACTION,
  CREATE_PRICE_ALERT
} = require("../actions");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const keyboard = Markup.inlineKeyboard(
  [
    Markup.callbackButton("Main menu", MAIN_MENU_ACTION),
    Markup.callbackButton(
      String.fromCodePoint(0x1f50d) + " New search",
      NEW_SEARCH_ACTION
    ),
    Markup.callbackButton(
      String.fromCodePoint(0x1f514) + " Create price alert",
      CREATE_PRICE_ALERT
    )
  ],
  {
    wrap: () => true
  }
);

module.exports = Extra.markup(keyboard);
