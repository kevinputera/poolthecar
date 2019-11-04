window.addEventListener('load', () => {
  // const acceptBidButtons = document.getElementsByName("accept-bid-action");
  const acceptBidForms = document.getElementsByClassName('bid-acceptance-form');
  // console.log(acceptBidButtons);
  for (let acceptBidForm of acceptBidForms) {
    // acceptBidButton = acceptBidForm.children.getElementsByName("accept-bid-action");
    let acceptBidButton;
    for (let child of acceptBidForm.children) {
      if (child.className.includes('table-cell-action')) {
        acceptBidButton = child;
      }
    }
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
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: getURLEncodedStringFromHTMLForm(acceptBidForm),
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
