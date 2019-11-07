window.addEventListener('load', () => {
  // Account details update logic
  const userUpdateForm = document.getElementById('user-update-form');
  const userUpdateButton = document.getElementById('user-update-button');
  userUpdateButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(userUpdateForm);
      const { error } = await sendJSON('/api/users', 'PUT', json);
      if (error) {
        alert(`User update error\n${prettyFormatJSON(error)}`);
      } else {
        window.location.reload();
      }
    } catch (error) {
      alert(`User update error\n${prettyFormatJSON(error)}`);
    }
  });
});
