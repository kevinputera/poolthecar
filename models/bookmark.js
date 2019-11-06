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

  static async findAllByEmailAndSearchQuery(email, search, page, limit) {
    const bookmarks = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, name, address
        FROM Bookmarks
        WHERE email = $1
        AND (LOWER(name) LIKE $2 OR LOWER(address) LIKE $2)
        LIMIT $3
        OFFSET $4
      `,
      values: [
        email,
        '%' + search.toLowerCase() + '%',
        limit + 1,
        (page - 1) * limit,
      ],
    });

    let hasNextPage;
    if (bookmarks.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      bookmarks: bookmarks.rows
        .slice(0, limit)
        .map(
          bookmark =>
            new Bookmark(bookmark.email, bookmark.name, bookmark.address)
        ),
    };
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
