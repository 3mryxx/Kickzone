/* ===================================================
   KICKZONE — Shared JavaScript
   Include on every page
   =================================================== */

// ── Navigation ──────────────────────────────────────
const burger = document.getElementById('nav-burger');
const mobileNav = document.getElementById('nav-mobile');

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  // close on outside click
  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !mobileNav.contains(e.target)) {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
    }
  });
}

// Highlight active nav link
(function () {
  const page = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'landing';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    if (a.getAttribute('href') && a.getAttribute('href').includes(page)) {
      a.classList.add('active');
    }
  });
})();

// ── Notifications ────────────────────────────────────
function showNotif(message, type = 'info') {
  const existing = document.querySelector('.notif');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `notif notif-${type}`;
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'notif-out .3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// ── Password toggle ──────────────────────────────────
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  });
});

// ── Auth guard (call on protected pages) ────────────
function requireAuth(redirectTo = '../login/index.html') {
  const user = localStorage.getItem('kickzone_user');
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return JSON.parse(user);
}

// ── Get current user ─────────────────────────────────
function getUser() {
  const u = localStorage.getItem('kickzone_user');
  return u ? JSON.parse(u) : null;
}

// ── Logout ───────────────────────────────────────────
function logout() {
  localStorage.removeItem('kickzone_user');
  window.location.href = '../../index.html';
}

// ── Scroll effect on navbar ──────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Intersection observer for animate-in ────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('animate-in');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
