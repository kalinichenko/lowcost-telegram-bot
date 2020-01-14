DROP TABLE IF EXISTS flight_prices;

ALTER TABLE flight_subscriptions ADD COLUMN price numeric(6,2);
ALTER TABLE flight_subscriptions ADD COLUMN updated_at timestamp;
