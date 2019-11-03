window.addEventListener('load', () => {
  // Bookmark creation logic
  const newBookmarkForm = document.getElementById('new-bookmark-form');
  const newBookmarkButton = document.getElementById('new-bookmark-button');
  newBookmarkButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromHTMLForm(newBookmarkForm),
      });
      if (res.ok) {
        // Reload page
        window.location.reload();
      } else {
        console.log('New bookmark creation failed');
      }
    } catch (error) {
      console.log('New bookmark creation error', error);
    }
  });
});
