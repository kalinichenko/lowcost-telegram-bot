require("dotenv").config();
const express = require("express");
import { scanFlights } from "./flights";
import { bot } from "./bot";
import { logger } from "./logger";

const { APP_URL, PORT, TELEGRAM_TOKEN } = process.env;

const app = express();

bot.telegram.setWebhook(`${APP_URL}/bot${TELEGRAM_TOKEN}`);

app.use(bot.webhookCallback(`/bot${TELEGRAM_TOKEN}`));

app.get(`/flights`, async (_, res) => {
  try {
    await scanFlights();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500, "Refresh flights failed");
  }
});

app.get(`/`, (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  logger.info(`Express server is listening on ${PORT}`);
});
