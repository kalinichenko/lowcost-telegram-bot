const Scene = require("telegraf/scenes/base");
import { SEARCH_ACTION } from "../actions";
import { PASSENGERS_SCENE, SEARCH_RESULT_SCENE } from "../scenes";

const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const searchNowKeyboard = (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton(ctx.i18n.t("search-now"), SEARCH_ACTION),
  ]);
  return Extra.markup(keyboard);
};

export const passengersScene = new Scene(PASSENGERS_SCENE);

passengersScene.enter((ctx) => {
  ctx.replyWithHTML(ctx.i18n.t("type-passengers"), searchNowKeyboard(ctx));
});

passengersScene.action(SEARCH_ACTION, (ctx) => {
  ctx.session.searchParams = {
    ...ctx.session.searchParams,
    adults: 1,
  };

  ctx.scene.enter(SEARCH_RESULT_SCENE);
});

passengersScene.on("message", async (ctx) => {
  const msg = ctx.message.text;
  const [adults, teens, children, infants] = msg.split("/");

  ctx.session.searchParams = {
    ...ctx.session.searchParams,
    adults,
    teens,
    children,
    infants,
  };

  ctx.scene.enter(SEARCH_RESULT_SCENE);
});
