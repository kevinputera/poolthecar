const { makeSingleQuery } = require('../db');
const { Trip } = require('./trip');
const { Stop } = require('./stop');
const { User } = require('./user');
const { Review } = require('./review');

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
        RETURNING status, created_on, updated_on
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
        UPDATE Bids
        SET address = $3, status = $4, value = $5, updated_on = NOW()
        WHERE email = $1
        AND tid = $2
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
        WHERE email = $1
        AND tid = $2
      `,
      values: [this.email, this.tid, this.address],
    });
    return this;
  }

  static async findAllByEmailAndSearchQueryWithTrip(
    email,
    search,
    page,
    limit
  ) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        SELECT B.email, B.tid, B.address, B.status AS bid_status, B.value,
          B.created_on AS bid_created_on, B.updated_on AS bid_updated_on,
          T.license, T.status AS trip_status, T.origin, T.seats, T.departing_on,
          T.created_on AS trip_created_on, T.updated_on AS trip_updated_on
        FROM Bids B JOIN Trips T ON B.tid = T.tid
        WHERE email = $1
        AND (LOWER(origin) LIKE $2 OR LOWER(address) LIKE $2)
        LIMIT $3
        OFFSET $4
      `,
      values: [
        email,
        '%' + search.toLowerCase() + '%',
        limit + 1,
        (page - 1) * limit,
      ],
    });

    let hasNextPage;
    if (res.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      bidsWithTrip: res.rows.slice(0, limit).map(row => {
        const bidWithTrip = new Bid(
          row.email,
          row.tid,
          row.address,
          row.bid_status,
          row.value,
          row.bid_created_on,
          row.bid_updated_on
        );
        bidWithTrip.trip = new Trip(
          row.tid,
          row.license,
          row.trip_status,
          row.origin,
          row.seats,
          row.departing_on,
          row.trip_created_on,
          row.trip_updated_on
        );
        return bidWithTrip;
      }),
    };
  }

  static async findByTidAndCustomerWithStop(email, tid) {
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

  static async findWonBidByTidAndCustomerWithReview(tid, email) {
    const bids = await makeSingleQuery({
      text: /* sql */ `
        SELECT  B.email, B.tid, B.address, B.status, B.value, 
                B.created_on, B.updated_on, R.score, R.content
        FROM    Bids B
        LEFT JOIN Reviews R
        ON      B.tid = R.tid AND B.email = R.email
        WHERE   B.tid = $1 AND B.email = $2 AND B.status = 'won'
      `,
      values: [tid, email],
    });
    if (bids.rows.length < 1) {
      return null;
    }
    const review = new Review(
      bids.rows[0].email,
      bids.rows[0].tid,
      bids.rows[0].score,
      bids.rows[0].content
    );
    const bid = new Bid(
      bids.rows[0].email,
      bids.rows[0].tid,
      bids.rows[0].address,
      bids.rows[0].status,
      bids.rows[0].value,
      bids.rows[0].created_on,
      bids.rows[0].updated_on
    );
    bid.review = review;
    return bid;
  }

  static async findAllByTidWithStopsAndCustomerAndReview(tid) {
    const bidsWithStops = await makeSingleQuery({
      text: /* sql */ `
        SELECT  B.email, B.tid, B.address, B.status, B.value, B.created_on, B.updated_on,
                S.min_price, U.name, U.phone, U.profile_photo_url, R.score, R.content
        FROM    Bids B NATURAL JOIN Stops S
        JOIN    Users U
        ON      U.email = B.email
        LEFT JOIN Reviews R
        ON      B.email = R.email AND B.tid = R.tid AND B.status = 'won'
        WHERE   B.tid = $1
        ORDER BY address ASC
      `,
      values: [tid],
    });
    return bidsWithStops.rows.map(row => {
      const bid = new Bid(
        row.email,
        row.tid,
        row.address,
        row.status,
        row.value,
        row.created_on,
        row.updated_on
      );
      const stop = new Stop(row.min_price, row.address, tid);
      bid.stop = stop;
      const user = new User(
        row.email,
        null,
        row.name,
        null,
        row.phone,
        row.profile_photo_url,
        null,
        null
      );
      bid.user = user;
      const review = new Review(row.email, row.tid, row.score, row.content);
      bid.review = review;
      return bid;
    });
  }

  static async findByEmailAndTid(email, tid) {
    const bids = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, tid, address, status, value, created_on, updated_on
        FROM Bids
        WHERE email = $1 AND tid = $2
      `,
      values: [email, tid],
    });
    if (bids.rows.length < 1) {
      return null;
    }
    return new Bid(
      bids.rows[0].email,
      bids.rows[0].tid,
      bids.rows[0].address,
      bids.rows[0].status,
      bids.rows[0].value,
      bids.rows[0].created_on,
      bids.rows[0].updated_on
    );
  }
}

module.exports = { Bid };
