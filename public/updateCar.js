window.addEventListener('load', () => {
  // Car creation logic
  const updateCarForm = document.getElementById('update-car-form');
  const updateCarButton = document.getElementById('update-car-button');
  updateCarButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const formData = new FormData(updateCarForm);
      const url = `/api/cars/${encodeURIComponent(formData.get('license'))}`;
      formData.delete('license');

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromFormData(formData),
      });

      if (res.ok) {
        // Redirect to cars page after successful update
        window.location.href = '/p/cars';
      } else {
        console.log('Update car failed');
      }
    } catch (error) {
      console.log('Update car error', error);
    }
  });
});
