const dayjs = require("dayjs");

module.exports = date => date && dayjs(date).format("YYYY-MM-DD");
