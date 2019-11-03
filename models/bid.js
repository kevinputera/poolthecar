const { makeSingleQuery } = require('../db');
const { Trip } = require('./trip');

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
    const bids = await makeSingleQuery({
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
    const bids = await makeSingleQuery({
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
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Bids
        WHERE email = $1 AND tid = $2
      `,
      values: [this.email, this.tid],
    });
    return this;
  }

  static async findByDriver(email) {
    const bids = await makeSingleQuery({
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
    const bids = await makeSingleQuery({
      text: /* sql */ `
      SELECT Bids.email, tid, status, value, Bids.created_on, Bids.updated_on
      FROM Bids JOIN Users
      ON Bids.email = Users.email
      WHERE Bids.email = $1
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

  static async findByCustomerWithTrip(email) {
    let bids = await this.findByCustomer(email);
    const bidsWithTrip = bids.map(async bid => {
      const trip = await Trip.findByTid(bid.tid);
      bid.trip = trip;
      return bid;
    });
    return Promise.all(bidsWithTrip);
  }

  static async findByCustomerAndAddressWithTrip(email, address) {
    let bids = await this.findByCustomer(email);
    const bidsWithTripPromise = bids.map(async bid => {
      const trip = await Trip.findByTidAndStopAddress(bid.tid, address);
      if (trip != null) {
        bid.trip = trip;
        return bid;
      } else {
        return null;
      }
    });
    const bidsWithTrip = await Promise.all(bidsWithTripPromise);
    return bidsWithTrip.filter(x => !!x);
  }
}

module.exports = { Bid };
