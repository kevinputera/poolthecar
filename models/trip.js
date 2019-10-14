const { getClient } = require('../db');

class Trip {
  constructor(tid,license,status,origin,seats,departing_on,createdOn,updatedOn) {
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
    const client = await getClient();
    const trips = await client.query({
      text: /* sql */ `
        INSERT INTO Trips (tid,license,status,origin,seats,departing_on)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING created_on,updated_on;
      `,
      values: [
        this.tid,
        this.license,
        this.status,
        this.origin,
        this.seats,
        this.departingOn
      ],
    });
    this.createdOn = trips.rows[0].created_on;
    this.updatedOn = trips.rows[0].updated_on;
    return this;
  }

  async update() {
    this.updatedOn = new Date();
    const client = await getClient();
    await client.query({
      text: /*sql*/ `
        UPDATE Trips SET license = $2, status = $3, origin = $4, 
               seats = $5, departing_on = $6, updated_on = $8
        WHERE tid = $1
        `,
        values: [
          this.tid,
          this.license,
          this.status,
          this.origin,
          this.seats,
          this.departing_on,
          this.updated_on
        ],
    });
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Trips
        WHERE tid = $1
      `,
      values: [this.tid],
    });
    return this;
  }

  static async findAll() {
    const client = await getClient();
    const trips = await client.query(/* sql */ `
      SELECT tid,license,status,origin,seats,departing_on
      FROM Trips
    `);
    return trips.rows.map(
      trip =>
        new Trip(
          trip.tid,
          trip.license,
          trip.status,
          trip.origin,
          trip.seats,
          trip.departing_on 
        )
    );
  }
}

module.exports = { Trip };
