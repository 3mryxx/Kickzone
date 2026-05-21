/* ===================================================
   KICKZONE — Signup Page Script
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Redirect if already logged in
  if (localStorage.getItem('kickzone_user')) {
    window.location.href = '../browse/index.html';
    return;
  }

  const form      = document.getElementById('signup-form');
  const nameInp   = document.getElementById('fullname');
  const phoneInp  = document.getElementById('phone');
  const emailInp  = document.getElementById('email');
  const pwInp     = document.getElementById('password');
  const confInp   = document.getElementById('confirm');
  const termsChk  = document.getElementById('terms');
  const btn       = document.getElementById('signup-btn');

  // ── Validators ──────────────────────────────────
  function setValid(input, errId, ok) {
    input.classList.toggle('error', !ok);
    document.getElementById(errId).classList.toggle('show', !ok);
    return ok;
  }

  function validateName()  { return setValid(nameInp,  'name-err',    nameInp.value.trim().length >= 3); }
  function validatePhone() { return setValid(phoneInp, 'phone-err',   /^0\d{9,10}$/.test(phoneInp.value.trim())); }
  function validateEmail() { return setValid(emailInp, 'email-err',   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp.value.trim())); }
  function validatePw()    { return setValid(pwInp,    'pw-err',      pwInp.value.length >= 6); }
  function validateConf()  { return setValid(confInp,  'confirm-err', pwInp.value === confInp.value && confInp.value !== ''); }
  function validateTerms() {
    const ok = termsChk.checked;
    document.getElementById('terms-err').classList.toggle('show', !ok);
    return ok;
  }

  // Live validation on blur
  nameInp .addEventListener('blur', validateName);
  phoneInp.addEventListener('blur', validatePhone);
  emailInp.addEventListener('blur', validateEmail);
  pwInp   .addEventListener('blur', validatePw);
  confInp .addEventListener('blur', validateConf);
  pwInp   .addEventListener('input', () => { if (confInp.value) validateConf(); });

  // ── Submit ──────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ok = [
      validateName(),
      validatePhone(),
      validateEmail(),
      validatePw(),
      validateConf(),
      validateTerms(),
    ].every(Boolean);

    if (!ok) return;

    btn.disabled    = true;
    btn.textContent = 'Creating account…';

    const fd = new FormData();
    fd.append('full_name', nameInp.value.trim());
    fd.append('phone',     phoneInp.value.trim());
    fd.append('email',     emailInp.value.trim());
    fd.append('password',  pwInp.value);
    fd.append('confirm',   confInp.value);

    try {
      const res  = await fetch('/kickzone-fixed/backend/registration.php', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.success) {
        // Auto-login after signup
        localStorage.setItem('kickzone_user', JSON.stringify(data.user));
        showNotif('Account created! Welcome to KickZone! 🎉', 'success');
        setTimeout(() => { window.location.href = '../browse/index.html'; }, 1500);
      } else {
        showNotif(data.message || 'Registration failed. Try again.', 'error');
        btn.disabled    = false;
        btn.textContent = 'Create Account Now';
      }
    } catch {
      showNotif('Cannot reach server. Is XAMPP running?', 'error');
      btn.disabled    = false;
      btn.textContent = 'Create Account Now';
    }
  });

  // ── Social buttons ───────────────────────────────
  document.getElementById('google-btn').addEventListener('click', async () => {
    await initiateOAuthLogin('google');
  });
  document.getElementById('fb-btn').addEventListener('click', async () => {
    await initiateOAuthLogin('facebook');
  });

  // Handle OAuth callback if returning from provider
  handleOAuthCallback();

});

// ── OAuth Login Handler ─────────────────────────────
async function initiateOAuthLogin(provider) {
  try {
    console.log(`Initiating ${provider} OAuth signup...`);
    const res = await fetch(`/kickzone-fixed/backend/oauth.php?action=login&provider=${provider}`);
    const data = await res.json();

    console.log(`${provider} response:`, data);

    if (data.success && data.auth_url) {
      showNotif(`Redirecting to ${provider}...`, 'info');
      // Redirect to OAuth provider
      window.location.href = data.auth_url;
    } else {
      showNotif(`Failed to initiate ${provider} signup: ${data.message}`, 'error');
    }
  } catch (error) {
    console.error(`OAuth error:`, error);
    showNotif(`Error initiating ${provider} signup`, 'error');
  }
}

// ── Handle OAuth callback (when redirected back from provider) ──
function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const provider = params.get('provider');

  if (code && provider) {
    console.log(`OAuth callback received on signup: provider=${provider}`);
    completeOAuthSignup(code, state, provider);
  }
}

// ── Complete OAuth Signup (after returning from provider) ──────
async function completeOAuthSignup(code, state, provider) {
  try {
    console.log(`Completing ${provider} OAuth signup with code: ${code}`);
    
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
      showNotif(data.message || 'OAuth signup failed', 'error');
    }
  } catch (error) {
    console.error('OAuth completion error:', error);
    showNotif('OAuth signup failed', 'error');
  }
}
