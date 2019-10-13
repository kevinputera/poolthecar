const { getClient } = require('../db');

class Bid {
  constructor(email, tid, status, value) {
    this.email = email;
    this.tid = tid;
    this.status = status;
    this.value = value;
  }

  async add() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Bids (email, tid, status, value)
        VALUES ($1, $2, $3, $4)
      `,
      values: [this.email, this.tid, this.status, this.value],
    });
  }

  async update() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        UPDATE Bids SET status = $3, value = $4
        WHERE email = $1 AND tid = $2
      `,
      values: [this.email, this.tid, this.status, this.value],
    });
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
  }

  static async findAll() {
    const client = await getClient();
    const bids = await client.query({
      text: /* sql */ `
      SELECT email, tid, status, value
      FROM Bids
    `,
    });
    return bids.rows.map(
      bid => new User(bid.email, bid.tid, bid.status, bid.value)
    );
  }
}

module.exports = { Bid: Bid };
