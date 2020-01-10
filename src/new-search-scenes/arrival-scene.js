import { size, head, get } from "lodash";
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
import { ARRIVAL_SCENE, DEPARTURE_DATE_SCENE } from "../scenes";
import { getAirports } from "../db/airports";

export const arrivalScene = new Scene(ARRIVAL_SCENE);
arrivalScene.enter(ctx =>
  ctx.reply("Type the airport of arrival", {
    reply_markup: {
      remove_keyboard: true
      // keyboard: [["◀️ back"]],
      // resize_keyboard: true,
      // one_time_keyboard: true
    }
  })
);

// arrivalScene.hears("◀️ back", ctx => {
//   ctx.scene.leave("arrival");
//   ctx.scene.enter("search");
// });

arrivalScene.on("message", async ctx => {
  const msg = ctx.message.text;

  const airports = await getAirports(msg);
  switch (size(airports)) {
    case 1: {
      const airport = head(airports);
      ctx.session.searchParams = {
        ...ctx.session.searchParams,
        arrivalIataCode: get(airport, "iataCode"),
        arrivalAirport: get(airport, "airportName")
      };

      ctx.scene.leave(ARRIVAL_SCENE);
      ctx.scene.enter(DEPARTURE_DATE_SCENE);
      break;
    }
    case 0: {
      ctx.reply("I couldn't find it.");
      break;
    }
    default: {
      ctx.reply(
        "Which one?",
        Markup.keyboard(airports.map(o => o.airportName))
          .oneTime()
          .resize()
          .extra()
      );
      break;
    }
  }
});
