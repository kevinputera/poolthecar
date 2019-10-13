const { getClient } = require('../db');

class Own {
  constructor(email, license) {
    this.email = email;
    this.license = license;
  }

  async save() {
    const client = await getClient();
		await client.query({
			text: /* sql */ `
				INSERT INTO owns (email, license)
				VALUES ($1, $2)
			`,
			values: [
          this.email,
          this.license
			]
		});
	}
	
	async delete() {
		const client = await getClient();
		await client.query({
			text: /* sql */ `
				DELETE FROM owns
				WHERE email = $1 AND license = $2
			`,
      values: [
        this.email,
        this.license
      ],
		});
	}

	static async findll() {
		const client = await getClient();
		const owns = await client.query(/* sql */ `
			SELECT email, license
			FROM owns
		`);
		return owns.rows.map(
			own =>
				new Own(
          own.email,
          own.license
				)
		);
	}
}

module.exports = { Own };