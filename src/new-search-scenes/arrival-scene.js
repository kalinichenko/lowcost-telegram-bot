import { size, head, get } from "lodash";
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
import { ARRIVAL_SCENE, DEPARTURE_DATE_SCENE } from "../scenes";
import { getArrivalAirport } from "../ryanair/routes";

export const arrivalScene = new Scene(ARRIVAL_SCENE);

arrivalScene.enter(ctx =>
  ctx.replyWithHTML("Type the <b>arrival</b> airport name", {
    reply_markup: {
      remove_keyboard: true
    }
  })
);

arrivalScene.on("message", async ctx => {
  const msg = ctx.message.text;
  const { departureIataCode } = ctx.session.searchParams;

  const airports = await getArrivalAirport(departureIataCode, msg);
  switch (size(airports)) {
    case 1: {
      const airport = head(airports);
      ctx.session.searchParams = {
        ...ctx.session.searchParams,
        arrivalIataCode: get(airport, "iataCode"),
        arrivalAirport: get(airport, "airportName")
      };

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
