const dayjs = require("dayjs");

export default (date): string => date && dayjs(date).format("YYYY-MM-DD");
