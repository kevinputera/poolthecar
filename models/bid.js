const { makeSingleQuery } = require('../db');

class Bid {
  constructor(email, tid, address, status, value, created_on, updated_on) {
    this.email = email;
    this.tid = tid;
    this.address = address;
    this.status = status;
    this.value = value;
    this.created_on = created_on;
    this.updated_on = updated_on;
  }

  async save() {
    const bids = await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Bids (email, tid, address, status, value)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING created_on, updated_on
      `,
      values: [this.email, this.tid, this.address, this.status, this.value],
    });
    this.created_on = bids.rows[0].created_on;
    this.updated_on = bids.rows[0].updated_on;
    return this;
  }

  async update() {
    const bids = await makeSingleQuery({
      text: /* sql */ `
        UPDATE Bids SET status = $4, value = $5, updated_on = NOW()
        WHERE email = $1 AND tid = $2 AND address = $3
        RETURNING created_on, updated_on
      `,
      values: [this.email, this.tid, this.address, this.status, this.value],
    });
    this.updated_on = bids.rows[0].updated_on;
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Bids
        WHERE email = $1 AND tid = $2 AND address = $3
      `,
      values: [this.email, this.tid, this.address],
    });
    return this;
  }

  static async findByUserAndStop(email, tid, address) {
    const bids = await makeSingleQuery({
      text: /* sql */ `
        SELECT Bids.email, tid, address, status, value, Bids.created_on, Bids.updated_on
        WHERE Bids.email = $1 AND tid = $2 AND address = $3
      `,
      values: [email, tid, address],
    });
    if (bids.rows.length < 1) {
      return null;
    }
    const bid = bids.rows[0];
    return new Bid(
      bid.email,
      bid.tid,
      bid.address,
      bid.status,
      bid.value,
      bid.created_on,
      bid.updated_on
    );
  }

  static async findBidByTripDriverStatus(tid, email, status) {
    const bids = await makeSingleQuery({
      text: /* sql */ `
        SELECT Bids.email, Bids.tid, address, Bids.status, value, Bids.created_on, Bids.updated_on
        FROM Bids
        JOIN Trips ON Bids.tid = Trips.tid
        JOIN Cars ON Trips.license = Cars.license
        JOIN Drivers ON Cars.email = Drivers.email
        WHERE Bids.tid = $1 AND Drivers.email = $2 AND Bids.status = $3
      `,
      values: [tid, email, status],
    });
    return bids.rows.map(
      bid =>
        new Bid(
          bid.email,
          bid.tid,
          bid.address,
          bid.status,
          bid.value,
          bid.created_on,
          bid.updated_on
        )
    );
  }
}

module.exports = { Bid };
