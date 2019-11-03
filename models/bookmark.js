const { makeSingleQuery } = require('../db');

class Bookmark {
  constructor(email, name, address) {
    this.email = email;
    this.name = name;
    this.address = address;
  }

  async save() {
    await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Bookmarks (email, name, address)
        VALUES ($1, $2, $3)
      `,
      values: [this.email, this.name, this.address],
    });
    return this;
  }

  async update() {
    await makeSingleQuery({
      text: /* sql */ `
        UPDATE Bookmarks
        SET address = $1
        WHERE email = $2 AND name = $3
      `,
      values: [this.address, this.email, this.name],
    });
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Bookmarks
        WHERE email = $1 AND name = $2       
      `,
      values: [this.email, this.name],
    });
    return this;
  }

  static async findAllByEmail(email) {
    const bookmarks = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, name, address 
        FROM Bookmarks
        WHERE email = $1
      `,
      values: [email],
    });
    return bookmarks.rows.map(
      bookmark => new Bookmark(bookmark.email, bookmark.name, bookmark.address)
    );
  }

  static async findAllByEmailAndLikeName(email, name) {
    const bookmarks = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, name, address
        FROM Bookmarks
        WHERE email = $1
        AND LOWER(name) LIKE $2
      `,
      values: [email, '%' + name.toLowerCase() + '%'],
    });
    return bookmarks.rows.map(
      bookmark => new Bookmark(bookmark.email, bookmark.name, bookmark.address)
    );
  }

  static async findByEmailAndName(email, name) {
    const bookmarks = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, name, address
        FROM Bookmarks
        WHERE email = $1
        AND name = $2
      `,
      values: [email, name],
    });
    if (bookmarks.rows.length === 0) {
      return null;
    }
    return new Bookmark(
      bookmarks.rows[0].email,
      bookmarks.rows[0].name,
      bookmarks.rows[0].address
    );
  }
}

module.exports = { Bookmark };
