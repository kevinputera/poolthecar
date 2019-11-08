window.addEventListener('load', () => {
  const acceptBidButtons = document.getElementsByName('accept-bid-action');
  // console.log(acceptBidButtons);
  for (let acceptBidButton of acceptBidButtons) {
    acceptBidButton.addEventListener('click', async event => {
      event.preventDefault();
      let tid = acceptBidButton.getAttribute('tid');
      let address = acceptBidButton.getAttribute('address');
      let email = acceptBidButton.getAttribute('email');
      try {
        const res = await fetch(
          `/api/trips/${encodeURIComponent(tid)}/stop/${encodeURIComponent(
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
        }
      } catch (error) {
        console.log('Bid acception error: ', error);
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
      const min_price = stopValueInput.value;
      console.log(tid, address, min_price);
      try {
        const res = await fetch(
          `/api/trips/${encodeURIComponent(tid)}/stop/${encodeURIComponent(
            address
          )}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ min_price: min_price }),
          }
        );
        if (res.ok) {
          console.log('Stop update successful: ', res);
          window.location.reload();
        } else {
          console.log('Stop update failed: ', res);
        }
      } catch (error) {
        console.log('Stop update error: ', error);
      }
    });
  }
});
