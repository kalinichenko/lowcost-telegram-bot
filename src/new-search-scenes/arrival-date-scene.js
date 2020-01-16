import { includes, split, parseInt } from "lodash";
import formatDate from "../utils/formatDate";
const Scene = require("telegraf/scenes/base");
import {
  ARRIVAL_DATE_SCENE,
  SEARCH_RESULT_SCENE,
  PASSENGERS_SCENE
} from "../scenes";
import { parseDateRange } from "../utils/parseDateRange";
import { searchNowKeyboard } from "../keyboards/search-now-keyboard";
import { SEARCH_ACTION } from "../actions";
import { logger } from "../logger";

export const arrivalDateScene = new Scene(ARRIVAL_DATE_SCENE);

arrivalDateScene.action(SEARCH_ACTION, ctx => {
  logger.debug("received SEARCH_ACTION action");
  ctx.scene.leave(ARRIVAL_DATE_SCENE);
  ctx.scene.enter(SEARCH_RESULT_SCENE);
});

arrivalDateScene.enter(ctx =>
  ctx.reply(
    "Enter arival date or range of dates (e.g 29.02 or 29.02-07.03)" +
      "or trip duration or its range (e.g 7 or 7-14)" +
      "or click Search Now button for one way trip",
    searchNowKeyboard
  )
);

// arrivalScene.hears("◀️ back", ctx => {
//   ctx.scene.leave("arrival");
//   ctx.scene.enter("search");
// });

arrivalDateScene.on("message", async ctx => {
  const msg = ctx.message.text;

  if (!includes(msg, ".")) {
    const [durationMin, durationMax] = split(msg, "-");
    ctx.session.searchParams = {
      ...ctx.session.searchParams,
      durationMin: durationMin && parseInt(durationMin, 10),
      durationMax: durationMax && parseInt(durationMax, 10)
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
      arrivalDateMin: formatDate(arrivalDateMin),
      arrivalDateMax: formatDate(arrivalDateMax)
    };
  }

  ctx.scene.leave(ARRIVAL_DATE_SCENE);
  ctx.scene.enter(PASSENGERS_SCENE);
});
