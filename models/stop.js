const { makeSingleQuery } = require('../db');

class Stop {
  constructor(minPrice, address, tid) {
    this.minPrice = minPrice;
    this.address = address;
    this.tid = tid;
  }

  async save() {
    await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Stops (min_price, address, tid)
        VALUES ($1, $2, $3)
      `,
      values: [this.minPrice, this.address, this.tid],
    });
    return this;
  }

  async update() {
    await makeSingleQuery({
      text: /* sql */ `
        UPDATE Stops SET min_price = $1
        WHERE tid = $3 AND address = $2
      `,
      values: [this.minPrice, this.address, this.tid],
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

  static async findAllByTid(tid) {
    const stops = await makeSingleQuery({
      text: /* sql */ `
        SELECT min_price, address, tid
        FROM Stops
        WHERE tid = $1
      `,
      values: [tid],
    });
    return stops.rows.map(
      stop => new Stop(stop.min_price, stop.address, stop.tid)
    );
  }
}

module.exports = { Stop };
