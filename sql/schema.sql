DROP TABLE IF EXISTS flight_prices;
DROP TABLE IF EXISTS flight_subscriptions;
DROP TABLE IF EXISTS airports;


CREATE TABLE airports (
  iata_code char(3) PRIMARY KEY,
  airport_name varchar(36) NOT NULL,
  city_name varchar(36) NOT NULL,
  country_name varchar(36) NOT NULL
);

CREATE TABLE flight_subscriptions (
  id SERIAL PRIMARY KEY,
  chat_id bigint NOT NULL,
  departure_iata_code char(3) REFERENCES airports(iata_code),
  arrival_iata_code char(3) REFERENCES airports(iata_code),
  departure_date_min date NOT NULL,
  departure_date_max date,
  arrival_date_min date,
  arrival_date_max date,
  duration_min smallint,
  duration_max smallint,
  adults smallint DEFAULT 1,
  teens smallint DEFAULT 0,
  children smallint DEFAULT 0,
  infants smallint DEFAULT 0
);

CREATE TABLE flight_prices (
  subscription_id integer REFERENCES flight_subscriptions (id) PRIMARY KEY,
  price numeric(6,2) NOT NULL
);
