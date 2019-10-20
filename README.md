# poolthecar

## Development setup

We have set up a `docker-compose` script to run the `postgres`(postgres db service) and `pgweb`(postgres web viewer) containers.

1. Run `npm install` to install project dependencies.
2. After that, make a copy of the `.env.example` file and rename it as `.env` in the same directory.
3. (Optional) Install [Docker for Mac](https://docs.docker.com/docker-for-mac/install) or [Docker for Windows](https://docs.docker.com/docker-for-windows/install) if you wish to use `docker-compose`.
4. Then, depending on whether or not you installed docker:

- (Docker) Run `docker-compose up`. You may encounter an error the first time running it since the `postgres` container is not yet set up; just terminate and re-run `docker-compose up`. (TODO: Fix this dependency issue)
- (No docker) Run the `postgres` db service separately on a terminal and make sure you have it set up with the configurations in `.env`.

5. Run either `npm start`, which starts the `Express` server, or `npm run dev`, which starts the `Express` server with automatic rebuilds when changes are detected in the codebase.

## Directory structure

- `models`: Mppings from js classes -> db entities
- `routes`: Server routes
- `middlewares`: Express middlewares
- `views`: `pug` view templates
- `scripts`: Useful scripts
