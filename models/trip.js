const { getClient } = require('../db');

class Trip {
  constructor(tid,license,status,origin,seats,departing_on) {
    this.tid = tid;
    this.license = license;
    this.status = status;
    this.origin = origin;
    this.seats = seats;
    this.departing_on = departing_on;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Trips (tid, license, status, origin, seats,departing_on)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [
        this.tid,
        this.license,
        this.status,
        this.origin,
        this.seats,
        this.departing_on
      ],
    });
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
