const { getClient } = require('../db');

class Review {
  constructor(email, tid, score, content) {
    this.email = email;
    this.tid = tid;
    this.score = score;
    this.content = content;
  }

  async add() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        INSERT INTO Reviews (email, tid, score, content)
        VALUES ($1, $2, $3, $4)
      `,
      values: [this.email, this.tid, this.score, this.content],
    });
  }

  async update() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        UPDATE Reviews SET score = $3, content = $4
        WHERE email = $1 AND tid = $2
      `,
      values: [this.email, this.tid, this.score, this.content],
    });
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Reviews
        WHERE email = $1 AND tid = $2
      `,
      values: [this.email, this.tid],
    });
  }

  static async findAll() {
    const client = await getClient();
    const reviews = await client.query({
      text: /* sql */ `
        SELECT email, tid, score, content FROM Reviews
      `,
    });
    return reviews.rows.map(
      review =>
        new Review(review.email, review.tid, review.score, review.content)
    );
  }
}

module.exports = { Review: Review };
