import { NEW_SEARCH_ACTION, SUBSCRIPTION_LIST_ACTION } from "../actions";
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

export const mainMenuKeyboard = (ctx) => {
  const keyboard = Markup.inlineKeyboard(
    [
      Markup.callbackButton(
        String.fromCodePoint(0x1f50d) + " " + ctx.i18n.t("new-search"),
        NEW_SEARCH_ACTION
      ),
      Markup.callbackButton(
        String.fromCodePoint(0x23f0) + " " + ctx.i18n.t("my-price-alerts"),
        SUBSCRIPTION_LIST_ACTION
      ),
    ],
    {
      wrap: () => true,
    }
  );

  return Extra.markup(keyboard);
};
