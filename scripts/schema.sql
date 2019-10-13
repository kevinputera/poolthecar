-- Drop all tables by dropping the `public` schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL PRIVILEGES ON SCHEMA public TO PUBLIC;

CREATE TYPE gender AS ENUM (
  'male', 
  'female', 
  'non binary'
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

CREATE TABLE Messages (
  mid serial PRIMARY KEY,
  sender varchar(255) REFERENCES Users(email) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  receiver varchar(255) REFERENCES Users(email)
    ON DELETE CASCADE ON UPDATE CASCADE,
  content varchar(255),
  sent_on timestamptz NOT NULL DEFAULT NOW()
);