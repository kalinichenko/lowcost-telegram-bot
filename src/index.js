require("dotenv").config();
const express = require("express");
import { scanFlights } from "./flights";
import { bot } from "./bot";

const url = process.env.APP_URL;

const port = process.env.PORT;
const TOKEN = process.env.TELEGRAM_TOKEN;
const app = express();

bot.telegram.setWebhook(`${url}/bot${TOKEN}`);

app.use(bot.webhookCallback(`/bot${TOKEN}`));
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
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});
// getRyanairFlight({
//   origin: "SXF",
//   destination: "KBP",
//   departureDateMin: "2020-02-01",
//   departureDateMax: "2020-02-10",
//   arrivalDateMin: "2020-02-20",
//   arrivalDateMax: "2020-02-27"
// });
