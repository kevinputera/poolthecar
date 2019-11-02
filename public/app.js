// Logout logic
window.addEventListener('load', () => {
  const logoutButton = document.getElementById('logout-button');
  logoutButton.addEventListener('click', async event => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = res.url;
      } else {
        console.log('Logout failed');
      }
    } catch (error) {
      console.log('Logout error', error);
    }
  });
});
