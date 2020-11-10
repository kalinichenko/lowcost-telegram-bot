import { Airport } from "../types";

export const findAirports = (
  searchAirport: string,
  airports: Airport[]
): Airport[] => {
  const lowedCased = searchAirport?.toLowerCase();
  return airports?.filter(({ fullName }) => {
    return fullName.toLowerCase().includes(lowedCased);
  });
};
