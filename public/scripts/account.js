window.addEventListener('load', () => {
  // Account details update logic
  const userUpdateForm = document.getElementById('user-update-form');
  const userUpdateButton = document.getElementById('user-update-button');
  userUpdateButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromHTMLForm(userUpdateForm),
      });
      if (res.ok) {
        // Reload page
        window.location.reload();
      } else {
        console.log('User update failed');
      }
    } catch (error) {
      console.log('User update error', error);
    }
  });
});
