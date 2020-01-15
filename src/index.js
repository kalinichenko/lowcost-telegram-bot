const Telegraf = require("telegraf");
const express = require("express");

const port = process.env.PORT;
const TOKEN = process.env.TELEGRAM_TOKEN;
const url = process.env.APP_URL;

const bot = new Telegraf(TOKEN);
// Set the bot response
bot.on("text", ({ replyWithHTML }) => replyWithHTML("<b>Hello</b>"));

// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook(`${url}/secret-path`);

const app = express();
app.get("/", (req, res) => res.send("Hello World!"));
// Set the bot API endpoint
app.use(bot.webhookCallback("/secret-path"));
app.listen(port, () => {
  console.log("Example app listening on port 3000!");
});

// No need to call bot.launch()
