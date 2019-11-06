window.addEventListener('load', () => {
  // Trip creation logic
  const newTripForm = document.getElementById('new-trip-form');
  const newTripButton = document.getElementById('new-trip-button');
  newTripButton.addEventListener('click', async event => {
    event.preventDefault();

    const formData = new FormData(newTripForm);
    const departingOnISOFormat = new Date(
      formData.get('departingOn')
    ).toISOString();
    formData.set('departingOn', departingOnISOFormat);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromFormData(formData),
      });
      if (res.ok) {
        // TODO: Redirect to trip management page
        window.location.reload();
      } else {
        console.log('New trip creation failed');
      }
    } catch (error) {
      console.log('New trip creation error', error);
    }
  });
});
