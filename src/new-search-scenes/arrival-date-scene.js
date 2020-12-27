import { includes, split, parseInt } from "lodash";
import formatDate from "../utils/formatDate";
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
import { ARRIVAL_DATE_SCENE, PASSENGERS_SCENE } from "../scenes";
import { ONE_WAY_ACTION } from "../actions";
import { parseDateRange } from "../utils/parseDateRange";

export const arrivalDateScene = new Scene(ARRIVAL_DATE_SCENE);

const oneWayKeyboard = (ctx) => {
  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton(ctx.i18n.t("one-way"), ONE_WAY_ACTION),
  ]);
  return Extra.markup(keyboard);
};

arrivalDateScene.enter((ctx) =>
  ctx.replyWithHTML(ctx.i18n.t("type-arrival-date"), oneWayKeyboard(ctx))
);

arrivalDateScene.on("message", async (ctx) => {
  const msg = ctx.message.text;

  if (!includes(msg, ".")) {
    const [durationMin, durationMax] = split(msg, "-");
    ctx.session.searchParams = {
      ...ctx.session.searchParams,
      durationMin: durationMin && parseInt(durationMin, 10),
      durationMax: durationMax && parseInt(durationMax, 10),
    };
  } else {
    const [arrivalDateMin, arrivalDateMax] = parseDateRange(msg);

    if (!arrivalDateMin) {
      ctx.reply(ctx.i18n.t("wrong-date-format"));
      return;
    }

    if (arrivalDateMax) {
      const days =
        (arrivalDateMax.getTime() - arrivalDateMin.getTime()) /
        (1000 * 3600 * 24);
      if (Math.abs(days) > 18) {
        ctx.reply(ctx.i18n.t("too-long-period"));
        return;
      }
    }
    ctx.session.searchParams = {
      ...ctx.session.searchParams,
      arrivalDateMin: formatDate(arrivalDateMin),
      arrivalDateMax: formatDate(arrivalDateMax),
    };
  }

  ctx.scene.enter(PASSENGERS_SCENE);
});
