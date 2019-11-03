window.addEventListener('load', () => {
  // Bookmark creation logic
  const updateBookmarkForm = document.getElementById('update-bookmark-form');
  const updateBookmarkButton = document.getElementById(
    'update-bookmark-button'
  );
  updateBookmarkButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const formData = new FormData(updateBookmarkForm);
      const url = `/api/bookmarks/${encodeURIComponent(formData.get('name'))}`;
      formData.delete('name');
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromFormData(formData),
      });
      if (res.ok) {
        window.location.href = '/p/bookmarks';
      } else {
        console.log('Update bookmark failed');
      }
    } catch (error) {
      console.log('Update bookmark error', error);
    }
  });
});
