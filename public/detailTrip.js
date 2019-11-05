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
});
