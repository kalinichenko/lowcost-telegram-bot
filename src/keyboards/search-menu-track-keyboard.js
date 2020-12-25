import {
  NEW_SEARCH_ACTION,
  MAIN_MENU_ACTION,
  CREATE_PRICE_ALERT_ACTION,
} from "../actions";
import { Markup, Extra } from "telegraf";

export const searchMenuTrackKeyboard = (ctx) => {
  const keyboard = Markup.inlineKeyboard(
    [
      Markup.callbackButton(ctx.i18n.t("main-menu"), MAIN_MENU_ACTION),
      Markup.callbackButton(
        String.fromCodePoint(0x1f50d) + ` ${ctx.i18n.t("new-search")}`,
        NEW_SEARCH_ACTION
      ),
      Markup.callbackButton(
        String.fromCodePoint(0x1f514) + ` ${ctx.i18n.t("create-price-alert")}`,
        CREATE_PRICE_ALERT_ACTION
      ),
    ],
    {
      wrap: () => true,
    }
  );

  return Extra.markup(keyboard);
};
