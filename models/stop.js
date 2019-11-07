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
