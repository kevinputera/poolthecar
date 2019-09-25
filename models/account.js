const { getClient } = require('../db');

class Account {
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
        INSERT INTO accounts (email, secret, name, gender, phone, profile_photo_url)
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
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM accounts
        WHERE email = $1
      `,
      values: [this.email],
    });
  }

  static async findAll() {
    const client = await getClient();
    const accounts = await client.query(/* sql */ `
      SELECT email, secret, name, gender, phone, profile_photo_url
      FROM accounts
    `);
    return accounts.rows.map(
      account =>
        new Account(
          account.email,
          account.secret,
          account.name,
          account.gender,
          account.phone,
          account.profile_photo_url
        )
    );
  }
}

module.exports = { Account };
