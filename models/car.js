const { getClient } = require('../db');

class Car {
  constructor(license, model, seats, year) {
    this.license = license;
    this.model = model;
    this.seats = seats;
    this.year = year;
  }

  async save() {
    const client = await getClient();
		await client.query({
			text: /* sql */ `
				INSERT INTO cars (license, model, seats, year)
				VALUES ($1, $2, $3, $4)
			`,
			values: [
          this.license,
          this.model,
          this.seats,
          this.year
			]
		});
	}
	
	async delete() {
		const client = await getClient();
		await client.query({
			text: /* sql */ `
				DELETE FROM cars
				WHERE license = $1
			`,
			values: [this.license],
		});
	}

	static async findll() {
		const client = await getClient();
		const cars = await client.query(/* sql */ `
			SELECT license, model, seats, year
			FROM cars
		`);
		return cars.rows.map(
			car =>
				new Car(
          car.license,
          car.model,
          car.seats,
          car.year
				)
		);
	}
}

module.exports = { Car };