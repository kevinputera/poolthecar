const { getClient } = require('../db');

class Stop {
  constructor(min_price, address, tid) {
    this.min_price = min_price;
    this.address = address;
    this.tid = tid;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Stops (min_price, address, tid)
        VALUES ($1, $2, $3)
      `,
      values: [this.min_price, this.address, this.tid],
    });
    return this;
  }

  async update() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        UPDATE Stops SET min_price = $1
        WHERE tid = $3 AND address = $2
      `,
      values: [this.min_price, this.address, this.tid],
    });
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Stops
        WHERE address = $2 AND tid = $3
      `,
      values: [this.address, this.tid],
    });
    return this;
  }
}

module.exports = { Stop };
