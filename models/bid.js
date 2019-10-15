const { getClient } = require('../db');

class Bid {
  constructor(email, tid, status, value, created_on, updated_on) {
    this.email = email;
    this.tid = tid;
    this.status = status;
    this.value = value;
    this.created_on = created_on;
    this.updated_on = updated_on;
  }

  async save() {
    const client = await getClient();
    const bids = await client.query({
      text: /* sql */ `
        INSERT INTO Bids (email, tid, status, value)
        VALUES ($1, $2, $3, $4)
        RETURNING created_on, updated_on
      `,
      values: [this.email, this.tid, this.status, this.value],
    });
    this.created_on = bids.rows[0].created_on;
    this.updated_on = bids.rows[0].updated_on;
    return this;
  }

  async update() {
    const client = await getClient();
    bids = await client.query({
      text: /* sql */ `
        UPDATE Bids SET status = $3, value = $4, updated_on = NOW()
        WHERE email = $1 AND tid = $2
        RETURNING created_on, updated_on
      `,
      values: [this.email, this.tid, this.status, this.value],
    });
    this.updated_on = bids.rows[0].updated_on;
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Bids
        WHERE email = $1 AND tid = $2
      `,
      values: [this.email, this.tid],
    });
    return this;
  }

  static async findByDriver(email) {
    const client = await getClient();
    const bids = await client.query({
      text: /* sql */ `
      SELECT email, tid, status, value, created_on, updated_on
      FROM Bids NATURAL JOIN Drivers
      WHERE email = $1
    `,
      values: [email],
    });
    return bids.rows.map(
      bid =>
        new Bid(
          bid.email,
          bid.tid,
          bid.status,
          bid.value,
          bid.created_on,
          bid.updated_on
        )
    );
  }

  static async findByCustomer(email) {
    const client = await getClient();
    const bids = await client.query({
      text: /* sql */ `
      SELECT email, tid, status, value, created_on, updated_on
      FROM Bids NATURAL JOIN Customers
      WHERE email = $1
    `,
      values: [email],
    });
    return bids.rows.map(
      bid =>
        new Bid(
          bid.email,
          bid.tid,
          bid.status,
          bid.value,
          bid.created_on,
          bid.updated_on
        )
    );
  }
}

module.exports = { Bid };
