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

  static async findByTid(tid) {
    const drivers = await makeSingleQuery({
      text: /* sql */ `
      SELECT  T.driver_email, U.secret, U.name, U.gender, U.phone,
              U.profile_photo_url, U.created_on, U.updated_on
      FROM DriverTrips T
      JOIN Users U ON T.driver_email = U.email
      WHERE T.tid = $1
      `,
      values: [tid],
    });
    if (drivers.rows.length < 1) {
      return null;
    }
    const row = drivers.rows[0];
    return new User(
      row.driver_email,
      row.secret,
      row.name,
      row.gender,
      row.phone,
      row.profile_photo_url,
      row.created_on,
      row.updated_on
    );
  }
}

module.exports = { Driver };
