const express = require('express');
const { User } = require('../models/user');
const { Bookmark } = require('../models/bookmark');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/', async (req, res) => {
  const { email, secret, name, gender, phone, profilePhotoUrl } = req.body;
  try {
    const user = new User(email, secret, name, gender, phone, profilePhotoUrl);
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/:email/bookmarks', async (req, res) => {
  const email = req.params.email;
  const { name, address } = req.body;
  try {
    const bookmark = new Bookmark(email, name, address);
    const savedBookmark = await bookmark.save();
    res.json(savedBookmark);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put('/:email/bookmarks/:name', async (req, res) => {
  const { email, name } = req.params;
  const address = req.body.address;
  try {
    const bookmark = Bookmark.findByEmailAndName(email, name);
    if (!bookmark) {
      res.status(400).send('Bookmark does not exist');
      return;
    }
    bookmark.address = address;
    const updatedBookmark = await bookmark.update();
    res.json(updatedBookmark);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = { userRoutes: router };
