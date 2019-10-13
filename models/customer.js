import { User } from './user';

class Customer extends User {
  constructor(email, secret, name, gender, phone, profile_photo_url) {
    super(email, secret, name, gender, phone, profile_photo_url);
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
    await client.query({
      text: /* sql */ `
        INSERT INTO Customers (email)
        VALUES ($1)
      `,
      values: [this.email],
    });
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Customers
        WHERE email = $1
      `,
      values: [this.email],
    });
    await client.query({
      text: /* sql */ `
        DELETE FROM Users
        WHERE email = $1
      `,
      values: [this.email],
    });
  }

  static async findAll() {
    const client = await getClient();
    const customers = await client.query({
      text: /* sql */ `
      SELECT email, secret, name, gender, phone, profile_photo_url
      FROM Users NATURAL JOIN Customers
    `,
    });
    return customers.rows.map(
      customer =>
        new User(
          customer.email,
          customer.secret,
          customer.name,
          customer.gender,
          customer.phone,
          customer.profile_photo_url
        )
    );
  }
}

module.exports = { Customer: Customer };
