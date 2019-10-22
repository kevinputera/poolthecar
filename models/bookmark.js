const { getClient } = require('../db');

class Bookmark {
  constructor(email, name, address) {
    this.email = email;
    this.name = name;
    this.address = address;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Bookmarks (email, name, address)
        VALUES ($1, $2, $3)
      `,
      values: [this.email, this.name, this.address],
    });
    return this;
  }

  async update() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        UPDATE Bookmarks SET address = $1,
        WHERE email = $2 AND name = $3
      `,
      values: [this.address, this.email, this.name],
    });
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Bookmarks
        WHERE email = $1 AND name = $2       
      `,
      values: [this.email, this.name],
    });
    return this;
  }

  static async findByEmailAndName(email, name) {
    const client = await getClient();
    const res = await client.query({
      text: /* sql */ `
        SELECT email, name, address
        FROM Bookmarks
        WHERE email = $1 AND name = $2 
      `,
      values: [email, name],
    });
    if (res.rows.length === 0) {
      return null;
    }
    return new Bookmark(
      res.rows[0].email,
      res.rows[0].name,
      res.rows[0].address
    );
  }
}

module.exports = { Bookmark };
