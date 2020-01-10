const Scene = require("telegraf/scenes/base");
import formatDate from "../utils/formatDate";
import { DEPARTURE_DATE_SCENE, ARRIVAL_DATE_SCENE } from "../scenes";
import { parseDateRange } from "../utils/parseDateRange";

export const departureDateScene = new Scene(DEPARTURE_DATE_SCENE);
departureDateScene.enter(ctx =>
  ctx.reply(
    "Enter departure date or range of dates (e.g 29.02 or 29.02-07.03)",
    {
      reply_markup: {
        remove_keyboard: true
        //   keyboard: [["◀️ back"]],
        //   resize_keyboard: true,
        //   one_time_keyboard: true
      }
    }
  )
);

// arrivalScene.hears("◀️ back", ctx => {
//   ctx.scene.leave("arrival");
//   ctx.scene.enter("search");
// });

departureDateScene.on("message", async ctx => {
  const msg = ctx.message.text;
  const [departureDateMin, departureDateMax] = parseDateRange(msg);
  if (!departureDateMin) {
    ctx.reply("Wrong date format");
    return;
  }

  if (departureDateMax) {
    const days =
      (departureDateMax.getTime() - departureDateMin.getTime()) /
      (1000 * 3600 * 24);
    if (Math.abs(days) > 31) {
      ctx.reply("Entered date range is too big");
      return;
    }
  }
  ctx.session.searchParams = {
    ...ctx.session.searchParams,
    departureDateMin: formatDate(departureDateMin),
    departureDateMax: formatDate(departureDateMax)
  };
  ctx.scene.leave(DEPARTURE_DATE_SCENE);
  ctx.scene.enter(ARRIVAL_DATE_SCENE);
});
