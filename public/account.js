// Account details update logic
window.addEventListener('load', () => {
  const userUpdateForm = document.getElementById('user-update-form');
  const userUpdateButton = document.getElementById('user-update-button');
  userUpdateButton.addEventListener('click', async event => {
    event.preventDefault();

    const formData = new FormData(userUpdateForm);
    const urlEncodedPairs = [];
    formData.forEach((value, key) => {
      urlEncodedPairs.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(value)
      );
    });
    const urlEncodedBody = urlEncodedPairs.join('&').replace(/%20/g, '+');

    try {
      const res = await fetch(`/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncodedBody,
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
