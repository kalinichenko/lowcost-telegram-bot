import { includes, split, parseInt } from "lodash";
import formatDate from "../utils/formatDate";
const Scene = require("telegraf/scenes/base");
import { ARRIVAL_DATE_SCENE, PASSENGERS_SCENE } from "../scenes";
import { parseDateRange } from "../utils/parseDateRange";
import { searchNowKeyboard } from "../keyboards/search-now-keyboard";

export const arrivalDateScene = new Scene(ARRIVAL_DATE_SCENE);

arrivalDateScene.enter((ctx) =>
  ctx.replyWithHTML(
    "Enter an <b>arival date</b> or a period\n" +
      "(e.g 29.02 or 29.02-07.03)\n" +
      "or a trip duration or a range\n" +
      "(e.g 7 or 7-14)\n" +
      "or click Search Now button for <b>one way trip</b>",
    searchNowKeyboard
  )
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
      ctx.reply("Wrong date format");
      return;
    }

    if (arrivalDateMax) {
      const days =
        (arrivalDateMax.getTime() - arrivalDateMin.getTime()) /
        (1000 * 3600 * 24);
      if (Math.abs(days) > 18) {
        ctx.reply("Entered date range is too big");
        return;
      }
    }
    ctx.session.searchParams = {
      ...ctx.session.searchParams,
      arrivalDateMin: formatDate(arrivalDapteMin),
      arrivalDateMax: formatDate(arrivalDateMax),
    };
  }

  ctx.scene.enter(PASSENGERS_SCENE);
});
