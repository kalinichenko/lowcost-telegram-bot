import { NEW_SEARCH_ACTION } from "../actions";
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

export const newSearchKeyboard = (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton(
      String.fromCodePoint(0x1f50d) + ` ${ctx.i18n.t("new-search")}`,
      NEW_SEARCH_ACTION
    ),
  ]);

  return Extra.markup(keyboard);
};
