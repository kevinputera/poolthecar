window.addEventListener('load', () => {
  // Car update logic
  const updateCarForm = document.getElementById('update-car-form');
  const updateCarButton = document.getElementById('update-car-button');
  updateCarButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(updateCarForm);
      const url = `/api/cars/${encodeURIComponent(json.license)}`;
      delete json.license;

      const { error } = await sendJSON(url, 'PUT', json);
      if (error) {
        alert(`Update car error\n${prettyFormatJSON(error)}`);
      } else {
        // Redirect to cars page after successful update
        window.location.href = '/p/cars';
      }
    } catch (error) {
      alert(`Update car error\n${prettyFormatJSON(error)}`);
    }
  });
});
