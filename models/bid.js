const { getClient } = require('../db');

class Bid {
  static tableName = 'Bids';

  constructor(email, tid, status, value) {
    this.email = email;
    this.tid = tid;
    this.status = status;
    this.value = value;
  }

  async add() {
    const client = await getClient();
    await client.query({
      text: `INSERT INTO $1 (email, tid, status, value)
            VALUES ($2, $3, $4, $5)`,
      values: [tableName, this.email, this.tid, this.status, this.value],
    });
  }
}
