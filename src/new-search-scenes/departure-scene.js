import { size, head } from "lodash";
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

import { getAirportsByNameOrIata } from "../providers";
import { DEPARTURE_SCENE, ARRIVAL_SCENE } from "../scenes";

export const departureScene = new Scene(DEPARTURE_SCENE);

departureScene.enter((ctx) => {
  ctx.session.searchParams = null;
  ctx.replyWithHTML("Type the <b>departure</b> airport name");
});

departureScene.on("message", async (ctx) => {
  const msg = ctx.message.text;
  const airports = await getAirportsByNameOrIata(msg);

  switch (size(airports)) {
    case 1: {
      const airport = head(airports);
      ctx.session.searchParams = {
        departureIataCode: airport?.iataCode,
        departureAirport: airport?.airportName,
      };

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
        Markup.keyboard(airports.map((o) => `${o.airportName} (${o.iataCode})`))
          .oneTime()
          .resize()
          .extra()
      );
      break;
    }
  }
});
