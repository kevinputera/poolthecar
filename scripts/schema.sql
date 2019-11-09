-- Drop all tables by dropping the `public` schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL PRIVILEGES ON SCHEMA public TO PUBLIC;

CREATE TYPE gender AS ENUM (
  'male', 
  'female', 
  'non binary'
);

CREATE TABLE Users (
  email varchar(255) PRIMARY KEY,
  secret char(64) NOT NULL, -- SHA256 hash of the account's password
  name varchar(255) NOT NULL,
  gender gender NOT NULL,
  phone varchar(50) NOT NULL,
  profile_photo_url varchar(1023) NOT NULL,
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE Bookmarks (
  email varchar(255) REFERENCES Users(email)
    ON DELETE CASCADE ON UPDATE CASCADE,
  name varchar(255),
  address varchar(255) NOT NULL,
  PRIMARY KEY (email, name)
);

CREATE TABLE Messages (
  mid serial PRIMARY KEY,
  sender varchar(255) REFERENCES Users(email) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  receiver varchar(255) REFERENCES Users(email)
    ON DELETE CASCADE ON UPDATE CASCADE,
  content varchar(255),
  sent_on timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE Drivers (
  email varchar(255) PRIMARY KEY REFERENCES Users(email)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Cars (
  license varchar(255) PRIMARY KEY,
  email varchar(255) REFERENCES Drivers(email)
    ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
  model varchar(255) NOT NULL,
  seats integer NOT NULL CHECK (seats > 0),
  manufactured_on integer NOT NULL
);

CREATE TYPE trip_status as ENUM (
  'created',
  'ongoing',
  'finished'
);

CREATE TABLE Trips (
  tid serial PRIMARY KEY,
  license varchar(255) NOT NULL REFERENCES Cars(license),
  status trip_status NOT NULL DEFAULT 'created',
  origin varchar(255) NOT NULL,
  seats integer NOT NULL CHECK (seats > 0),
  departing_on timestamptz NOT NULL,
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE Stops (
  min_price numeric NOT NULL DEFAULT 0 CHECK (min_price >= 0),
  address varchar(255),
  tid integer REFERENCES Trips(tid)
    ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY(tid, address)
);

CREATE TYPE bid_status AS ENUM (
  'won',
  'failed',
  'pending'
);

CREATE TABLE Bids (
  email varchar(255) REFERENCES Users(email),
  tid integer,
  address varchar(255),
  status bid_status NOT NULL DEFAULT 'pending',
  value numeric NOT NULL CHECK (value >= 0),
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (email, tid, address),
  FOREIGN KEY (tid, address) REFERENCES Stops(tid, address)
);

CREATE TABLE Reviews (
  email varchar(255) REFERENCES Users(email),
  tid integer REFERENCES Trips(tid),
  score numeric NOT NULL DEFAULT 5 CHECK (score >= 0 AND score <= 5),
  content text,
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (email, tid)
);

CREATE VIEW DriversCarsTrips (
  driver_email, car_license, car_model, car_seats, car_manufactured_on,
  trip_tid, trip_status, trip_origin, trip_seats, trip_departing_on,
  trip_created_on, trip_updated_on
) AS
  SELECT D.email, C.license, C.model, C.seats, C.manufactured_on,
    T.tid, T.status, T.origin, T.seats, T.departing_on,
    T.created_on, T.updated_on
  FROM Trips T
  JOIN Cars C ON T.license = C.license
  JOIN Drivers D ON C.email = D.email;

CREATE OR REPLACE FUNCTION no_trip_seats_more_than_car_seats()
RETURNS TRIGGER AS $$ DECLARE car_seats INTEGER;
BEGIN 
  SELECT C.seats
  INTO car_seats
  FROM Cars C
  WHERE C.license = NEW.license;
  IF NEW.seats <= car_seats 
    THEN RETURN NEW;
  ELSE  
    RAISE EXCEPTION 'trip seats more than car seats';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER no_trip_seats_more_than_car_seats_trigger
BEFORE INSERT OR UPDATE ON Trips
FOR EACH ROW
EXECUTE PROCEDURE no_trip_seats_more_than_car_seats();

CREATE OR REPLACE FUNCTION no_self_bid()
RETURNS TRIGGER AS $$ DECLARE driver_email varchar(255);
BEGIN 
  SELECT C.email
  INTO driver_email
  FROM Cars C JOIN Trips T ON C.license = T.license
  WHERE T.tid = NEW.tid;
  IF driver_email <> NEW.email  
    THEN RETURN NEW;
  ELSE  
    RAISE EXCEPTION 'Bid own trip';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER no_self_bid_trigger
BEFORE INSERT OR UPDATE ON Bids
FOR EACH ROW
EXECUTE PROCEDURE no_self_bid();

CREATE OR REPLACE FUNCTION no_self_message()
RETURNS TRIGGER AS $$ BEGIN 
  IF NEW.sender <> NEW.receiver
    THEN RETURN NEW;
  ELSE  
    RAISE EXCEPTION 'Messaged self';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER no_self_message_trigger
BEFORE INSERT OR UPDATE ON Messages
FOR EACH ROW
EXECUTE PROCEDURE no_self_message();

CREATE OR REPLACE FUNCTION no_invalid_trip_update()
RETURNS TRIGGER AS $$ BEGIN
  IF (OLD.status <> 'finished')
    THEN RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Trip is in finished status, cannot change status.';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER no_invalid_trip_update_trigger
BEFORE UPDATE ON Trips
FOR EACH ROW
EXECUTE PROCEDURE no_invalid_trip_update();

CREATE OR REPLACE FUNCTION no_invalid_bid_update()
RETURNS TRIGGER AS $$ BEGIN
  IF (OLD.status = 'pending')
    THEN RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Bid is not in pending status, cannot change status.';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER no_invalid_bid_update_trigger
BEFORE UPDATE ON Bids
FOR EACH ROW
EXECUTE PROCEDURE no_invalid_bid_update();