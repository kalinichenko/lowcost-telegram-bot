export interface Flight {
  amount: number;
  departureTime: Date;
  arrivalTime: Date;
  departureIataCode: string;
  arrivalIataCode: string;
  dateOut: Date;
}

export interface Trip {
  inbound?: Flight;
  outbound: Flight;
  amount: number;
}

export interface SearchRequest {
  departureIataCode: string;
  arrivalIataCode: string;
  departureDateMin: Date;
  departureDateMax?: Date;
  arrivalDateMin?: Date;
  arrivalDateMax?: Date;
  durationMin?: number;
  durationMax?: number;
  adults?: number;
  teens?: number;
  children?: number;
  infants?: number;
}
