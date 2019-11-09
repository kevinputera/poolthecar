# Poolthecar

## Development setup

Before running the app, note the following:

1. All (most) application configurations must be located in an `.env` file located in the base directory.
   To achieve this, we've provided a `.env.example` file to show what's needed.
2. If you're running docker with docker-compose, you can run `docker-compose start` to start the postgres server.
   This will run the server with the configurations in `.env.example` (remember to rename this as `.env`), so starting up later on will be straightforward.
3. Otherwise, you should update the configuration in `.env` to reflect the connection needed to your running postgres instance.

After that, running the app should be straightforward:

1. Run `npm install` if you haven't, to install all the application dependencies.
2. Run `npm run db` to initailize db schema and seed db with a small set of values.
3. Run `npm run start` to run the application server.
4. You can now go to `localhost:8000` to see the app in action!

### Scripts

- `npm run db`: Initialize db schema and seed db with a small set of values.
- `npm run db:table`: Create/recreate db tables
- `npm run db:seed`: Seed db tables
- `npm run start`: Run the application server

## Directory structure

- `models`: **IMPORTANT** All **SQL queries** are located here. Mappings from js classes <-> db entities.
- `scripts`: **IMPORTANT** **schema.sql (database schema)** is located here. Includes table.js and seed.js to create and populate db.
- `routes`: API and page routes
- `views`: `pug` view templates
- `middlewares`: Express middlewares
- `public`: Static js, css
- `utils`: Utility modules
