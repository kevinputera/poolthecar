window.addEventListener('load', () => {
  const bidRows = document.getElementsByName('bid-row');
  for (let bidRow of bidRows) {
    bidRow.addEventListener('click', () => {
      window.location = '/p/detailBid/' + bidRow.id;
    });
  }
});
