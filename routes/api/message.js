const express = require('express');
const { Message } = require('../../models/message.js');
const {
  ok,
  badRequestMessage,
  internalError,
} = require('../../utils/response');

const router = express.Router();

router.post('/', async (req, res) => {
  const { sender, receiver, content } = req.body;
  const message = new Message(null, sender, receiver, content, null);
  try {
    const savedMessage = await message.save();
    ok(res, savedMessage);
  } catch (error) {
    internalError(res, error);
  }
});

router.delete('/:mid', async (req, res) => {
  const mid = req.params.mid;
  try {
    const message = await Message.findByMid(mid);
    if (!message) {
      badRequestMessage(res, 'Message does not exist');
      return;
    }
    const deletedMessage = await message.delete();
    ok(res, deletedMessage);
  } catch (error) {
    internalError(res, error);
  }
});

module.exports = { messageRoutes: router };
