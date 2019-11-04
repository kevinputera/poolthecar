window.addEventListener('load', () => {
  const bookmarksDeleteButtons = document.getElementsByClassName(
    'bookmarks-delete-button'
  );
  for (let i = 0; i < bookmarksDeleteButtons.length; i++) {
    bookmarksDeleteButtons[i].addEventListener('click', async event => {
      event.preventDefault();
      const bookmarkName = bookmarksDeleteButtons[i].getAttribute('for-name');
      try {
        const res = await fetch(
          `/api/bookmarks/${encodeURIComponent(bookmarkName)}`,
          {
            method: 'DELETE',
          }
        );
        if (res.ok) {
          window.location.reload();
        } else {
          console.log('Bookmark deletion failed');
        }
      } catch (error) {
        console.log('Bookmark deletion error', error);
      }
    });
  }
});
