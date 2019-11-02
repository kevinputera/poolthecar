const express = require('express');
const { User } = require('../../models/user');
const { Bookmark } = require('../../models/bookmark');
const {
  ok,
  badRequestMessage,
  internalError,
} = require('../../utils/response');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    ok(res, users);
  } catch (error) {
    internalError(res, error);
  }
});

router.post('/', async (req, res) => {
  const { email, secret, name, gender, phone, profilePhotoUrl } = req.body;
  try {
    const user = new User(email, secret, name, gender, phone, profilePhotoUrl);
    const savedUser = await user.save();
    ok(res, savedUser);
  } catch (error) {
    internalError(res, error);
  }
});

router.post('/:email/bookmarks', async (req, res) => {
  const email = req.params.email;
  const { name, address } = req.body;
  try {
    const bookmark = new Bookmark(email, name, address);
    const savedBookmark = await bookmark.save();
    ok(res, savedBookmark);
  } catch (error) {
    internalError(res, error);
  }
});

router.put('/:email/bookmarks/:name', async (req, res) => {
  const { email, name } = req.params;
  const address = req.body.address;
  try {
    const bookmark = Bookmark.findByEmailAndName(email, name);
    if (!bookmark) {
      badRequestMessage(res, 'Bookmark does not exist');
      return;
    }
    bookmark.address = address;
    const updatedBookmark = await bookmark.update();
    ok(res, updatedBookmark);
  } catch (error) {
    internalError(res, error);
  }
});

router.delete('/:email/bookmarks/:name', async (req, res) => {
  const { email, name } = req.params;
  try {
    const bookmark = Bookmark.findByEmailAndName(email, name);
    if (!bookmark) {
      badRequestMessage(res, 'Bookmark does not exist');
      return;
    }
    const deletedBookmark = bookmark.delete();
    ok(res, deletedBookmark);
  } catch (error) {
    internalError(res, error);
  }
});

module.exports = { userRoutes: router };
