window.addEventListener('load', () => {
  // Login logic
  const signupForm = document.getElementById('signup-form');
  const signupButton = document.getElementById('signup-button');
  signupButton.addEventListener('click', async event => {
    event.preventDefault();
    try {
      const res = await fetch('/api/auth/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromHTMLForm(signupForm),
      });
      if (res.ok) {
        // Redirect to browse page after successful login
        window.location.href = '/p/browse';
      } else {
        console.log('Signup failed');
      }
    } catch (error) {
      console.log('Signup error', error);
    }
  });
});
