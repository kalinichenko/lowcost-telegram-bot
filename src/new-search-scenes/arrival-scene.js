import { size, head, get } from "lodash";
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
import { ARRIVAL_SCENE, DEPARTURE_DATE_SCENE } from "../scenes";
import { findArrivalAirports } from "../providers";

export const arrivalScene = new Scene(ARRIVAL_SCENE);

arrivalScene.enter((ctx) =>
  ctx.replyWithHTML(ctx.i18n.t("type-arrival-airport"), {
    reply_markup: {
      remove_keyboard: true,
    },
  })
);

arrivalScene.on("message", async (ctx) => {
  const msg = ctx.message.text;
  const { departureIataCode } = ctx.session.searchParams;

  const airports = await findArrivalAirports(
    departureIataCode,
    msg,
    ctx.i18n.locale()
  );
  switch (size(airports)) {
    case 1: {
      const airport = head(airports);
      ctx.session.searchParams = {
        ...ctx.session.searchParams,
        arrivalIataCode: get(airport, "iataCode"),
        arrivalAirport: get(airport, "airportName"),
      };

      ctx.scene.enter(DEPARTURE_DATE_SCENE);
      break;
    }
    case 0: {
      ctx.reply(ctx.i18n.t("airport-not-found"));
      break;
    }
    default: {
      ctx.reply(
        ctx.i18n.t("which-one"),
        Markup.keyboard(airports.map((o) => o.fullName))
          .oneTime()
          .resize()
          .extra()
      );
      break;
    }
  }
});
