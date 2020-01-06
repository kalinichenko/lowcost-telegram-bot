const Scene = require("telegraf/scenes/base");
const { SEARCH_ACTION } = require("../actions");
const { PASSENGERS_SCENE, SEARCH_RESULT_SCENE } = require("../scenes");
const searchNowKeyboard = require("../keyboards/search-now-keyboard");

const passengersScene = new Scene(PASSENGERS_SCENE);

passengersScene.enter(ctx => {
  ctx.replyWithHTML(
    "Type the number of adults/teens/children/infants\n" +
      "e.g: <b>3/2/1</b>\n" +
      "or simply click the button\n",
    searchNowKeyboard
  );
});

passengersScene.action(SEARCH_ACTION, ctx => {
  ctx.session.searchParams = {
    ...ctx.session.searchParams,
    adults: 1
  };

  ctx.scene.leave(PASSENGERS_SCENE);
  ctx.scene.enter(SEARCH_RESULT_SCENE);
});

passengersScene.on("message", async ctx => {
  const msg = ctx.message.text;
  const [adults, teens, children, infants] = msg.split("/");

  ctx.session.searchParams = {
    ...ctx.session.searchParams,
    adults,
    teens,
    children,
    infants
  };

  ctx.scene.leave(PASSENGERS_SCENE);
  ctx.scene.enter(SEARCH_RESULT_SCENE);
});

module.exports = passengersScene;
