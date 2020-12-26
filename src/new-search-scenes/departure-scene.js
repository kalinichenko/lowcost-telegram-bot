import { size, head } from "lodash";
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

import { findDepartureAirports } from "../providers";
import { DEPARTURE_SCENE, ARRIVAL_SCENE } from "../scenes";

export const departureScene = new Scene(DEPARTURE_SCENE);

departureScene.enter((ctx) => {
  ctx.session.searchParams = null;
  ctx.replyWithHTML(ctx.i18n.t("type-departure-airport"));
});

departureScene.on("message", async (ctx) => {
  const msg = ctx.message.text;
  const airports = await findDepartureAirports(msg, ctx.i18n.locale());

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
      ctx.reply(ctx.i18n.t("airport-not-found"));
      break;
    }
    default: {
      ctx.reply(
        ctx.i18n.t("which-one"),
        Markup.keyboard(airports.map((o) => `${o.airportName} (${o.iataCode})`))
          .oneTime()
          .resize()
          .extra()
      );
      break;
    }
  }
});
