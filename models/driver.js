const { getClient } = require('../db');

class Driver {
  constructor(email) {
    this.email = email;
  }

  async save() {
    const client = await getClient();
		await client.query({
			text: /* sql */ `
				INSERT INTO drivers (email)
				VALUES ($1)
			`,
			values: [
				this.email
			]
		});
	}
	
	async delete() {
		const client = await getClient();
		await client.query({
			text: /* sql */ `
				DELETE FROM drivers
				WHERE email = $1
			`,
			values: [this.email],
		});
	}

	static async findll() {
		const client = await getClient();
		const drivers = await client.query(/* sql */ `
			SELECT email
			FROM accounts
		`);
		return drivers.rows.map(
			driver =>
				new Driver(
					driver.email
				)
		);
	}
}

module.exports = { Driver };