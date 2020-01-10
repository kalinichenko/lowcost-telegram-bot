import {
  NEW_SEARCH_ACTION,
  MAIN_MENU_ACTION,
  CREATE_PRICE_ALERT_ACTION
} from "../actions";
import { Markup, Extra } from "telegraf";

const keyboard = Markup.inlineKeyboard(
  [
    Markup.callbackButton("Main menu", MAIN_MENU_ACTION),
    Markup.callbackButton(
      String.fromCodePoint(0x1f50d) + " New search",
      NEW_SEARCH_ACTION
    ),
    Markup.callbackButton(
      String.fromCodePoint(0x1f514) + " Create price alert",
      CREATE_PRICE_ALERT_ACTION
    )
  ],
  {
    wrap: () => true
  }
);

export const searchMenuTrackKeyboard = Extra.markup(keyboard);
