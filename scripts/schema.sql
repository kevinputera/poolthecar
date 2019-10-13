-- Drop all tables by dropping the `public` schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL PRIVILEGES ON SCHEMA public TO PUBLIC;

CREATE TYPE gender AS ENUM (
  'male', 
  'female', 
  'non binary'
);

CREATE TYPE bid_status AS ENUM (
  'won',
  'failed',
  'pending'
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

CREATE TABLE Customers (
  email varchar(255) PRIMARY KEY REFERENCES Users(email)
);

CREATE TABLE Bids (
  email varchar(255) REFERENCES Customers(email),
  tid varchar(255) /*REFERENCES Trips(tid)*/,
  status bid_status NOT NULL,
  value numeric NOT NULL,
  created_on timestamptz NOT NULL DEFAULT NOW(),
  updated_on timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (email, tid)
);

CREATE TABLE Reviews (
  email varchar(255) REFERENCES Customers(email),
  tid varchar(255) /* REFERENCES Trips(tid) */,
  score numeric NOT NULL DEFAULT 5,
  content text,
  PRIMARY KEY (email, tid)
);
