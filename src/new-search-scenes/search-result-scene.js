const { get } = require("lodash");
const Scene = require("telegraf/scenes/base");
const { SEARCH_RESULT_SCENE, DEPARTURE_SCENE } = require("../scenes");
const getRyanairFlight = require("../ryanair/availability");
const getRyanairUrl = require("../ryanair/availability/getUrl");

const flightFormatter = require("../utils/flightFormatter");
const formatDate = require("../utils/formatDate");
const { MAIN_MENU_ACTION } = require("../actions");

const searchMenuTrackKeyboard = require("../keyboards/search-menu-track-keyboard");
const newSearchKeyboard = require("../keyboards/new-search-keyboard");

const searchResultScene = new Scene(SEARCH_RESULT_SCENE);

searchResultScene.action(MAIN_MENU_ACTION, ctx =>
  ctx.scene.leave(SEARCH_RESULT_SCENE)
);

searchResultScene.enter(async ctx => {
  const {
    departureCode: origin,
    arrivalCode: destination,
    departureDateMin,
    departureDateMax,
    arrivalDateMin,
    arrivalDateMax,
    adults,
    teens,
    children,
    infants
  } = ctx.session.searchParams;
  console.log("context: ", ctx.session.searchParams);
  // ctx.reply("Loading results from...", {
  // reply_markup: {
  //   keyboard: [["One way"]],
  //   resize_keyboard: true,
  //   one_time_keyboard: true
  // }
  // });

  const cheapestFlight = await getRyanairFlight({
    origin,
    destination,
    departureDateMin: formatDate(departureDateMin),
    departureDateMax: formatDate(departureDateMax),
    arrivalDateMin: formatDate(arrivalDateMin),
    arrivalDateMax: formatDate(arrivalDateMax),
    adults,
    teens,
    children,
    infants
  });

  console.log("cheapestFlight", cheapestFlight);

  if (arrivalDateMin) {
    return await replyWithRoundTripMessage(
      ctx,
      get(cheapestFlight, "outbound"),
      get(cheapestFlight, "inbound")
    );
  } else {
    return await replyWithOneWayTripMessage(
      ctx,
      get(cheapestFlight, "outbound")
    );
  }
});

// arrivalScene.hears("◀️ back", ctx => {
//   ctx.scene.leave("arrival");
//   ctx.scene.enter("search");
// });

const replyWithOneWayTripMessage = async (ctx, outbound) => {
  if (!outbound) {
    return ctx.replyWithHTML("No flight found", newSearchKeyboard);
  }

  const url = getRyanairUrl({
    ...outbound,
    arrivalTime: null
  });

  const msg =
    `${await flightFormatter(outbound)}\n` +
    `Buy ticket <a href="${url}">here</>\n`;

  return ctx.replyWithHTML(msg, searchMenuTrackKeyboard);
};

const replyWithRoundTripMessage = async (ctx, outbound, inbound) => {
  if (!outbound && !inbound) {
    return ctx.replyWithHTML("No flights found", newSearchKeyboard);
  }

  let urlParams;
  if (outbound && inbound) {
    urlParams = {
      ...outbound,
      arrivalTime: get(inbound, "departureTime")
    };
  } else if (outbound && !inbound) {
    urlParams = {
      ...outbound,
      arrivalTime: null
    };
  } else {
    urlParams = {
      ...inbound,
      arrivalTime: null
    };
  }

  const url = getRyanairUrl(urlParams);

  const msg =
    `${
      outbound ? await flightFormatter(outbound) : "No inbound flight found.\n"
    }\n` +
    `${
      inbound ? await flightFormatter(inbound) : "No inbound flight found.\n"
    }` +
    `Buy tickets <a href="${url}">here</>\n`;

  return ctx.replyWithHTML(msg, searchMenuTrackKeyboard);
};

searchResultScene.hears("New search", ctx => {
  ctx.scene.leave(SEARCH_RESULT_SCENE);
  ctx.scene.enter(DEPARTURE_SCENE);
});

module.exports = searchResultScene;
