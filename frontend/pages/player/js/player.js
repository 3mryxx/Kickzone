/* ===================================================
   KICKZONE — Player Profile Script
   =================================================== */

// ── Auth guard ────────────────────────────────────────
const currentUser = requireAuth('../login/index.html');
if (!currentUser) {
  throw new Error('Not authenticated');
}

// ── State ─────────────────────────────────────────────
let allBookings   = [];
let activeTab     = 'all';
let cancelTargetId = null;

// ── Load profile + bookings ───────────────────────────
async function loadProfile() {
  try {
    const res  = await fetch('/kickzone-fixed/backend/profile.php?user_id=' + currentUser.id);
    const data = await res.json();

    if (data.success) {
      renderProfileHeader(data.user, data.stats);
    } else {
      // Fallback to localStorage data
      renderProfileHeader(null, null);
    }
  } catch (_) {
    renderProfileHeader(null, null);
  }
}

function renderProfileHeader(user, stats) {
  const name  = user ? user.full_name  : (currentUser.name  || 'Player');
  const email = user ? user.email      : (currentUser.email || '');
  const since = user ? user.created_at : '';

  // Avatar initial
  document.getElementById('avatar-circle').textContent = name.charAt(0).toUpperCase();

  document.getElementById('profile-name').textContent  = name;
  document.getElementById('profile-email').textContent = email;

  if (since) {
    const d = new Date(since);
    document.getElementById('profile-member').textContent =
      'Member since ' + d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }

  if (stats) {
    document.getElementById('stat-total').textContent     = stats.total_bookings || 0;
    document.getElementById('stat-confirmed').textContent = stats.confirmed       || 0;
    document.getElementById('stat-cancelled').textContent = stats.cancelled       || 0;
    const spent = parseFloat(stats.total_spent || 0);
    document.getElementById('stat-spent').textContent     = spent.toLocaleString();
  }

  // Pre-fill edit form
  document.getElementById('edit-name').value  = name;
  document.getElementById('edit-phone').value = (user && user.phone) ? user.phone : '';
}

async function loadBookings() {
  const list = document.getElementById('bookings-list');
  list.innerHTML = '<div class="bk-loading">Loading bookings…</div>';

  try {
    const res  = await fetch('/kickzone-fixed/backend/booking.php?user_id=' + currentUser.id);
    const data = await res.json();

    if (data.success) {
      allBookings = data.bookings;
    } else {
      allBookings = [];
    }
  } catch (_) {
    allBookings = [];
  }

  renderBookings();
}

// ── Render bookings ───────────────────────────────────
function renderBookings() {
  const list = document.getElementById('bookings-list');

  let filtered = allBookings;
  if (activeTab !== 'all') {
    filtered = allBookings.filter(b => b.status === activeTab);
  }

  if (!filtered.length) {
    list.innerHTML = `
      <div class="bk-empty">
        <div class="bk-empty-icon">🏟️</div>
        <div>${activeTab === 'all'
          ? "You haven't made any bookings yet."
          : 'No ' + activeTab + ' bookings found.'}</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(b => {
    const date  = new Date(b.date).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
    const price = parseFloat(b.total_price).toLocaleString();
    const imgStyle = b.image_url ? `background-image:url('${b.image_url}')` : '';
    const today = new Date().toISOString().split('T')[0];
    const isFuture = b.date >= today;
    const canCancel = b.status === 'confirmed' && isFuture;

    return `
      <div class="bk-card status-${b.status}">
        <div class="bk-img" style="${imgStyle}"></div>
        <div class="bk-info">
          <h3>${b.field_name}</h3>
          <div class="bk-loc">📍 ${b.location}, ${b.governorate}</div>
          <div class="bk-when">
            📅 ${date}
            <span>·</span>
            🕐 ${formatTime(b.start_time)} – ${formatTime(b.end_time)}
            <span>·</span>
            ${b.sport_type}
          </div>
        </div>
        <div class="bk-right">
          <div>
            <div class="bk-price">${price} <span class="bk-price-sub">EGP</span></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            <span class="bk-badge ${b.status}">${b.status}</span>
            ${canCancel
              ? `<button class="bk-cancel-btn" onclick="openCancelModal(${b.id})">Cancel booking</button>`
              : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour   = parseInt(h);
  const ampm   = hour >= 12 ? 'PM' : 'AM';
  const h12    = hour % 12 || 12;
  return h12 + ':' + m + ' ' + ampm;
}

// ── Tab filter ────────────────────────────────────────
function filterBookings(tab, btn) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBookings();
}

// ── Edit Profile Modal ────────────────────────────────
function openEditModal() {
  document.getElementById('edit-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Edit form submission
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name  = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const btn   = document.getElementById('edit-save-btn');
    const errEl = document.getElementById('edit-name-err');

    if (name.length < 3) {
      document.getElementById('edit-name').classList.add('error');
      errEl.classList.add('show');
      return;
    }
    document.getElementById('edit-name').classList.remove('error');
    errEl.classList.remove('show');

    btn.disabled    = true;
    btn.textContent = 'Saving…';

    try {
      const res  = await fetch('/kickzone-fixed/backend/profile.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id: currentUser.id, full_name: name, phone }),
      });
      const data = await res.json();

      if (data.success) {
        // Update localStorage name
        const stored = JSON.parse(localStorage.getItem('kickzone_user') || '{}');
        stored.name  = name;
        localStorage.setItem('kickzone_user', JSON.stringify(stored));

        // Update UI
        document.getElementById('profile-name').textContent = name;
        document.getElementById('avatar-circle').textContent = name.charAt(0).toUpperCase();

        closeEditModal();
        showNotif('Profile updated ✅', 'success');
      } else {
        showNotif(data.message || 'Update failed.', 'error');
      }
    } catch (_) {
      showNotif('Cannot reach server. Is XAMPP running?', 'error');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Save Changes';
    }
  });

  // Close modals on overlay click
  document.getElementById('edit-modal').addEventListener('click', function(e) {
    if (e.target === this) closeEditModal();
  });
  document.getElementById('cancel-modal').addEventListener('click', function(e) {
    if (e.target === this) closeCancelModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeEditModal(); closeCancelModal(); }
  });

  // Load data
  loadProfile();
  loadBookings();
});

// ── Cancel Booking Modal ──────────────────────────────
function openCancelModal(bookingId) {
  cancelTargetId = bookingId;
  document.getElementById('cancel-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCancelModal() {
  cancelTargetId = null;
  document.getElementById('cancel-modal').classList.remove('open');
  document.body.style.overflow = '';
}

async function confirmCancel() {
  if (!cancelTargetId) return;

  const btn = document.getElementById('confirm-cancel-btn');
  btn.disabled    = true;
  btn.textContent = 'Cancelling…';

  try {
    const res  = await fetch('/kickzone-fixed/backend/booking.php', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: cancelTargetId, user_id: currentUser.id }),
    });
    const data = await res.json();

    if (data.success) {
      closeCancelModal();
      showNotif('Booking cancelled.', 'info');
      // Refresh bookings and stats
      loadBookings();
      loadProfile();
    } else {
      showNotif(data.message || 'Could not cancel booking.', 'error');
    }
  } catch (_) {
    showNotif('Cannot reach server. Is XAMPP running?', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Yes, Cancel';
  }
}
