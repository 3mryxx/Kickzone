/* ===================================================
   KICKZONE — Login Page Script
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Redirect if already logged in
  if (localStorage.getItem('kickzone_user')) {
    window.location.href = '../browse/index.html';
    return;
  }

  const form     = document.getElementById('login-form');
  const emailInp = document.getElementById('email');
  const pwInp    = document.getElementById('password');
  const btn      = document.getElementById('login-btn');

  // Validation helpers
  function validateEmail() {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp.value.trim());
    emailInp.classList.toggle('error', !ok);
    document.getElementById('email-err').classList.toggle('show', !ok);
    return ok;
  }
  
  function validatePw() {
    const ok = pwInp.value.length >= 6;
    pwInp.classList.toggle('error', !ok);
    document.getElementById('pw-err').classList.toggle('show', !ok);
    return ok;
  }

  emailInp.addEventListener('blur', validateEmail);
  pwInp.addEventListener('blur', validatePw);

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eOk = validateEmail();
    const pOk = validatePw();
    if (!eOk || !pOk) return;

    btn.disabled    = true;
    btn.textContent = 'Signing in…';

    const fd = new FormData();
    fd.append('email',    emailInp.value.trim());
    fd.append('password', pwInp.value);

    try {
      console.log('Sending login request...');
      const res  = await fetch('/kickzone-fixed/backend/login.php', { 
        method: 'POST', 
        body: fd 
      });
      
      console.log('Response status:', res.status);
      
      // Check if response is valid before parsing JSON
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const text = await res.text();
      console.log('Raw response:', text);
      
      const data = JSON.parse(text);
      console.log('Parsed data:', data);

      if (data.success) {
        console.log('Login successful, saving user...');
        localStorage.setItem('kickzone_user', JSON.stringify(data.user));
        showNotif('Welcome back! Redirecting…', 'success');
        setTimeout(() => { window.location.href = '../browse/index.html'; }, 1400);
      } else {
        showNotif(data.message || 'Incorrect email or password.', 'error');
        btn.disabled    = false;
        btn.textContent = 'Sign In to KickZone';
      }
    } catch (err) {
      console.error('Login error:', err);
      showNotif('Cannot reach server. Check XAMPP is running.', 'error');
      btn.disabled    = false;
      btn.textContent = 'Sign In to KickZone';
    }
  });

  // Social buttons (OAuth)
  const googleBtn = document.getElementById('google-btn');
  const fbBtn = document.getElementById('fb-btn');
  
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      await initiateOAuthLogin('google');
    });
  }
  
  if (fbBtn) {
    fbBtn.addEventListener('click', async () => {
      await initiateOAuthLogin('facebook');
    });
  }

  // Handle OAuth callback if returning from provider
  handleOAuthCallback();

});

// OAuth Login Handler
async function initiateOAuthLogin(provider) {
  try {
    console.log(`Initiating ${provider} login...`);
    const res = await fetch(`/kickzone-fixed/backend/oauth.php?action=login&provider=${provider}`);
    const data = await res.json();

    console.log(`${provider} response:`, data);

    if (data.success && data.auth_url) {
      showNotif(`Redirecting to ${provider}...`, 'info');
      // Redirect to OAuth provider
      window.location.href = data.auth_url;
    } else {
      showNotif(`Failed to initiate ${provider} login: ${data.message}`, 'error');
    }
  } catch (error) {
    console.error(`OAuth error:`, error);
    showNotif(`Error initiating ${provider} login`, 'error');
  }
}

// Handle OAuth callback (when redirected back from provider)
function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const provider = params.get('provider');

  if (code && provider) {
    console.log(`OAuth callback received: provider=${provider}`);
    completeOAuthLogin(code, state, provider);
  }
}

// Complete OAuth Login (after returning from provider)
async function completeOAuthLogin(code, state, provider) {
  try {
    console.log(`Completing ${provider} OAuth login with code: ${code}`);
    
    const res = await fetch(
      `/kickzone-fixed/backend/oauth.php?action=callback&provider=${provider}&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`
    );
    const data = await res.json();

    console.log('OAuth callback response:', data);

    if (data.success && data.user) {
      localStorage.setItem('kickzone_user', JSON.stringify(data.user));
      showNotif(`Welcome ${data.user.full_name}! Redirecting…`, 'success');
      setTimeout(() => {
        window.location.href = data.redirect || '../browse/index.html';
      }, 1400);
    } else {
      showNotif(data.message || 'OAuth authentication failed', 'error');
    }
  } catch (error) {
    console.error('OAuth completion error:', error);
    showNotif('OAuth authentication failed', 'error');
  }
}
