window.addEventListener('load', () => {
  // Login logic
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(loginForm);
      const { error } = await sendJSON('/api/auth/login', 'POST', json);
      if (error) {
        alert(`Login error\n${prettyFormatJSON(error)}`);
      } else {
        // Redirect to browse page after successful login
        window.location.href = '/p/browse';
      }
    } catch (error) {
      alert(`Login error\n${prettyFormatJSON(error)}`);
    }
  });
});
