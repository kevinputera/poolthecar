window.addEventListener('load', () => {
  // Logout logic
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

  // Driver signup logic
  const driverSignupButton = document.getElementById('driver-signup-button');
  if (driverSignupButton) {
    driverSignupButton.addEventListener('click', async event => {
      try {
        if (confirm('Would you wish to sign up as a driver?')) {
          const res = await fetch('/api/drivers', { method: 'POST' });
          if (res.ok) {
            // Reload page to get most recent change
            window.location.reload();
          } else {
            console.log('Driver signup failed');
          }
        } else {
          console.log('Driver signup cancelled');
        }
      } catch (error) {
        console.log('Driver signup error', error);
      }
    });
  }
});
