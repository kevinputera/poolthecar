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
            `/api/trips/${encodeURIComponent(tid)}/bids/${encodeURIComponent(
              address
            )}`,
            {
              method: method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: value }),
            }
          );
          if (res.ok) {
            console.log('Bid update successful: ', res);
            if (method === 'PUT') {
              window.location.reload();
            } else {
              window.location = '/p/bids';
            }
          } else {
            console.log('Bid update failed: ', res);
            window.location.reload();
          }
        }
      } catch (error) {
        console.log('Bid update error: ', error);
        window.location.reload();
      }
    });
  }

  const reviewTextarea = document.getElementById('review-textarea');

  if (!!reviewTextarea) {
    reviewTextarea.value = reviewTextarea.getAttribute('content');
    const reviewUpdateBtn = document.getElementsByClassName(
      'update-review-btn'
    )[0];
    const reviewScoreSelect = document.getElementById('score-select');
    reviewScoreSelect.value = reviewScoreSelect.getAttribute('score');
    reviewUpdateBtn.addEventListener('click', async event => {
      event.preventDefault();
      let content = reviewTextarea.value;
      const tid = reviewTextarea.getAttribute('tid');
      const method =
        reviewTextarea.getAttribute('action') === 'Update' ? 'PUT' : 'POST';
      const score = reviewScoreSelect.value;
      try {
        const res = await fetch(
          `/api/trips/${encodeURIComponent(tid)}/reviews`,
          {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: score, content: content }),
          }
        );
        if (res.ok) {
          console.log('Review update/create successful: ', res);
          window.location.reload();
        } else {
          console.log('Review update/create failed: ', res);
          window.location.reload();
        }
      } catch (error) {
        console.log('Review update/create error: ', error);
        window.location.reload();
      }
    });
  }
});
