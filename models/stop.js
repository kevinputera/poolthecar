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
}

module.exports = { Stop };
