const { makeSingleQuery } = require('../db');
const { Trip } = require('./trip');
const { Stop } = require('./stop');

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

  static async findAllByTidAndCustomerWithStops(email, tid) {
    const res = await makeSingleQuery({
      text: /* sql */ `
      SELECT  B.email, B.status, B.value, B.created_on, B.updated_on,
              S.min_price, S.address
      FROM Bids B
      JOIN Stops S
      ON B.tid = S.tid AND B.address = S.address
      WHERE B.email = $1 AND B.tid = $2
      `,
      values: [email, tid],
    });
    if (res.rows.length < 1) {
      return null;
    }
    let bidMapWithStop = {};
    res.rows.forEach(row => {
      let bid = new Bid(
        row.email,
        row.tid,
        row.address,
        row.status,
        row.value,
        row.created_on,
        row.updated_on
      );
      let stop = new Stop(row.min_price, row.address, tid);
      bid.stop = stop;
      bidMapWithStop[row.address] = bid;
    });
    return bidMapWithStop;
  }
}

module.exports = { Bid };
