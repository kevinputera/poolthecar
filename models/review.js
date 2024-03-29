const { makeSingleQuery } = require('../db');

class Review {
  constructor(email, tid, score, content, created_on, updated_on) {
    this.email = email;
    this.tid = tid;
    this.score = score;
    this.content = content;
    this.created_on = created_on;
    this.updated_on = updated_on;
  }

  async save() {
    const reviews = await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Reviews (email, tid, score, content)
        VALUES ($1, $2, $3, $4)
        RETURNING created_on, updated_on
      `,
      values: [this.email, this.tid, this.score, this.content],
    });
    this.created_on = reviews.rows[0].created_on;
    this.updated_on = reviews.rows[0].updated_on;
    return this;
  }

  async update() {
    const reviews = await makeSingleQuery({
      text: /* sql */ `
        UPDATE Reviews SET score = $3, content = $4, updated_on = NOW()
        WHERE email = $1 AND tid = $2
        RETURNING updated_on
      `,
      values: [this.email, this.tid, this.score, this.content],
    });
    this.updated_on = reviews.rows[0].updated_on;
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Reviews
        WHERE email = $1 AND tid = $2
      `,
      values: [this.email, this.tid],
    });
    return this;
  }

  static async findByEmailAndTid(email, tid) {
    const reviews = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, tid, score, content, created_on, updated_on
        FROM Reviews
        WHERE email = $1 AND tid = $2
      `,
      values: [email, tid],
    });
    if (reviews.rows.length < 1) {
      return null;
    }
    const review = reviews.rows[0];
    return new Review(
      review.email,
      review.tid,
      review.score,
      review.content,
      review.created_on,
      review.updated_on
    );
  }

  static async findByTrip(tid) {
    const reviews = await makeSingleQuery({
      text: /* sql */ `
        SELECT email, tid, score, content, created_on, updated_on
        FROM Reviews
        WHERE tid = $1
      `,
      values: [tid],
    });
    return reviews.rows.map(
      review =>
        new Review(
          review.email,
          review.tid,
          review.score,
          review.content,
          review.created_on,
          review.updated_on
        )
    );
  }
}

module.exports = { Review };
