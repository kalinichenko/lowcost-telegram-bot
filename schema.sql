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
  origin char(3) REFERENCES airports(iata_code),
  destination char(3) REFERENCES airports(iata_code),
  departure_date_min date NOT NULL,
  departure_date_max date,
  duration_min smallint NOT NULL,
  duration_max smallint
);

CREATE TABLE flight_prices (
  subscription_id integer REFERENCES flight_subscriptions (id),
  operator varchar NOT NULL,
  out_date timestamp NOT NULL,
  in_date timestamp NOT NULL,
  price numeric(6,2) NOT NULL,
  PRIMARY KEY (subscription_id, operator)
);
