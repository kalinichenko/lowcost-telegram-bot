const { isNaN } = require("lodash");

const MM = new Date().getMonth();
const YYYY = new Date().getFullYear();

const parseDate = ddmm => {
  if (!ddmm) {
    return null;
  }
  const [dd, mm] = ddmm.split(".");
  const month = parseInt(mm, 10);
  const date = parseInt(dd, 10);

  if (
    isNaN(date) ||
    isNaN(month) ||
    month > 12 ||
    month <= 0 ||
    date <= 0 ||
    date > 31
  ) {
    return null;
  }

  return new Date(month - 1 >= MM ? YYYY : YYYY + 1, month - 1, date);
};

const parseDateRange = dateRange => {
  const [dateMin, dateMax] = dateRange.split("-");
  return [parseDate(dateMin), parseDate(dateMax)];
};

module.exports = parseDateRange;
