window.addEventListener('load', () => {
  // Login logic
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromHTMLForm(loginForm),
      });
      if (res.ok) {
        // Redirect to browse page after successful login
        window.location.href = '/p/browse';
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.log('Login error', error);
    }
  });
});
