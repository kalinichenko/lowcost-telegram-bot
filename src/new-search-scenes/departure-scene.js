import { size, head, get } from "lodash";
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

import { getAirports } from "../db/airports";
import { DEPARTURE_SCENE, ARRIVAL_SCENE } from "../scenes";

export const departureScene = new Scene(DEPARTURE_SCENE);

departureScene.enter(ctx => {
  ctx.session.searchParams = null;
  ctx.reply("Type the airport of departure", {
    // reply_markup: {
    //   keyboard: [["◀️ back"]],
    //   resize_keyboard: true,
    //   one_time_keyboard: true
    // }
  });
});

// departureScene.hears("◀️ back", ctx => {
//   ctx.scene.leave(DEPARTURE_SCENE);
// });

departureScene.on("message", async ctx => {
  const msg = ctx.message.text;

  // console.log(msg);
  const airports = await getAirports(msg);
  // console.log(airports);
  switch (size(airports)) {
    case 1: {
      const airport = head(airports);
      // console.log("airport", airport);
      ctx.session.searchParams = {
        departureIataCode: get(airport, "iataCode"),
        departureAirport: get(airport, "airportName")
      };

      ctx.scene.leave(DEPARTURE_SCENE);
      ctx.scene.enter(ARRIVAL_SCENE);
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
