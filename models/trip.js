const { getClient } = require('../db');

class Trip {
  constructor(tid,license,status,origin,seats,departing_on,created_on,updated_on) {
    this.tid = tid;
    this.license = license;
    this.status = status;
    this.origin = origin;
    this.seats = seats;
    this.departing_on = departing_on;
    this.created_on = created_on;
    this.updated_on = updated_on;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Trips (tid,license,status,origin,seats,departing_on,created_on,updated_on)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      values: [
        this.tid,
        this.license,
        this.status,
        this.origin,
        this.seats,
        this.departing_on,
        this.created_on,
        this.updated_on
      ],
    });
    return this;
  }

  async update() {
    this.updated_on = Date.now();
    const client = await getClient();
    await client.query({
      text: /*sql*/ `
        UPDATE Trips SET license = $2, status = $3, origin = $4, 
               seats = $5, departing_on = $6, updated_on = $8
        WHERE tid = $1
        RETURNING *
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
