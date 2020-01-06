const dayjs = require("dayjs");
const { flatten, sortBy, uniqBy } = require("lodash");
const getCheapestFlights = require("./getCheapestFlights");

const DAY = 1000 * 3600 * 24;
const MAX_FLEX_DAYS = 6;

const scanPrices = (departureDateMin, departureDateMax) => {
  const res = [];
  const max = new Date(departureDateMax).getTime();
  let current = new Date(departureDateMin).getTime();
  while (max > current) {
    const flexDays = Math.ceil(Math.min((max - current) / DAY, MAX_FLEX_DAYS));
    const departureDate = dayjs(current).format("YYYY-MM-DD");
    res.push({
      departureDate,
      flexDays
    });
    console.log(departureDate, flexDays);
    current = current + flexDays * DAY;
  }
  return res;
};

const getCheapestFlightForPeriod = ({
  origin,
  destination,
  departureDateMin,
  departureDateMax,
  adults,
  teens,
  children,
  infants
}) =>
  Promise.all(
    scanPrices(departureDateMin, departureDateMax).map(
      async ({ departureDate, flexDays }) => {
        return await getCheapestFlights({
          origin,
          destination,
          departureDate,
          flexDays,
          adults,
          teens,
          children,
          infants
        });
      }
    )
  )
    .then(flatten)
    .then(res => uniqBy(res, o => o.dateOut))
    .then(res => sortBy(res, o => new Date(o.dateOut).getTime()));

module.exports = getCheapestFlightForPeriod;
