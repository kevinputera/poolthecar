const { makeSingleQuery } = require('../db');

class Stop {
  constructor(min_price, address, tid) {
    this.min_price = min_price;
    this.address = address;
    this.tid = tid;
  }

  async save() {
    await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Stops (min_price, address, tid)
        VALUES ($1, $2, $3)
      `,
      values: [this.min_price, this.address, this.tid],
    });
    return this;
  }

  async update() {
    await makeSingleQuery({
      text: /* sql */ `
        UPDATE Stops SET min_price = $1
        WHERE tid = $3 AND address = $2
      `,
      values: [this.min_price, this.address, this.tid],
    });
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Stops
        WHERE address = $2 AND tid = $3
      `,
      values: [this.address, this.tid],
    });
    return this;
  }

  static async findByTidAndAddress(tid, address) {
    const stops = await makeSingleQuery({
      text: /* sql */ `
      SELECT min_price, address, tid
      FROM Stops
      WHERE tid = $1 AND address = $2
      `,
      values: [tid, address],
    });
    if (stops.rows.length < 1) {
      return null;
    }
    return new Stop(
      stops.rows[0].min_price,
      stops.rows[0].address,
      stops.rows[0].tid
    );
  }
}

module.exports = { Stop };
