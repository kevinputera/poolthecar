const express = require('express');

const router = express.Router();

router.get('/:tid', async (req, res) => {
  const { email } = req.session;

  res.render('detailBid', {
    title: 'Detailed Bidding',
  });
});

module.exports = { detailBidRoutes: router };
