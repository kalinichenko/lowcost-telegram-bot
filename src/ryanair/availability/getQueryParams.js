const getQueryParams = ({
  origin,
  destination,
  departureDate,
  flexDays,
  arrivalDate,
  adults = 1,
  teens = 0,
  children = 0,
  infants = 0
}) => {
  const params = {
    ADT: adults,
    TEEN: teens,
    CHD: children,
    DateOut: departureDate,
    Destination: destination,
    Disc: 0,
    INF: infants,
    Origin: origin,
    RoundTrip: false,
    FlexDaysIn: flexDays,
    FlexDaysOut: flexDays,
    toUs: "AGREED",
    IncludeConnectingFlights: false
  };
  if (arrivalDate) {
    params.DateIn = arrivalDate;
    params.RoundTrip = true;
  }
  return params;
};

module.exports = getQueryParams;
