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

CREATE VIEW DriverTrips(driver_email, tid, license, status, origin, seats, departing_on, created_on, updated_on) AS
  SELECT D.email, T.tid, T.license, T.status, T.origin, T.seats, T.departing_on, T.created_on, T.updated_on
  FROM Trips T
  JOIN Cars C ON T.license = C.license
  JOIN Drivers D ON C.email = D.email;

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

CREATE OR REPLACE FUNCTION successful_bids_equal_seat_count()
RETURNS TRIGGER AS $$ 
DECLARE successful_bids_count INTEGER;
DECLARE seats_count INTEGER;
BEGIN 
  SELECT COUNT(B.status)
  INTO successful_bids_count
  FROM Bids B
  WHERE B.tid = NEW.tid
  AND   B.status = 'won';
  
  SELECT T.seats
  INTO seats_count
  FROM Trips T
  WHERE T.tid = NEW.tid;

  IF successful_bids_count = seats_count
    THEN BEGIN
      UPDATE Bids 
      SET status = 'failed'
      WHERE tid = NEW.tid
      AND status <> 'won';
    END;
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER successful_bids_equal_seat_count_trigger
BEFORE INSERT OR UPDATE ON Bids
FOR EACH ROW WHEN (NEW.status = 'won')
EXECUTE PROCEDURE successful_bids_equal_seat_count();