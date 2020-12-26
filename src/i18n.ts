const path = require("path");

import "./locales/en.json";
import "./locales/ru.json";
const TelegrafI18n = require("telegraf-i18n");

export const i18n = new TelegrafI18n({
  defaultLanguage: "en",
  useSession: true,
  directory: path.resolve(__dirname, "locales"),
});
