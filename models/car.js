const { getClient } = require('../db');

class Car {
  constructor(license, email, model, seats, manufacturedOn) {
    this.license = license;
    this.email = email;
    this.model = model;
    this.seats = seats;
    this.manufacturedOn = manufacturedOn;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Cars (license, email, model, seats, manufactured_on)
        VALUES ($1, $2, $3, $4, $5)
      `,
      values: [
        this.license,
        this.email,
        this.model,
        this.seats,
        this.manufacturedOn,
      ],
    });
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Cars
        WHERE license = $1
      `,
      values: [this.license],
    });
    return this;
  }

  static async findByDriver(email, page, limit) {
    const client = await getClient();
    const cars = await client.query({
      text: /* sql */ `
      SELECT license, email, model, seats, manufactured_on
      FROM Cars
      WHERE email = $1
      LIMIT  $2
      OFFSET $3
      `,
      values: [email, page * limit, (page - 1) * limit],
    });
    return cars.rows.map(
      car =>
        new Car(
          car.license,
          car.email,
          car.model,
          car.seats,
          car.manufactured_on
        )
    );
  }

  static async findByLicense(license, page, limit) {
    const client = await getClient();
    const cars = await client.query({
      text: /* sql */ `
      SELECT license, email, model, seats, manufactured_on
      FROM Cars
      WHERE license = $1
      LIMIT  $2
      OFFSET $3
      `,
      values: [license, page * limit, (page - 1) * limit],
    });
    return cars.rows[0];
  }
}

module.exports = { Car };
