const { makeSingleQuery } = require('../db');
const { Stop } = require('./stop');

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
        INSERT INTO Trips (tid, license, status, origin, seats, departing_on)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING created_on, updated_on;
      `,
      values: [
        this.tid,
        this.license,
        this.status,
        this.origin,
        this.seats,
        this.departingOn,
      ],
    });
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

  static async findAllCreatedWithStops() {
    const res = await makeSingleQuery(/* sql */ `
      SELECT T.tid, T.license, T.status, T.origin, T.seats,
        T.departing_on, T.created_on, T.updated_on, S.min_price, S.address
      FROM Trips T NATURAL JOIN Stops S
      WHERE T.status = 'created'
    `);
    const tripsMapping = {};
    res.rows.forEach(row => {
      if (tripsMapping[row.tid]) {
        tripsMapping[row.tid].stops.push(
          new Stop(row.min_price, row.address, row.tid)
        );
      } else {
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
        trip.stops = [new Stop(row.min_price, row.address, row.tid)];
        tripsMapping[row.tid] = trip;
      }
    });
    return Object.values(tripsMapping);
  }

  static async findAllCreatedByAddressWithStops(address) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT  T.tid, T.license, T.status, T.origin, T.seats,
          T.departing_on, T.created_on, T.updated_on, S.min_price, S.address
        FROM    Trips T NATURAL JOIN Stops S
        WHERE   LOWER(S.address) LIKE $1 OR LOWER(T.origin) LIKE $1
        AND     T.status = 'created'
      `,
      values: ['%' + address.toLowerCase() + '%'],
    });

    const tripsMapping = {};
    res.rows.forEach(row => {
      if (tripsMapping[row.tid]) {
        tripsMapping[row.tid].stops.push(
          new Stop(row.min_price, row.address, row.tid)
        );
      } else {
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
        trip.stops = [new Stop(row.min_price, row.address, row.tid)];
        tripsMapping[row.tid] = trip;
      }
    });
    return Object.values(tripsMapping);
  }

  static async findAllByDriverEmailAndAddressWithStops(driverEmail, address) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT  T.tid, T.license, T.status, T.origin, T.seats,
          T.departing_on, T.created_on, T.updated_on, S.min_price, S.address
        FROM    DriverTrips T
        NATURAL JOIN Stops S
        WHERE   T.driver_email = $1
          AND (LOWER(S.address) LIKE $2 OR LOWER(T.origin) LIKE $2)
      `,
      values: [driverEmail, '%' + address.toLowerCase() + '%'],
    });

    const tripsMapping = {};
    res.rows.forEach(row => {
      if (tripsMapping[row.tid]) {
        tripsMapping[row.tid].stops.push(
          new Stop(row.min_price, row.address, row.tid)
        );
      } else {
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
        trip.stops = [new Stop(row.min_price, row.address, row.tid)];
        tripsMapping[row.tid] = trip;
      }
    });
    return Object.values(tripsMapping);
  }

  static async findAllByDriverEmailWithCarAndStops(driverEmail) {
    const res = await makeSingleQuery({
      text: /*sql*/ `
      SELECT tid, T.license, status, origin, T.seats, departing_on, created_on, updated_on, min_price, address
      FROM DriverTrips T
      NATURAL JOIN Stops S
      WHERE T.driver_email = $1
      `,
      values: [driverEmail],
    });
    const tripsMapping = {};
    res.rows.forEach(row => {
      if (tripsMapping[row.tid]) {
        tripsMapping[row.tid].stops.push(
          new Stop(row.min_price, row.address, row.tid)
        );
      } else {
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
        trip.stops = [new Stop(row.min_price, row.address, row.tid)];
        tripsMapping[row.tid] = trip;
      }
    });
    return Object.values(tripsMapping);
  }

  static async findByTidAndStopAddress(tid, address) {
    const res = await makeSingleQuery({
      text: /* sql */ `
      SELECT  T.tid, T.license, T.status, T.origin, T.seats,
        T.departing_on, T.created_on, T.updated_on, S.min_price, S.address
      FROM    Trips T
      JOIN    Stops S ON T.tid = S.tid
      WHERE   T.tid = $1 AND (LOWER(S.address) LIKE $2 OR LOWER(T.origin) LIKE $2)
      `,
      values: [tid, '%' + address.toLowerCase() + '%'],
    });
    if (res.rows.length >= 1) {
      const row = res.rows[0];
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
      trip.stops = [];
      res.rows.forEach(row => {
        trip.stops.push(new Stop(row.min_price, row.address, row.tid));
      });
      return trip;
    } else {
      return null;
    }
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
