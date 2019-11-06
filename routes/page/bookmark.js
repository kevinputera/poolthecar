const express = require('express');
const { Bookmark } = require('../../models/bookmark');
const { checkIsDriver } = require('../../utils/checkIsDriver');

const router = express.Router();

const BOOKMARKS_PAGE_LIMIT = 15;

router.get('/', async (req, res) => {
  const { search = '', page = 1 } = req.query;
  const { email } = req.session;

  const {
    hasNextPage,
    bookmarks,
  } = await Bookmark.findAllByEmailAndSearchQuery(
    email,
    search,
    +page,
    BOOKMARKS_PAGE_LIMIT
  );

  let nextPageUrl;
  let prevPageUrl;
  if (search) {
    nextPageUrl = `/p/bookmarks?search=${search}&page=${+page + 1}`;
    prevPageUrl = `/p/bookmarks?search=${search}&page=${+page - 1}`;
  } else {
    nextPageUrl = `/p/bookmarks?page=${+page + 1}`;
    prevPageUrl = `/p/bookmarks?page=${+page - 1}`;
  }

  const isDriver = await checkIsDriver(email);

  res.render('bookmark/bookmarks', {
    title: 'Bookmarks',
    isDriver,
    hasPrevPage: +page !== 1,
    hasNextPage,
    nextPageUrl,
    prevPageUrl,
    search,
    bookmarks,
  });
});

router.get('/new', async (req, res) => {
  const { email } = req.session;
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
