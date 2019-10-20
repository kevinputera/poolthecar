const express = require('express');
const { Database } = require('../db');
const { Message } = require('../models/message.js');

const router = express.Router();

router.get('/', async (req, res) => {
  const user1 = req.query.user1;
  const user2 = req.query.user2;
  const messages = await Message.findByUsers(user1, user2);

  res.json(messages);
});

router.post('/', async (req, res) => {
  console.log(req.body);
  const { sender, receiver, content } = req.body;
  const message = new Message(null, sender, receiver, content, null);
  console.log(message);
  await message.save();
  res.json(message);
});

module.exports = { messageRoutes: router };
