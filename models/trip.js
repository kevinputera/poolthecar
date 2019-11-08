const { makeSingleQuery } = require('../db');
const { Stop } = require('./stop');
const { Car } = require('./car');
const { Driver } = require('./driver');

class Trip {
  constructor(
    tid,
    license,
    status,
    origin,
    seats,
    departingOn,
    createdOn,
    updatedOn
  ) {
    this.tid = tid;
    this.license = license;
    this.status = status;
    this.origin = origin;
    this.seats = seats;
    this.departingOn = departingOn;
    this.createdOn = createdOn;
    this.updatedOn = updatedOn;
  }

  async save() {
    const trips = await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Trips (license, origin, seats, departing_on)
        VALUES ($1, $2, $3, $4)
        RETURNING tid, status, created_on, updated_on;
      `,
      values: [this.license, this.origin, this.seats, this.departingOn],
    });
    this.tid = trips.rows[0].tid;
    this.status = trips.rows[0].status;
    this.createdOn = trips.rows[0].created_on;
    this.updatedOn = trips.rows[0].updated_on;
    return this;
  }

  async update() {
    const res = await makeSingleQuery({
      text: /*sql*/ `
        UPDATE  Trips 
        SET     status = $2,
                origin = $3,
                seats = $4,
                departing_on = $5,
                updated_on = NOW()
        WHERE   tid = $1
        RETURNING updated_on
        `,
      values: [
        this.tid,
        this.status,
        this.origin,
        this.seats,
        this.departingOn,
      ],
    });
    this.updatedOn = res.rows[0].updated_on;
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Trips
        WHERE tid = $1
      `,
      values: [this.tid],
    });
    return this;
  }

  static async findByTid(tid) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT  tid, license, status, origin, seats, departing_on, created_on, updated_on 
        FROM    Trips
        WHERE   tid = $1
      `,
      values: [tid],
    });
    if (res.rows.length === 0) {
      return null;
    }
    const trip = new Trip(
      res.rows[0].tid,
      res.rows[0].license,
      res.rows[0].status,
      res.rows[0].origin,
      res.rows[0].seats,
      res.rows[0].departing_on,
      res.rows[0].created_on,
      res.rows[0].updated_on
    );
    return trip;
  }

  static async findByTidWithDriverAndStops(tid) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT DT.tid, DT.license, DT.status, DT.origin, DT.seats, DT.departing_on,
          DT.created_on AS trip_created_on, DT.updated_on AS trip_updated_on,
          U.email, U.secret, U.name, U.gender, U.phone, U.profile_photo_url,
          U.created_on AS driver_created_on, U.updated_on AS driver_updated_on
        FROM DriverTrips DT JOIN Users U ON DT.driver_email = U.email
        WHERE tid = $1
      `,
      values: [tid],
    });
    if (res.rows.length === 0) {
      return null;
    }
    const tripWithDriverAndStops = new Trip(
      res.rows[0].tid,
      res.rows[0].license,
      res.rows[0].status,
      res.rows[0].origin,
      res.rows[0].seats,
      res.rows[0].departing_on,
      res.rows[0].trip_created_on,
      res.rows[0].trip_updated_on
    );
    tripWithDriverAndStops.driver = new Driver(
      res.rows[0].email,
      res.rows[0].secret,
      res.rows[0].name,
      res.rows[0].gender,
      res.rows[0].phone,
      res.rows[0].profile_photo_url,
      res.rows[0].driver_created_on,
      res.rows[0].driver_updated_on
    );
    tripWithDriverAndStops.stops = await Stop.findAllByTid(tid);
    return tripWithDriverAndStops;
  }

  static async findAllByDriverEmail(driverEmail) {
    const res = await makeSingleQuery({
      text: /* sql */ `
      SELECT tid, license, status, origin, seats, departing_on, created_on, updated_on
      FROM DriverTrips
      WHERE driver_email = $1
      `,
      values: [driverEmail],
    });
    if (res.rows.length < 1) {
      return null;
    }
    return res.rows.map(
      row =>
        new Trip(
          row.tid,
          row.license,
          row.status,
          row.origin,
          row.seats,
          row.departing_on,
          row.created_on,
          row.updated_on
        )
    );
  }

  static async findAllCreatedBySearchQueryWithStops(search, page, limit) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT T.tid, T.license, T.status, T.origin, T.seats, T.departing_on, 
          T.created_on, T.updated_on
        FROM Trips T
        WHERE T.status = 'created'
        AND (LOWER(T.origin) LIKE $1
          OR EXISTS (
            SELECT 1
            FROM Stops S
            WHERE S.tid = T.tid
            AND LOWER(S.address) LIKE $1
          )
        )
        LIMIT $2
        OFFSET $3
      `,
      values: ['%' + search.toLowerCase() + '%', limit + 1, (page - 1) * limit],
    });

    let hasNextPage;
    if (res.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      tripsWithStops: await Promise.all(
        res.rows.slice(0, limit).map(async row => {
          const trip = new Trip(
            row.tid,
            row.license,
            row.status,
            row.origin,
            row.seats,
            row.departing_on,
            row.created_on,
            row.updated_on
          );
          const stops = await Stop.findAllByTid(row.tid);
          trip.stops = stops;
          return trip;
        })
      ),
    };
  }

  static async findAllByDriverEmailAndSearchQueryWithStops(
    driverEmail,
    search,
    page,
    limit
  ) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT DT.tid, DT.license, DT.status, DT.origin, DT.seats,
          DT.departing_on, DT.created_on, DT.updated_on
        FROM DriverTrips DT
        WHERE DT.driver_email = $1
        AND (LOWER(DT.origin) LIKE $2
          OR EXISTS (
            SELECT 1
            FROM Stops S
            WHERE S.tid = DT.tid
            AND LOWER(S.address) LIKE $2
          )
        )
        LIMIT $3
        OFFSET $4
      `,
      values: [
        driverEmail,
        '%' + search.toLowerCase() + '%',
        limit + 1,
        (page - 1) * limit,
      ],
    });

    let hasNextPage;
    if (res.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      tripsWithStops: await Promise.all(
        res.rows.slice(0, limit).map(async row => {
          const trip = new Trip(
            row.tid,
            row.license,
            row.status,
            row.origin,
            row.seats,
            row.departing_on,
            row.created_on,
            row.updated_on
          );
          const stops = await Stop.findAllByTid(row.tid);
          trip.stops = stops;
          return trip;
        })
      ),
    };
  }

  static async findByTidWithStops(tid) {
    const res = await makeSingleQuery({
      text: /* sql */ `
      SELECT  tid, license, status, origin, seats, departing_on, created_on, updated_on,
              min_price, address
      FROM    Trips
      NATURAL JOIN Stops
      WHERE   tid = $1
      `,
      values: [tid],
    });
    if (res.rows.length < 1) {
      return null;
    }
    let trip = new Trip(
      res.rows[0].tid,
      res.rows[0].license,
      res.rows[0].status,
      res.rows[0].origin,
      res.rows[0].seats,
      res.rows[0].departing_on,
      res.rows[0].createdOn,
      res.rows[0].updatedOn
    );
    trip.stops = res.rows.map(
      row => new Stop(row.min_price, row.address, trip.tid)
    );
    return trip;
  }
}

module.exports = { Trip };
