DROP TABLE IF EXISTS flight_subscriptions;

CREATE TABLE flight_subscriptions (
  id SERIAL PRIMARY KEY,
  chat_id bigint NOT NULL,
  departure_iata_code char(3),
  arrival_iata_code char(3),
  departure_date_min date NOT NULL,
  departure_date_max date,
  arrival_date_min date,
  arrival_date_max date,
  duration_min smallint,
  duration_max smallint,
  adults smallint DEFAULT 1,
  teens smallint DEFAULT 0,
  children smallint DEFAULT 0,
  infants smallint DEFAULT 0,
  price numeric(6,2),
  updated_at timestamp,
  locale char(2)
);


