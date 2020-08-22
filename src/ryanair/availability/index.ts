const dayjs = require("dayjs");
import { minBy, filter, reduce, get, isEmpty, head, find } from "lodash";

import { getCheapestFlightsForPeriod } from "./getCheapestFlightsForPeriod";
import { getCheapestFlights } from "./getCheapestFlights";
import { Trip, Flight } from "../../types";
import { Subscription } from "../../db/flightSubscriptions";
import { logger } from "../../logger";

const DAY = 1000 * 3600 * 24;

const getCheapestTripWithDuration = ({
  inbounds,
  outbounds,
  durationMin,
  durationMax,
}): Promise<Trip> => {
  const cheapestFlight = isEmpty(inbounds)
    ? { outbound: minBy(outbounds, "amount") }
    : reduce(
        outbounds,
        (acc: Trip, outbound: Flight) => {
          const minInboundTime = outbound.dateOut.getTime() + DAY * durationMin;
          const maxInboundTime =
            outbound.dateOut.getTime() +
            DAY * ((durationMax || durationMin) + 1);

          const possibleInbounds = filter(inbounds, (inbound) => {
            const inboundTime = new Date(inbound.departureTime).getTime();
            return (
              inboundTime >= minInboundTime && inboundTime < maxInboundTime
            );
          });

          const minAmount = get(minBy(possibleInbounds, "amount"), "amount");
          const amount = (minAmount + outbound.amount).toFixed(2);

          if (!acc.amount || acc.amount > amount) {
            const inbound = find(inbounds, (inbound) => {
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
              amount,
            };
          }
          return acc;
        },
        {}
      );
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
    infants,
  } = subscription;

  logger.debug("requesting flights with parameters: %o", subscription);

  const outbounds = departureDateMax
    ? await getCheapestFlightsForPeriod({
        departureIataCode,
        arrivalIataCode,
        departureDateMin,
        departureDateMax,
        adults,
        teens,
        children,
        infants,
      })
    : await getCheapestFlights({
        departureIataCode,
        arrivalIataCode,
        departureDate: departureDateMin,
        flexDays: 2,
        adults,
        teens,
        children,
        infants,
      });

  if (!arrivalDateMin && !durationMin) {
    const outbound = departureDateMax
      ? minBy(outbounds, "amount")
      : head(outbounds);
    const trip = {
      outbound,
      amount: outbound.amount,
    };
    logger.debug("trip: %o", trip);
    return trip;
  }

  const inboundDateMin =
    !arrivalDateMin && durationMin
      ? dayjs(departureDateMin).add(durationMin, "day").format("YYYY-MM-DD")
      : arrivalDateMin;

  if (inboundDateMin) {
    logger.trace("inboundDateMin: %s", inboundDateMin);
  }

  const inboundDateMax =
    !arrivalDateMax && (durationMax || (departureDateMax && durationMin))
      ? dayjs(departureDateMax || departureDateMin)
          .add(durationMax || durationMin, "day")
          .format("YYYY-MM-DD")
      : arrivalDateMax;

  if (inboundDateMax) {
    logger.debug("inboundDateMax: %s", inboundDateMax);
  }

  const inbounds = inboundDateMax
    ? await getCheapestFlightsForPeriod({
        departureIataCode: arrivalIataCode,
        arrivalIataCode: departureIataCode,
        departureDateMin: inboundDateMin,
        departureDateMax: inboundDateMax,
        adults,
        teens,
        children,
        infants,
      })
    : await getCheapestFlights({
        departureIataCode: arrivalIataCode,
        arrivalIataCode: departureIataCode,
        departureDate: inboundDateMin,
        flexDays: 2,
        adults,
        teens,
        children,
        infants,
      });

  if (departureDateMax || durationMax) {
    const trip = getCheapestTripWithDuration({
      outbounds: departureDateMax ? outbounds : [head(outbounds)],
      inbounds: inboundDateMax ? inbounds : [head(inbounds)],
      durationMin,
      durationMax,
    });
    logger.debug("trip:", trip);
    return trip;
  }

  const outbound = departureDateMax
    ? minBy(outbounds, "amount")
    : head(outbounds);
  const inbound = inboundDateMax ? minBy(inbounds, "amount") : head(inbounds);

  const trip = {
    outbound,
    inbound,
    amount: (outbound.amount + inbound.amount).toFixed(2),
  };

  logger.debug("trip:", trip);
  return trip;
};
