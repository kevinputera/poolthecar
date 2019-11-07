window.addEventListener('load', () => {
  // Logout logic
  const logoutButton = document.getElementById('logout-button');
  logoutButton.addEventListener('click', async event => {
    try {
      const { error } = await sendJSON('/api/auth/logout', 'POST');
      if (error) {
        alert(`Logout error\n${prettyFormatJSON(error)}`);
      } else {
        // Redirect to login screen after successful logout
        window.location.href = '/p/auth/login';
      }
    } catch (error) {
      alert(`Logout error\n${prettyFormatJSON(error)}`);
    }
  });

  // Driver signup logic
  const driverSignupButton = document.getElementById('driver-signup-button');
  if (driverSignupButton) {
    driverSignupButton.addEventListener('click', async event => {
      try {
        if (confirm('Would you wish to sign up as a driver?')) {
          const { error } = await sendJSON('/api/drivers', 'POST');
          if (error) {
            alert(`Driver signup error\n${prettyFormatJSON(error)}`);
          } else {
            window.location.reload();
          }
        }
      } catch (error) {
        alert(`Driver signup error\n${prettyFormatJSON(error)}`);
      }
    });
  }
});
