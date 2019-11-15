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

  const updateTripStatusButton = document.getElementById('update-trip-status');
  updateTripStatusButton.addEventListener('click', async () => {
    const tid = updateTripStatusButton.getAttribute('tid');
    const status = updateTripStatusButton.getAttribute('status');
    const origin = updateTripStatusButton.getAttribute('origin');
    const seats = updateTripStatusButton.getAttribute('seats');
    const departingOn = updateTripStatusButton.getAttribute('departingOn');
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tid)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          origin: origin,
          seats: seats,
          departingOn: departingOn,
        }),
      });
      if (res.ok) {
        console.log('Update trip status successful');
        window.location.reload();
      } else {
        console.log('Update trip status failed');
        let error = await res.json();
        alert(`Update trip status failed:\n${prettyFormatJSON(error)}`);
        // window.location.reload();
      }
    } catch (error) {
      console.log('Trip status update error: ', error);
      alert(`Update trip status failed:\n${prettyFormatJSON(error)}`);
      // window.location.reload();
    }
  });
});
