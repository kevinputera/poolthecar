const { makeSingleQuery } = require('../db');
const { Trip } = require('./trip');

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
        INSERT INTO Bids (email, tid, address, value)
        VALUES ($1, $2, $3, $4)
        RETURNING created_on, updated_on
      `,
      values: [this.email, this.tid, this.address, this.value],
    });
    this.status = bids.rows[0].status;
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

  static async findAllByEmail(email) {
    const bids = await makeSingleQuery({
      text: /* sql */ `
      SELECT email, tid, status, value, Bids.created_on, Bids.updated_on
      FROM Bids
      WHERE email = $1
    `,
      values: [email],
    });
    if (bids.rows.length < 1) {
      return null;
    }
    return bids.rows.map(
      row =>
        new Bid(
          row.email,
          row.tid,
          row.address,
          row.status,
          row.value,
          row.created_on,
          row.updated_on
        )
    );
  }

  static async findAllByCustomerWithTrip(email) {
    let bids = await this.findAllByEmail(email);
    const bidsWithTrip = bids.map(async bid => {
      const trip = await Trip.findByTid(bid.tid);
      bid.trip = trip;
      return bid;
    });
    return Promise.all(bidsWithTrip);
  }

  static async findAllByCustomerAndAddressWithTrip(email, address) {
    let bids = await this.findAllByEmail(email);
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
