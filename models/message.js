const { makeSingleQuery } = require('../db');

class Message {
  constructor(mid, sender, receiver, content, sent_on) {
    this.mid = mid || 0;
    this.sender = sender;
    this.receiver = receiver;
    this.content = content;
    this.sent_on = sent_on || new Date();
  }

  async save() {
    const res = await makeSingleQuery({
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
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Messages
        WHERE mid = $1
      `,
      values: [this.mid],
    });
    return this;
  }

  static async findByMid(mid) {
    const messages = await makeSingleQuery({
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
    const messages = await makeSingleQuery({
      text: /* sql */ `
        SELECT mid, sender, receiver, content, sent_on
        FROM Messages
        WHERE (sender = $1 AND receiver = $2)
        OR    (sender = $2 AND receiver = $1)
        ORDER BY sent_on DESC
        LIMIT   $3
        OFFSET  $4
      `,
      values: [user1, user2, limit + 1, (page - 1) * limit],
    });

    let hasNextPage;
    if (messages.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      messages: messages.rows
        .slice(0, limit)
        .map(
          message =>
            new Message(
              message.mid,
              message.sender,
              message.receiver,
              message.content,
              message.sent_on
            )
        ),
    };
  }

  static async getUserChatList(email, page, limit) {
    const res = await makeSingleQuery({
      text: /* sql */ `
        WITH DistinctUserEmails(email) AS (
          SELECT DISTINCT
            CASE
              WHEN sender = $1 THEN receiver
              ELSE sender
            END
          FROM Messages
          WHERE sender = $1
          OR receiver = $1
        )
        SELECT email, (
          SELECT sent_on
          FROM Messages
          WHERE (sender = email AND receiver = $1)
          OR (sender = $1 AND receiver = email)
          ORDER BY sent_on DESC
          LIMIT 1
        ) AS last_contacted_on
        FROM DistinctUserEmails
        LIMIT $2
        OFFSET $3
      `,
      values: [email, limit + 1, (page - 1) * limit],
    });

    let hasNextPage;
    if (messages.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      userChatList: res.rows.slice(0, limit).map(row => ({
        email: row.email,
        lastContactedOn: row.last_contacted_on,
      })),
    };
  }
}

module.exports = { Message };
