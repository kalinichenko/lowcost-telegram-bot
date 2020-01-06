const { SEARCH_ACTION } = require("../actions");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton("Search now", SEARCH_ACTION)
]);

module.exports = Extra.markup(keyboard);
