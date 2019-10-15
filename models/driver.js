const { getClient } = require('../db');

class Driver {
  constructor(email) {
    this.email = email;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Drivers (email)
        VALUES ($1)
      `,
      values: [this.email],
    });
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
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
