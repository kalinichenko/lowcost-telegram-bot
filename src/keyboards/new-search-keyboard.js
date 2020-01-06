const { NEW_SEARCH_ACTION } = require("../actions");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton(
    String.fromCodePoint(0x1f50d) + " New search",
    NEW_SEARCH_ACTION
  )
]);

module.exports = Extra.markup(keyboard);
