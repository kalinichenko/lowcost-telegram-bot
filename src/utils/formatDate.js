const dayjs = require("dayjs");

export default date => date && dayjs(date).format("YYYY-MM-DD");
