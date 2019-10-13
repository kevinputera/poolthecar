const { getClient } = require('../db');

class Stop {
  constructor(min_price,address,tid) {
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
      values: [
        this.min_price,
        this.address,
        this.tid,
      ],
    });
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Stops
        WHERE address = $2 AND tid = $3
      `,
      values: [
          this.address,
          this.tid,
        ],
    });
  }

  static async findAll() {
    const client = await getClient();
    const stops = await client.query(/* sql */ `
      SELECT min_price, address, tid
      FROM Stops
    `);
    return stops.rows.map(
      stop =>
        new Stop(
          stop.min_price,
          stop.address,
          stop.tid,
        )
    );
  }
}

module.exports = { Stop };
