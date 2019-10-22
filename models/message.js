const { getClient } = require('../db');

class Message {
  constructor(mid, sender, receiver, content, sent_on) {
    this.mid = mid || 0;
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
        RETURNING mid, sent_on
      `,
      values: [this.sender, this.receiver, this.content],
    });
    this.mid = res.rows[0].mid;
    this.sent_on = res.rows[0].sent_on;
    return this;
  }

  async delete() {
    const client = await getClient();
    await client.query({
      text: /* sql */ `
        DELETE FROM Messages
        WHERE mid = $1
      `,
      values: [this.mid],
    });
    return this;
  }

  static async findByMid(mid) {
    const client = await getClient();
    const messages = await client.query({
      text: /* sql */ `
        SELECT mid, sender, receiver, content, sent_on
        FROM Messages
        WHERE mid = $1
      `,
      values: [mid],
    });
    const message = new Message(
      messages.rows[0].mid,
      messages.rows[0].sender,
      messages.rows[0].receiver,
      messages.rows[0].content,
      messages.rows[0].sent_on
    );
    return message;
  }

  static async findByUsers(user1, user2, page, limit) {
    const client = await getClient();
    const messages = await client.query({
      text: /* sql */ `
        SELECT mid, sender, receiver, content, sent_on
        FROM Messages
        WHERE (sender = $1 AND receiver = $2)
        OR    (sender = $2 AND receiver = $1)
        ORDER BY sent_on DESC
        LIMIT   $3
        OFFSET  $4
      `,
      values: [user1, user2, limit, (page - 1) * limit],
    });
    return messages.rows.map(
      message =>
        new Message(
          message.mid,
          message.sender,
          message.receiver,
          message.content,
          message.sent_on
        )
    );
  }
}

module.exports = { Message };
