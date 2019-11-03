window.addEventListener('load', () => {
  // Car creation logic
  const newCarForm = document.getElementById('new-car-form');
  const newCarButton = document.getElementById('new-car-button');
  newCarButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromHTMLForm(newCarForm),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        console.log('New car creation failed');
      }
    } catch (error) {
      console.log('New car creation error', error);
    }
  });
});
