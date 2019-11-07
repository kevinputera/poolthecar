window.addEventListener('load', () => {
  // Bookmark update logic
  const updateBookmarkForm = document.getElementById('update-bookmark-form');
  const updateBookmarkButton = document.getElementById(
    'update-bookmark-button'
  );
  updateBookmarkButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(updateBookmarkForm);
      const url = `/api/bookmarks/${encodeURIComponent(json.name)}`;
      delete json.name;

      const { error } = await sendJSON(url, 'PUT', json);
      if (error) {
        alert(`Update bookmark error\n${prettyFormatJSON(error)}`);
      } else {
        // Redirect to bookmarks page after successful update
        window.location.href = '/p/bookmarks';
      }
    } catch (error) {
      alert(`Update bookmark error\n${prettyFormatJSON(error)}`);
    }
  });
});
