window.addEventListener('load', () => {
  // Bid creation logic
  const newBidForm = document.getElementById('new-bid-form');
  const newBidButton = document.getElementById('new-bid-button');
  newBidButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(newBidForm);
      const { error } = await sendJSON(
        `/api/trips/${newBidTid}/bids`,
        'POST',
        json
      );
      if (error) {
        alert(`New bid creation error\n${prettyFormatJSON(error)}`);
      } else {
        window.location.href = '/p/browse';
      }
    } catch (error) {
      alert(`New bid creation error\n${prettyFormatJSON(error)}`);
    }
  });
});
