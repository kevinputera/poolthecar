const { makeSingleQuery } = require('../db');

class Driver {
  constructor(email) {
    this.email = email;
  }

  async save() {
    await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Drivers (email)
        VALUES ($1)
      `,
      values: [this.email],
    });
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Drivers
        WHERE email = $1
      `,
      values: [this.email],
    });
    return this;
  }
}

module.exports = { Driver };
