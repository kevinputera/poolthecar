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
        INSERT INTO Trips (tid,license,status,origin,seats,departing_on)
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
    this.updatedOn = new Date();
    await makeSingleQuery({
      text: /*sql*/ `
        UPDATE  Trips 
        SET     license = $2, 
                status = $3, 
                origin = $4, 
                seats = $5, 
                departing_on = $6, 
                updated_on = $7
        WHERE   tid = $1
        `,
      values: [
        this.tid,
        this.license,
        this.status,
        this.origin,
        this.seats,
        this.departingOn,
        this.updatedOn,
      ],
    });
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

  static async findAllCreatedWithStops() {
    const res = await makeSingleQuery(/* sql */ `
      SELECT * 
      FROM Trips NATURAL JOIN Stops
      WHERE Trips.status = 'created'
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

  static async findByDriverEmailWithCarAndStops(driverEmail) {
    /*
     * For now, I am returning just the car license. For future if we want we
     * can actually include all the car details
     */
    const res = await makeSingleQuery({
      text: /*sql*/ `
      SELECT *
      FROM (SELECT * FROM 
            (SELECT Cars.license FROM Cars 
              NATURAL JOIN Driver WHERE Driver.email = $1) AS CarsOfDriver 
            NATURAL JOIN Trips) AS TripsOfDriver 
            NATURAL JOIN Stops
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

  static async findByAddressWithStops(address) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT  tid, license, status, origin, seats, departing_on, created_on, updated_on, min_price, address
        FROM    Trips NATURAL JOIN Stops
        WHERE   address LIKE $1
      `,
      values: ['%' + address + '%'],
    });

    const tripsMapping = {};
    console.log(res.rows[0]);
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
}

module.exports = { Trip };
