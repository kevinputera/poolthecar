// Logout logic
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', async event => {
  const res = await fetch('/api/deauthenticate', { method: 'POST' });
  if (res.status === 200) {
    window.location.href = res.url;
  } else {
    console.log('Logout failed');
  }
});
