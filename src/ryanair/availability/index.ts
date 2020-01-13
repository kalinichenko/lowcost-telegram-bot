const dayjs = require("dayjs");
import { minBy, filter, reduce, get, isEmpty, head, find } from "lodash";

import { getCheapestFlightsForPeriod } from "./getCheapestFlightsForPeriod";
import { getCheapestFlights } from "./getCheapestFlights";
import { Trip, Flight } from "../../types";
import { Subscription } from "../../db/flightSubscriptions";

const DAY = 1000 * 3600 * 24;

const getCheapestTripWithDuration = ({
  inbounds,
  outbounds,
  durationMin,
  durationMax
}): Promise<Trip> => {
  const cheapestFlight = isEmpty(inbounds)
    ? { outbound: minBy(outbounds, "amount") }
    : reduce(
        outbounds,
        (acc: Trip, outbound: Flight) => {
          const minInboundTime = outbound.dateOut.getTime() + DAY * durationMin;
          const maxInboundTime =
            outbound.dateOut.getTime() + DAY * (durationMax + 1);

          // console.log(
          //   "minInboundTime:",
          //   minInboundTime,
          //   "maxInboundTime",
          //   maxInboundTime
          // );

          const possibleInbounds = filter(inbounds, inbound => {
            const inboundTime = new Date(inbound.departureTime).getTime();
            return (
              inboundTime >= minInboundTime && inboundTime < maxInboundTime
            );
          });
          // console.log("possibleInbounds:", possibleInbounds);

          const minAmount = get(minBy(possibleInbounds, "amount"), "amount");
          const amount = minAmount + outbound.amount;

          // console.log("minAmount", minAmount);

          if (!acc.amount || acc.amount > amount) {
            const inbound = find(inbounds, inbound => {
              const inboundTime = new Date(inbound.departureTime).getTime();
              return (
                inboundTime >= minInboundTime &&
                inboundTime < maxInboundTime &&
                inbound.amount === minAmount
              );
            });

            return {
              inbound,
              outbound,
              amount
            };
          }
          return acc;
        },
        {}
      );
  // console.log("getCheapestTripWithDuration:", cheapestFlight);
  return cheapestFlight;
};

export const getRyanairFlight = async (
  subscription: Subscription
): Promise<Trip> => {
  const {
    departureIataCode,
    arrivalIataCode,
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
  } = subscription;

  // console.log("getRyanairFlight", subscription);

  const outbounds = departureDateMax
    ? await getCheapestFlightsForPeriod({
        departureIataCode,
        arrivalIataCode,
        departureDateMin,
        departureDateMax,
        adults,
        teens,
        children,
        infants
      })
    : await getCheapestFlights({
        departureIataCode,
        arrivalIataCode,
        departureDate: departureDateMin,
        flexDays: 2,
        adults,
        teens,
        children,
        infants
      });

  if (!arrivalDateMin && !durationMin) {
    const outbound = departureDateMax
      ? minBy(outbounds, "amount")
      : head(outbounds);
    // console.log("outbound:", outbound);
    return {
      outbound,
      amount: outbound.amount
    };
  }

  const inboundDateMin =
    !arrivalDateMin && durationMin
      ? dayjs(departureDateMin)
          .add(durationMin, "day")
          .format("YYYY-MM-DD")
      : arrivalDateMin;

  // console.log("durationMin", durationMin, inboundDateMin);

  const inboundDateMax =
    !arrivalDateMax && (durationMin || durationMax)
      ? dayjs(departureDateMax || departureDateMin)
          .add(durationMax || durationMin, "day")
          .format("YYYY-MM-DD")
      : arrivalDateMax;

  // console.log("durationMax", durationMax, inboundDateMax);

  const inbounds = inboundDateMax
    ? await getCheapestFlightsForPeriod({
        departureIataCode: arrivalIataCode,
        arrivalIataCode: departureIataCode,
        departureDateMin: inboundDateMin,
        departureDateMax: inboundDateMax,
        adults,
        teens,
        children,
        infants
      })
    : await getCheapestFlights({
        departureIataCode: arrivalIataCode,
        arrivalIataCode: departureIataCode,
        departureDate: inboundDateMin,
        flexDays: 2,
        adults,
        teens,
        children,
        infants
      });


  if (durationMin) {
    // console.log("inbounds:", inbounds);
    return getCheapestTripWithDuration({
      inbounds: inboundDateMax ? inbounds : [head(inbounds)],
      outbounds: departureDateMax ? outbounds : [head(outbounds)],
      durationMin,
      durationMax
    });
  }

  const outbound = departureDateMax
    ? minBy(outbounds, "amount")
    : head(outbounds);
  const inbound = inboundDateMax ? minBy(inbounds, "amount") : head(inbounds);

  return {
    outbound,
    inbound,
    amount: outbound.amount + inbound.amount
  };
};
