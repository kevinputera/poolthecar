# poolthecar

## Development setup

1. Install [Docker for Mac](https://docs.docker.com/docker-for-mac/install) or [Docker for Windows](https://docs.docker.com/docker-for-windows/install) if you wish to use `docker-compose`.
2. After that, make a copy of the `.env.example` file and rename it as `.env` in the same directory.
3. Then, depending on whether or not you installed docker:
* (Docker) Run `docker-compose up`. You may encounter an error the first time running it since the `postgres` image is not yet set up; just terminate and re-run `docker-compose up`.
* (No docker) Run the `postgres` database separately on a terminal and make sure you have it set up with the configurations in `.env`.
4. Run either `npm start`, which starts the `Express` server, or `npm run dev`, which starts the `Express` server + rebuilds when changes are detected in the codebase.

## Directory structure

- `models`
- `routes`
- `utils`
- `scripts`
- `middlewares`
