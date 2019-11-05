window.addEventListener('load', () => {
  const bidActionButtons = document.getElementsByName('bid-action');
  for (let bidActionButton of bidActionButtons) {
    bidActionButton.addEventListener('click', async event => {
      event.preventDefault();
      let tid = bidActionButton.getAttribute('tid');
      let address = bidActionButton.getAttribute('address');
      let action = bidActionButton.getAttribute('action');
      let value = document.getElementById(address).value;
      let method = value <= 0 ? 'DELETE' : 'PUT';
      try {
        if (action === 'Update') {
          const res = await fetch(
            `/api/trips/${encodeURIComponent(
              tid
            )}/bidding/stop/${encodeURIComponent(address)}`,
            {
              method: method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: value }),
            }
          );
          if (res.ok) {
            console.log('Bid update successful: ', res.json());
            if (method === 'PUT') {
              window.location.reload();
            } else {
              window.location = '/p/bids';
            }
          } else {
            console.log('Bid update failed: ', res.json());
          }
        }
      } catch (error) {
        console.log('Bid update error: ', error);
      }
    });
  }
});
