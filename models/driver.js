const { makeSingleQuery } = require('../db');
const { User } = require('./user');

class Driver {
  constructor(email) {
    this.email = email;
  }

  async save() {
    await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Drivers (email)
        VALUES ($1)
      `,
      values: [this.email],
    });
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Drivers
        WHERE email = $1
      `,
      values: [this.email],
    });
    return this;
  }

  static async findByEmailWithUser(email) {
    const drivers = await makeSingleQuery({
      text: /* sql */ `
        SELECT D.email, U.secret, U.name, U.gender, U.phone, U.profile_photo_url, U.created_on, U.updated_on
        FROM Drivers D NATURAL JOIN Users U
        WHERE D.email = $1
      `,
      values: [email],
    });
    if (drivers.rows.length === 0) {
      return null;
    }

    const driver = new Driver(drivers.rows[0].email);
    driver.user = new User(
      drivers.rows[0].email,
      drivers.rows[0].secret,
      drivers.rows[0].name,
      drivers.rows[0].gender,
      drivers.rows[0].phone,
      drivers.rows[0].profile_photo_url,
      drivers.rows[0].created_on,
      drivers.rows[0].updated_on
    );

    return driver;
  }
}

module.exports = { Driver };
