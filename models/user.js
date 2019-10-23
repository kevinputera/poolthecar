const { makeSingleQuery } = require('../db');
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
    this.profilePhotoUrl = profilePhotoUrl;
    this.createdOn = createdOn;
    this.updatedOn = updatedOn;
  }

  async save() {
    const res = await makeSingleQuery({
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
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Users
        WHERE email = $1
      `,
      values: [this.email],
    });
    return this;
  }

  static async findByEmail(email) {
    const users = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, secret, name, gender, phone, profile_photo_url, created_on, updated_on
        FROM Users
        WHERE email = $1
      `,
      values: [email],
    });
    if (users.rows.length === 0) {
      return null;
    }
    return new User(
      users.rows[0].email,
      users.rows[0].secret,
      users.rows[0].name,
      users.rows[0].gender,
      users.rows[0].phone,
      users.rows[0].profile_photo_url,
      users.rows[0].created_on,
      users.rows[0].updated_on
    );
  }

  static async findAll() {
    const users = await makeSingleQuery(/* sql */ `
      SELECT email, secret, name, gender, phone, profile_photo_url, created_on, updated_on
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
