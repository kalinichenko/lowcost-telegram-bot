const dayjs = require("dayjs");
const { minBy, filter, reduce, get, isEmpty, head } = require("lodash");

const getCheapestFlightsForPeriod = require("./getCheapestFlightsForPeriod");
const getCheapestFlights = require("./getCheapestFlights");

const DAY = 1000 * 3600 * 24;

const getCheapestTripWithDuration = ({
  inbounds,
  outbounds,
  durationMin,
  durationMax
}) => {
  const cheapestFlight = isEmpty(inbounds)
    ? { outbound: minBy(outbounds, "amount") }
    : reduce(
        outbounds,
        (acc, outbound) => {
          const minInboundTime =
            new Date(outbound.dateOut).getTime() + DAY * durationMin;
          const maxInboundTime =
            new Date(outbound.dateOut).getTime() + DAY * (durationMax + 1);

          console.log(
            "minInboundTime:",
            minInboundTime,
            "maxInboundTime",
            maxInboundTime
          );

          const possibleInbounds = filter(inbounds, inbound => {
            const inboundTime = new Date(inbound.dateOut).getTime();
            return (
              inboundTime >= minInboundTime && inboundTime < maxInboundTime
            );
          });
          console.log("possibleInbounds:", possibleInbounds);

          const minAmount = get(minBy(possibleInbounds, "amount"), "amount");
          const tripAmount = minAmount + outbound.amount;

          console.log("minAmount", minAmount);

          if (!acc.tripAmount || acc.tripAmount > tripAmount) {
            const inbound = find(inbounds, inbound => {
              const inboundTime = new Date(inbound.dateOut).getTime();
              return (
                inboundTime >= minInboundTime &&
                inboundTime < maxInboundTime &&
                inbound.amount === minAmount
              );
            });

            return {
              inbound,
              outbound,
              tripAmount
            };
          }
          return acc;
        },
        {}
      );
  console.log("getCheapestTripWithDuration:", cheapestFlight);
  return cheapestFlight;
};

const getRyanairFlight = async ({
  origin,
  destination,
  departureDateMin,
  departureDateMax,
  arrivalDateMin,
  arrivalDateMax,
  durationMin,
  durationMax,
  adults,
  teens,
  children,
  infants
}) => {
  // console.log(
  //   origin,
  //   destination,
  //   departureDateMin,
  //   departureDateMax,
  //   arrivalDateMin,
  //   arrivalDateMax,
  //   durationMin,
  //   durationMax
  // );

  const outbounds = departureDateMax
    ? await getCheapestFlightsForPeriod({
        origin,
        destination,
        departureDateMin,
        departureDateMax,
        adults,
        teens,
        children,
        infants
      })
    : await getCheapestFlights({
        origin,
        destination,
        departureDate: departureDateMin,
        flexDays: 2,
        adults,
        teens,
        children,
        infants
      });

  console.log("outbounds:", outbounds);
  if (!arrivalDateMin && !durationMin) {
    return {
      outbound: departureDateMax ? minBy(outbounds, "amount") : head(outbounds)
    };
  }

  if (!arrivalDateMin && durationMin) {
    arrivalDateMin = dayjs(departureDateMin)
      .add(durationMin, "day")
      .format("YYYY-MM-DD");
  }
  if (!arrivalDateMax && (durationMin || durationMax)) {
    arrivalDateMax = dayjs(departureDateMin)
      .add(durationMax || durationMin, "day")
      .format("YYYY-MM-DD");
  }

  const inbounds = arrivalDateMax
    ? await getCheapestFlightsForPeriod({
        origin: destination,
        destination: origin,
        departureDateMin: arrivalDateMin,
        departureDateMax: arrivalDateMax,
        adults,
        teens,
        children,
        infants
      })
    : await getCheapestFlights({
        origin,
        destination,
        departureDate: arrivalDateMin,
        flexDays: 2,
        adults,
        teens,
        children,
        infants
      });

  console.log("inbounds:", inbounds);

  if (durationMin) {
    return getCheapestTripWithDuration({
      inbounds: arrivalDateMax ? inbounds : [head(inbounds)],
      outbounds: departureDateMax ? outbounds : [head(outbounds)],
      durationMin,
      durationMax
    });
  }
  return {
    outbound: departureDateMax ? minBy(outbounds, "amount") : head(outbounds),
    inbound: arrivalDateMax ? minBy(inbounds, "amount") : head(inbounds)
  };
};

module.exports = getRyanairFlight;
