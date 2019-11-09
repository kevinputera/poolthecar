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
  sender varchar(255) NOT NULL REFERENCES Users(email) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  receiver varchar(255) NOT NULL REFERENCES Users(email)
    ON DELETE CASCADE ON UPDATE CASCADE,
  content text,
  sent_on timestamptz NOT NULL DEFAULT NOW(),
  CHECK (sender <> receiver)
);

CREATE TABLE Drivers (
  email varchar(255) PRIMARY KEY REFERENCES Users(email)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Cars (
  license varchar(255) PRIMARY KEY,
  email varchar(255) NOT NULL REFERENCES Drivers(email)
    ON DELETE CASCADE ON UPDATE CASCADE,
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
  license varchar(255) NOT NULL REFERENCES Cars(license)
    ON DELETE CASCADE ON UPDATE CASCADE,
  status trip_status NOT NULL DEFAULT 'created',
  origin varchar(255) NOT NULL,
  seats integer NOT NULL CHECK (seats > 0),
  departing_on timestamptz NOT NULL,
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE Stops (
  tid integer REFERENCES Trips(tid)
    ON DELETE CASCADE ON UPDATE CASCADE,
  address varchar(255),
  min_price numeric NOT NULL DEFAULT 0 CHECK (min_price >= 0),
  PRIMARY KEY(tid, address)
);

CREATE TYPE bid_status AS ENUM (
  'won',
  'failed',
  'pending'
);

CREATE TABLE Bids (
  email varchar(255) REFERENCES Users(email)
    ON DELETE CASCADE ON UPDATE CASCADE,
  tid integer,
  address varchar(255),
  status bid_status NOT NULL DEFAULT 'pending',
  value numeric NOT NULL CHECK (value >= 0),
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (email, tid, address),
  FOREIGN KEY (tid, address) REFERENCES Stops(tid, address)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Reviews (
  email varchar(255) REFERENCES Users(email),
  tid integer REFERENCES Trips(tid)
    ON DELETE CASCADE ON UPDATE CASCADE,
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

-- Trigger to enforce trip seats count <= car seats count
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
    RAISE EXCEPTION 'Trip seats more than car seats';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER no_trip_seats_more_than_car_seats_trigger
BEFORE INSERT OR UPDATE ON Trips
FOR EACH ROW
EXECUTE PROCEDURE no_trip_seats_more_than_car_seats();

-- Trigger to enforce no self bidding
-- i.e. a user cannot bid for his own trip
CREATE OR REPLACE FUNCTION no_self_bid()
RETURNS TRIGGER AS $$ DECLARE driver_email varchar(255);
BEGIN 
  SELECT DCT.driver_email
  INTO driver_email
  FROM DriversCarsTrips DCT
  WHERE DCT.trip_tid = NEW.tid;
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

-- Trigger to enforce that bids must have value above
-- the minimum price set for the trip & stop it is bidding for
CREATE OR REPLACE FUNCTION no_bid_below_min_price()
RETURNS TRIGGER AS $$ DECLARE stop_min_price numeric;
BEGIN
  SELECT S.min_price
  INTO stop_min_price
  FROM Stops S
  WHERE S.tid = NEW.tid
  AND S.address = NEW.address;
  IF NEW.value >= stop_min_price
    THEN RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Bid below min price';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER no_bid_below_min_price_trigger
BEFORE INSERT OR UPDATE ON Bids
FOR EACH ROW
EXECUTE PROCEDURE no_bid_below_min_price();

-- Trigger to enforce valid trip status when updating
-- i.e., a trip can only be updated if it is not in 'finished' status
CREATE OR REPLACE FUNCTION only_created_trip_update()
RETURNS TRIGGER AS $$ BEGIN
  IF (OLD.status <> 'finished')
    THEN RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Trip is in finished status, cannot update';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER only_created_trip_update_trigger
BEFORE UPDATE ON Trips
FOR EACH ROW
EXECUTE PROCEDURE only_created_trip_update();

-- Trigger to enforce valid bid status when updating
-- i.e., a bid can only be updated if it has a 'pending' status
CREATE OR REPLACE FUNCTION only_pending_bid_update()
RETURNS TRIGGER AS $$ BEGIN
  IF (OLD.status = 'pending')
    THEN RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Bid is not in pending status, cannot update';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER only_pending_update_trigger
BEFORE UPDATE ON Bids
FOR EACH ROW
EXECUTE PROCEDURE only_pending_bid_update();

-- Trigger to enforce that there is only one active trip for each driver
CREATE OR REPLACE FUNCTION only_one_active_trip()
RETURNS TRIGGER AS $$ DECLARE active_trip_count numeric; new_driver_email varchar(255);
BEGIN
  SELECT DCT.driver_email
  INTO new_driver_email
  FROM DriversCarsTrips DCT
  WHERE DCT.trip_tid = NEW.tid;

  SELECT count(DCT.trip_status)
  INTO active_trip_count
  FROM DriversCarsTrips DCT
  WHERE DCT.driver_email = new_driver_email
  AND   DCT.trip_status = 'ongoing';

  IF (active_trip_count = 0) 
    THEN RETURN NEW;
  ELSE 
    RAISE EXCEPTION 'More than one ongoing trip.';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER only_one_active_trip_trigger
BEFORE UPDATE ON Trips
FOR EACH ROW WHEN (NEW.status = 'ongoing')
EXECUTE PROCEDURE only_one_active_trip();

-- Trigger to enforce the reviewer had a successful bid and trip was finished
CREATE OR REPLACE FUNCTION valid_reviewer()
RETURNS TRIGGER AS $$ DECLARE new_trip_status trip_status; new_bid_status bid_status; 
BEGIN
  SELECT T.status
  INTO new_trip_status
  FROM Trips T
  WHERE T.tid = NEW.tid;

  IF (new_trip_status <> 'finished')
    THEN RAISE EXCEPTION 'Cannot review unfinished trips.';
  END IF;

  SELECT B.status
  INTO new_bid_status
  FROM Bids B
  WHERE B.email = NEW.email
  AND B.tid = NEW.tid;

  IF (new_bid_status = 'won')
    THEN RETURN NEW;
  ELSE
    RAISE EXCEPTION 'The user is ineligible to review this trip.';
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER valid_reviewer_trigger
BEFORE INSERT ON Reviews
FOR EACH ROW
EXECUTE PROCEDURE valid_reviewer();