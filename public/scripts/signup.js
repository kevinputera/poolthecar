window.addEventListener('load', () => {
  // Login logic
  const signupForm = document.getElementById('signup-form');
  const signupButton = document.getElementById('signup-button');
  signupButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const json = getJSONFromHTMLForm(signupForm);
      const { error } = await sendJSON('/api/auth/new', 'POST', json);
      if (error) {
        alert(`Signup error\n${prettyFormatJSON(error)}`);
      } else {
        // Redirect to browse page after successful login
        window.location.href = '/p/browse';
      }
    } catch (error) {
      alert(`Signup error\n${prettyFormatJSON(error)}`);
    }
  });
});
