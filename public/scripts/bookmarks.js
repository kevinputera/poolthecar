window.addEventListener('load', () => {
  const bookmarksDeleteButtons = document.getElementsByClassName(
    'bookmarks-delete-button'
  );
  for (let i = 0; i < bookmarksDeleteButtons.length; i++) {
    bookmarksDeleteButtons[i].addEventListener('click', async event => {
      event.preventDefault();
      const bookmarkName = bookmarksDeleteButtons[i].getAttribute('for-name');
      if (confirm(`Would you like to delete bookmark ${bookmarkName}?`)) {
        try {
          const { error } = await sendJSON(
            `/api/bookmarks/${encodeURIComponent(bookmarkName)}`,
            'DELETE'
          );
          if (error) {
            alert(`Bookmark deletion error\n${prettyFormatJSON(error)}`);
          } else {
            window.location.reload();
          }
        } catch (error) {
          alert(`Bookmark deletion error\n${prettyFormatJSON(error)}`);
        }
      }
    });
  }
});
