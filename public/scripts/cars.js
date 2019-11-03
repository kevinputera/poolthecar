window.addEventListener('load', () => {
  const carsDeleteButtons = document.getElementsByClassName(
    'cars-delete-button'
  );
  for (let i = 0; i < carsDeleteButtons.length; i++) {
    carsDeleteButtons[i].addEventListener('click', async event => {
      event.preventDefault();
      const carLicense = carsDeleteButtons[i].getAttribute('for-license');
      if (confirm(`Would you like to delete car ${carLicense}?`)) {
        try {
          const res = await fetch(
            `/api/cars/${encodeURIComponent(carLicense)}`,
            {
              method: 'DELETE',
            }
          );
          if (res.ok) {
            window.location.reload();
          } else {
            console.log('Car deletion failed');
          }
        } catch (error) {
          console.log('Car deletion error', error);
        }
      }
    });
  }
});
