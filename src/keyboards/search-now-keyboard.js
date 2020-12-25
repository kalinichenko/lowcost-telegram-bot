import { SEARCH_ACTION } from "../actions";
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

export const searchNowKeyboard = (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton(ctx.i18n.t("search-now"), SEARCH_ACTION),
  ]);
  return Extra.markup(keyboard);
};
