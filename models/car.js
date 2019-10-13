const { getClient } = require('../db');

class Car {
  constructor(license, email, model, seats, year) {
    this.license = license;
    this.email = email;
    this.model = model;
    this.seats = seats;
    this.year = year;
  }

  async save() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Cars (license, email, model, seats, year)
        VALUES ($1, $2, $3, $4, $5)
      `,
      values: [this.license, this.email, this.model, this.seats, this.year],
    });
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
  }

  static async findAll() {
    const client = await getClient();
    const cars = await client.query(/* sql */ `
      SELECT license, email, model, seats, year
      FROM Cars
    `);
    return cars.rows.map(
      car => new Car(car.license, car.email, car.model, car.seats, car.year)
    );
  }
}

module.exports = { Car };
