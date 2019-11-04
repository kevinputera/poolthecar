const express = require('express');
const { Bookmark } = require('../../models/bookmark');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

router.get('/', async (req, res) => {
  const { name } = req.query;
  const { email } = req.session;

  let bookmarks;
  if (name) {
    bookmarks = await Bookmark.findAllByEmailAndLikeName(email, name);
  } else {
    bookmarks = await Bookmark.findAllByEmail(email);
  }

  const isDriver = await checkIsDriver(email);

  res.render('bookmark/bookmarks', {
    title: 'Bookmarks',
    query: req.query,
    isDriver,
    bookmarks,
  });
});

router.get('/new', async (req, res) => {
  const isDriver = await checkIsDriver(email);
  res.render('bookmark/newBookmark', { title: 'New bookmark', isDriver });
});

router.get('/:name/update', async (req, res) => {
  const { email } = req.session;
  const { name } = req.params;
  const bookmark = await Bookmark.findByEmailAndName(email, name);
  const isDriver = await checkIsDriver(email);
  res.render('bookmark/updateBookmark', {
    title: 'Update bookmark',
    isDriver,
    bookmark,
  });
});

module.exports = { bookmarkPageRoutes: router };
