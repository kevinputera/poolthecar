window.addEventListener('load', () => {
  const acceptBidButtons = document.getElementsByName('accept-bid-action');
  for (let acceptBidButton of acceptBidButtons) {
    acceptBidButton.addEventListener('click', async event => {
      event.preventDefault();
      let tid = acceptBidButton.getAttribute('tid');
      let address = acceptBidButton.getAttribute('address');
      let email = acceptBidButton.getAttribute('email');
      try {
        const res = await fetch(
          `/api/trips/${encodeURIComponent(tid)}/stops/${encodeURIComponent(
            address
          )}/accept`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
          }
        );
        if (res.ok) {
          console.log('Bid acception successful: ', res.json());
          window.location.reload();
        } else {
          console.log('Bid acception failed: ', res.json());
          window.location.reload();
        }
      } catch (error) {
        console.log('Bid acception error: ', error);
        window.location.reload();
      }
    });
  }

  const updateStopButtons = document.getElementsByName('update-stop-action');
  for (let updateStopButton of updateStopButtons) {
    updateStopButton.addEventListener('click', async () => {
      const tid = updateStopButton.getAttribute('tid');
      const address = updateStopButton.getAttribute('address');
      const stopValueInput = document.getElementById(
        'stop-update-input-' + address
      );
      const minPrice = stopValueInput.value;
      try {
        const res = await fetch(
          `/api/trips/${encodeURIComponent(tid)}/stops/${encodeURIComponent(
            address
          )}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ minPrice: minPrice }),
          }
        );
        if (res.ok) {
          console.log('Stop update successful: ', res);
          window.location.reload();
        } else {
          console.log('Stop update failed: ', res);
          window.location.reload();
        }
      } catch (error) {
        console.log('Stop update error: ', error);
        window.location.reload();
      }
    });
  }
});
