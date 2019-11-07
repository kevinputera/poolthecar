window.addEventListener('load', () => {
  // Bookmark creation logic
  const newBookmarkForm = document.getElementById('new-bookmark-form');
  const newBookmarkButton = document.getElementById('new-bookmark-button');
  newBookmarkButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(newBookmarkForm);
      const { error } = await sendJSON('/api/bookmarks', 'POST', json);
      if (error) {
        alert(`New bookmark creation error\n${prettyFormatJSON(error)}`);
      } else {
        window.location.reload();
      }
    } catch (error) {
      alert(`New bookmark creation error\n${prettyFormatJSON(error)}`);
    }
  });
});
