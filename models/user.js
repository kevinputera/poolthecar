const { getClient } = require('../db');

class User {
  static tableName = 'Users';

  constructor(email, secret, name, gender, phone, profile_photo_url) {
    this.email = email;
    // TODO: Hash secret and save it
    this.secret = secret;
    this.name = name;
    this.gender = gender;
    this.phone = phone;
    this.profile_photo_url = profile_photo_url;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO $1 (email, secret, name, gender, phone, profile_photo_url)
        VALUES ($2, $3, $4, $5, $6, $7)
      `,
      values: [
        tableName,
        this.email,
        this.secret,
        this.name,
        this.gender,
        this.phone,
        this.profile_photo_url,
      ],
    });
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM $1
        WHERE email = $2
      `,
      values: [tableName, this.email],
    });
  }

  static async findAll() {
    const client = await getClient();
    const users = await client.query({
      text: /* sql */ `
      SELECT email, secret, name, gender, phone, profile_photo_url
      FROM $1
    `,
      values: [this.tableName],
    });
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

module.exports = { User: User };
