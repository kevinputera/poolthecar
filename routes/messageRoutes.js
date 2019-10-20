const express = require('express');
const { Database } = require('../db');
const { Message } = require('../models/message.js');

const router = express.Router();

router.get('/', async (req, res) => {
  const user1 = req.query.user1;
  const user2 = req.query.user2;
  const page = req.query.page;
  const limit = req.query.page;
  try {
    const messages = await Message.findByUsers(user1, user2, page, limit);
    res.json(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/', async (req, res) => {
  const { sender, receiver, content } = req.body;
  const message = new Message(null, sender, receiver, content, null);
  try {
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = { messageRoutes: router };
