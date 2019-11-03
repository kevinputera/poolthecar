const express = require('express');
const { Bookmark } = require('../../models/bookmark');
const { ok, internalError } = require('../../utils/response');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.session;
  const { name, address } = req.body;
  try {
    const bookmark = new Bookmark(email, name, address);
    const savedBookmark = await bookmark.save();
    ok(res, savedBookmark);
  } catch (error) {
    internalError(res, error);
  }
});

router.delete('/:name', async (req, res) => {
  const { email } = req.session;
  const { name } = req.params;
  try {
    const bookmark = await Bookmark.findByEmailAndName(email, name);
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

router.put('/:name', async (req, res) => {
  const { email } = req.session;
  const { name } = req.params;
  const { address } = req.body;
  try {
    const bookmark = await Bookmark.findByEmailAndName(email, name);
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

module.exports = { bookmarkRoutes: router };
