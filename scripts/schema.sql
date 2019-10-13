-- Drop all tables by dropping the `public` schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL PRIVILEGES ON SCHEMA public TO PUBLIC;

CREATE TYPE gender AS ENUM (
  'male', 
  'female', 
  'non binary'
);

CREATE TYPE trip_status as ENUM (
  'created',
  'ongoing',
  'finished'
);

CREATE TABLE accounts (
  email varchar(255) PRIMARY KEY,
  secret char(64) NOT NULL, -- SHA256 hash of the account's password
  name varchar(255) NOT NULL,
  gender gender NOT NULL,
  phone varchar(50) NOT NULL,
  profile_photo_url varchar(1023) NOT NULL,
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE Trips (
  tid integer PRIMARY KEY,
  license varchar(255) NOT NULL, /*References Cars(license)*/
  status trip_status NOT NULL DEFAULT 'created',
  origin varchar(255) NOT NULL,
  seats integer NOT NULL CHECK (seats > 0)
  departing_on timestamptz NOT NULL,
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE StopsInTrip (
  min_price numeric NOT NULL DEFAULT 0 CHECK (min_price >= 0),
  address varchar(255),
  tid integer,
  PRIMARY KEY(tid,address),
  FOREIGN KEY (tid) REFERENCES Trips ON DELETE CASCADE
);
