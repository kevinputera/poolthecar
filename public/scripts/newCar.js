window.addEventListener('load', () => {
  // Car creation logic
  const newCarForm = document.getElementById('new-car-form');
  const newCarButton = document.getElementById('new-car-button');
  newCarButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(newCarForm);
      const { error } = await sendJSON('/api/cars', 'POST', json);
      if (error) {
        alert(`New car creation error\n${prettyFormatJSON(error)}`);
      } else {
        window.location.reload();
      }
    } catch (error) {
      alert(`New car creation error\n${prettyFormatJSON(error)}`);
    }
  });
});
