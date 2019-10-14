const { getClient } = require('../db');

class User {
  constructor(email, secret, name, gender, phone, profile_photo_url) {
    this.email = email;
    // TODO: Hash secret and save it
    this.secret = secret;
    this.name = name;
    this.gender = gender;
    this.phone = phone;
    this.profile_photo_url = profile_photo_url;
    return this;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Users (email, secret, name, gender, phone, profile_photo_url)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [
        this.email,
        this.secret,
        this.name,
        this.gender,
        this.phone,
        this.profile_photo_url,
      ],
    });
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Users
        WHERE email = $1
      `,
      values: [this.email],
    });
    return this;
  }

  static async findAll() {
    const client = await getClient();
    const users = await client.query(
      `
      SELECT email, secret, name, gender, phone, profile_photo_url
      FROM Users
    `
    );
    return users.rows.map(
      user =>
        new User(
          user.email,
          user.secret,
          user.name,
          user.gender,
          user.phone,
          user.profile_photo_url
        )
    );
  }
}

module.exports = { User };
