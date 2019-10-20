const { getClient } = require('../db');
const { SHA256 } = require('crypto-js');

class User {
  constructor(
    email,
    secret,
    name,
    gender,
    phone,
    profilePhotoUrl,
    createdOn,
    updatedOn
  ) {
    this.email = email;
    this.secret = secret;
    this.name = name;
    this.gender = gender;
    this.phone = phone;
    // TODO: Remove default value below
    this.profilePhotoUrl =
      profilePhotoUrl ||
      'https://avatars2.githubusercontent.com/u/46835051?s=460&v=4';
    this.createdOn = createdOn;
    this.updatedOn = updatedOn;
  }

  async save() {
    const client = await getClient();
    const res = await client.query({
      text: /* sql */ `
        INSERT INTO Users (email, secret, name, gender, phone, profile_photo_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING created_on, updated_on
      `,
      values: [
        this.email,
        SHA256(this.secret).toString(),
        this.name,
        this.gender,
        this.phone,
        this.profilePhotoUrl,
      ],
    });
    this.createdOn = res.rows[0].created_on;
    this.updatedOn = res.rows[0].updated_on;
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

  static async findByEmail(email) {
    const client = await getClient();
    const users = await client.query({
      text: /* sql */ `
        SELECT *
        FROM Users
        WHERE email = $1
      `,
      values: [email],
    });
    const user = users.rows[0];
    return new User(
      user.email,
      user.secret,
      user.name,
      user.gender,
      user.phone,
      user.profile_photo_url,
      user.created_on,
      user.updated_on
    );
  }

  static async findAll() {
    const client = await getClient();
    const users = await client.query(/* sql */ `
      SELECT *
      FROM Users
    `);
    return users.rows.map(
      user =>
        new User(
          user.email,
          user.secret,
          user.name,
          user.gender,
          user.phone,
          user.profile_photo_url,
          user.created_on,
          user.updated_on
        )
    );
  }
}

module.exports = { User };
