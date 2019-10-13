const { getClient } = require('../db');

class Message {
  constructor(id, sender, receiver, content, sent_on) {
    this.id = id || 0;
    this.sender = sender;
    this.receiver = receiver;
    this.content = content;
    this.sent_on = sent_on || new Date();
  }

  async save() {
    const client = await getClient();
    const res = await client.query({
      text: /* sql */ `
        INSERT INTO Messages (sender, receiver, content)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      values: [this.sender, this.receiver, this.content],
    });
    this.id = res.rows[0].id;
    this.sent_on = res.rows[0].sent_on;
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query(/* sql */ `
      DELETE FROM Messages
      WHERE id = this.id
    `);
    return this;
  }

  static async findByUsers(user1, user2) {
    const client = await getClient();
    const messages = await client.query({
      text: /* sql */ `
        SELECT id, sender, receiver, content, sent_on
        FROM Messages
        WHERE (sender = $1 AND receiver = $2)
        OR    (sender = $2 AND receiver = $1)
        ORDER BY sent_on ASC
      `,
      values: [user1, user2],
    });
    return messages.rows.map(
      message =>
        new Message(
          message.id,
          message.sender,
          message.receiver,
          message.content,
          message.sent_on
        )
    );
  }
}

module.exports = { Message };
