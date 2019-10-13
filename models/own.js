const { getClient } = require('../db');

class Own {
  constructor(email, license) {
    this.email = email;
    this.license = license;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Owns (email, license)
        VALUES ($1, $2)
      `,
      values: [this.email, this.license],
    });
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Owns
        WHERE email = $1 AND license = $2
      `,
      values: [this.email, this.license],
    });
  }

  static async findAll() {
    const client = await getClient();
    const owns = await client.query(/* sql */ `
      SELECT email, license
      FROM Owns
    `);
    return owns.rows.map(own => new Own(own.email, own.license));
  }
}

module.exports = { Own };
