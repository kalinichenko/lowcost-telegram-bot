const { includes, split } = require("lodash");
const Scene = require("telegraf/scenes/base");
const {
  ARRIVAL_DATE_SCENE,
  SEARCH_RESULT_SCENE,
  PASSENGERS_SCENE
} = require("../scenes");
const parseDateRange = require("../utils/parseDateRange");
const searchNowKeyboard = require("../keyboards/search-now-keyboard");
const { SEARCH_ACTION } = require("../actions");

const arrivalDateScene = new Scene(ARRIVAL_DATE_SCENE);

arrivalDateScene.action(SEARCH_ACTION, ctx => {
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

  if (includes(msg, ".")) {
    const [durationMin, durationMax] = split(msg, "-");
    ctx.session.searchParams = {
      ...ctx.session.searchParams,
      durationMin,
      durationMax
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
      arrivalDateMin,
      arrivalDateMax
    };
  }

  ctx.scene.leave(ARRIVAL_DATE_SCENE);
  ctx.scene.enter(PASSENGERS_SCENE);
});

module.exports = arrivalDateScene;
