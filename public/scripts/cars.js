window.addEventListener('load', () => {
  const carsDeleteButtons = document.getElementsByClassName(
    'cars-delete-button'
  );
  for (let i = 0; i < carsDeleteButtons.length; i++) {
    carsDeleteButtons[i].addEventListener('click', async event => {
      event.preventDefault();
      const carLicense = carsDeleteButtons[i].getAttribute('data-license');
      if (confirm(`Would you like to delete car ${carLicense}?`)) {
        try {
          const { error } = await sendJSON(
            `/api/cars/${encodeURIComponent(carLicense)}`,
            'DELETE'
          );
          if (error) {
            alert(`Car deletion error\n${prettyFormatJSON(error)}`);
          } else {
            window.location.reload();
          }
        } catch (error) {
          alert(`Car deletion error\n${prettyFormatJSON(error)}`);
        }
      }
    });
  }
});
