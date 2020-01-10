export const getQueryParams = ({
  departureIataCode,
  arrivalIataCode,
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
    Destination: arrivalIataCode,
    Disc: 0,
    INF: infants,
    Origin: departureIataCode,
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
