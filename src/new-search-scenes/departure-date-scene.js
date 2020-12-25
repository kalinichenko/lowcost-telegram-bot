const Scene = require("telegraf/scenes/base");
import formatDate from "../utils/formatDate";
import { DEPARTURE_DATE_SCENE, ARRIVAL_DATE_SCENE } from "../scenes";
import { parseDateRange } from "../utils/parseDateRange";

export const departureDateScene = new Scene(DEPARTURE_DATE_SCENE);
departureDateScene.enter((ctx) =>
  ctx.replyWithHTML(ctx.i18n.t("type-departure-date"), {
    reply_markup: {
      remove_keyboard: true,
    },
  })
);

departureDateScene.on("message", async (ctx) => {
  const msg = ctx.message.text;
  const [departureDateMin, departureDateMax] = parseDateRange(msg);
  if (!departureDateMin) {
    ctx.reply(ctx.i18n.t("wrong-date-format"));
    return;
  }

  if (departureDateMax) {
    const days =
      (departureDateMax.getTime() - departureDateMin.getTime()) /
      (1000 * 3600 * 24);
    if (Math.abs(days) > 31) {
      ctx.reply(ctx.i18n.t("too-long-period"));
      return;
    }
  }
  ctx.session.searchParams = {
    ...ctx.session.searchParams,
    departureDateMin: formatDate(departureDateMin),
    departureDateMax: formatDate(departureDateMax),
  };

  ctx.scene.enter(ARRIVAL_DATE_SCENE);
});
