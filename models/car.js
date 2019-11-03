const { makeSingleQuery } = require('../db');

class Car {
  constructor(license, email, model, seats, manufacturedOn) {
    this.license = license;
    this.email = email;
    this.model = model;
    this.seats = seats;
    this.manufacturedOn = manufacturedOn;
  }

  async save() {
    await makeSingleQuery({
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

  async update() {
    await makeSingleQuery({
      text: /* sql */ `
        UPDATE Cars
        SET model = $1, seats = $2, manufactured_on = $3
        WHERE license = $4
      `,
      values: [this.model, this.seats, this.manufacturedOn, this.license],
    });
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Cars
        WHERE license = $1
      `,
      values: [this.license],
    });
    return this;
  }

  static async findAllByEmailAndSearchQuery(email, search, page, limit) {
    const cars = await makeSingleQuery({
      text: /* sql */ `
        SELECT license, email, model, seats, manufactured_on
        FROM Cars
        WHERE email = $1
        AND (LOWER(license) LIKE $2 OR LOWER(model) LIKE $2)
        LIMIT  $3
        OFFSET $4
      `,
      values: [
        email,
        '%' + search.toLowerCase() + '%',
        limit + 1,
        (page - 1) * limit,
      ],
    });

    let hasNextPage;
    if (cars.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      cars: cars.rows
        .slice(0, limit)
        .map(
          car =>
            new Car(
              car.license,
              car.email,
              car.model,
              car.seats,
              car.manufactured_on
            )
        ),
    };
  }

  static async findByLicense(license) {
    const cars = await makeSingleQuery({
      text: /* sql */ `
      SELECT license, email, model, seats, manufactured_on
      FROM Cars
      WHERE license = $1
      `,
      values: [license],
    });

    const car = new Car(
      cars.rows[0].license,
      cars.rows[0].email,
      cars.rows[0].model,
      cars.rows[0].seats,
      cars.rows[0].manufactured_on
    );
    return car;
  }
}

module.exports = { Car };
