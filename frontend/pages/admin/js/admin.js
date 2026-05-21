/* ===================================================
   KICKZONE — Admin Dashboard Script
   =================================================== */

// ── Auth guard ────────────────────────────────────────
const currentUser = requireAuth('../login/index.html');
if (!currentUser) {
  throw new Error('Not authenticated');
}

// Verify admin role
checkAdminAccess();

async function checkAdminAccess() {
  try {
    const res = await fetch(`/kickzone-fixed/backend/admin.php?action=dashboard&user_id=${currentUser.id}`);
    const data = await res.json();
    
    if (!data.success) {
      alert('You do not have admin access.');
      window.location.href = '../landing/index.html';
    }
  } catch (error) {
    console.error('Admin access check failed:', error);
  }
}

// ── Setup Admin Info ───────────────────────────────
document.getElementById('adminName').textContent = currentUser.name || 'Admin User';

// ── State ──────────────────────────────────────────
let currentSection = 'dashboard';
let dashboardData = {};
let usersData = [];
let bookingsData = [];
let paymentsData = [];
let fieldsData = [];

// ── Initialize ─────────────────────────────────────
(async () => {
  await loadDashboard();
  setupNavigation();
  setupEventListeners();
})();

// ── Setup Navigation ───────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const section = e.target.dataset.section;
      switchSection(section);
    });
  });
}

// ── Switch Section ─────────────────────────────────
async function switchSection(section) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(el => {
    el.classList.remove('active');
  });

  // Show target section
  document.getElementById(section).classList.add('active');

  // Update nav active
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.section === section) {
      btn.classList.add('active');
    }
  });

  currentSection = section;

  // Load section data
  if (section === 'users') {
    await loadUsers();
  } else if (section === 'bookings') {
    await loadBookings();
  } else if (section === 'payments') {
    await loadPayments();
  } else if (section === 'fields') {
    await loadFields();
  }
}

// ── Load Dashboard ─────────────────────────────────
async function loadDashboard() {
  try {
    const res = await fetch(`/kickzone-fixed/backend/admin.php?action=dashboard&user_id=${currentUser.id}`);
    const data = await res.json();

    if (data.success) {
      dashboardData = data.dashboard;
      
      // Update stats
      document.getElementById('totalUsers').textContent = dashboardData.total_users;
      document.getElementById('totalBookings').textContent = dashboardData.total_bookings;
      document.getElementById('totalRevenue').textContent = `EGP ${dashboardData.total_revenue.toFixed(2)}`;
      document.getElementById('pendingPayments').textContent = dashboardData.pending_payments;

      // Update recent bookings table
      renderRecentBookings(dashboardData.recent_bookings);
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// ── Render Recent Bookings ────────────────────────
function renderRecentBookings(bookings) {
  const tbody = document.getElementById('recentBookingsTable');
  
  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No recent bookings</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>#${b.id}</td>
      <td>${b.user_name}</td>
      <td>${b.field_name}</td>
      <td>${formatDate(b.date)}</td>
      <td>EGP ${parseFloat(b.total_price).toFixed(2)}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn action-view" onclick="viewBookingDetails(${b.id})">View</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Load Users ─────────────────────────────────────
async function loadUsers() {
  try {
    const res = await fetch(`/kickzone-fixed/backend/admin.php?action=users&user_id=${currentUser.id}&limit=50`);
    const data = await res.json();

    if (data.success) {
      usersData = data.users;
      renderUsersTable(usersData);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// ── Render Users Table ─────────────────────────────
function renderUsersTable(users) {
  const tbody = document.getElementById('usersTable');
  
  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>#${u.id}</td>
      <td>${u.full_name}</td>
      <td>${u.email}</td>
      <td>${u.phone || '—'}</td>
      <td><span class="status-badge status-${u.role === 'admin' ? 'confirmed' : 'pending'}">${u.role}</span></td>
      <td>${formatDate(u.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn action-view" onclick="viewUserDetails(${u.id})">View</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Load Bookings ──────────────────────────────────
async function loadBookings() {
  try {
    const res = await fetch(`/kickzone-fixed/backend/admin.php?action=bookings&user_id=${currentUser.id}&limit=50`);
    const data = await res.json();

    if (data.success) {
      bookingsData = data.bookings;
      renderBookingsTable(bookingsData);
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
}

// ── Render Bookings Table ──────────────────────────
function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsTable');
  
  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No bookings found</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>#${b.id}</td>
      <td>${b.user_name}</td>
      <td>${b.field_name}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.start_time} - ${b.end_time}</td>
      <td>EGP ${parseFloat(b.total_price).toFixed(2)}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn action-view" onclick="viewBookingDetails(${b.id})">View</button>
          ${b.status !== 'cancelled' ? `<button class="action-btn action-delete" onclick="cancelBooking(${b.id})">Cancel</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Load Payments ──────────────────────────────────
async function loadPayments() {
  try {
    const res = await fetch(`/kickzone-fixed/backend/admin.php?action=payments&user_id=${currentUser.id}&limit=50`);
    const data = await res.json();

    if (data.success) {
      paymentsData = data.payments;
      renderPaymentsTable(paymentsData);
    }
  } catch (error) {
    console.error('Error loading payments:', error);
  }
}

// ── Render Payments Table ──────────────────────────
function renderPaymentsTable(payments) {
  const tbody = document.getElementById('paymentsTable');
  
  if (!payments || payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No payments found</td></tr>';
    return;
  }

  tbody.innerHTML = payments.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td>#${p.booking_id}</td>
      <td>${p.user_name}</td>
      <td>EGP ${parseFloat(p.amount).toFixed(2)}</td>
      <td>${p.payment_method}</td>
      <td><span class="status-badge status-${p.payment_status}">${p.payment_status}</span></td>
      <td>${formatDate(p.created_at)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn action-view" onclick="viewPaymentDetails(${p.id})">View</button>
          ${p.payment_status === 'completed' ? `<button class="action-btn action-refund" onclick="refundPayment(${p.id})">Refund</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Load Fields ────────────────────────────────────
async function loadFields() {
  try {
    const res = await fetch(`/kickzone-fixed/backend/admin.php?action=fields&user_id=${currentUser.id}&limit=50`);
    const data = await res.json();

    if (data.success) {
      fieldsData = data.fields;
      renderFieldsTable(fieldsData);
    }
  } catch (error) {
    console.error('Error loading fields:', error);
  }
}

// ── Render Fields Table ────────────────────────────
function renderFieldsTable(fields) {
  const tbody = document.getElementById('fieldsTable');
  
  if (!fields || fields.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No fields found</td></tr>';
    return;
  }

  tbody.innerHTML = fields.map(f => `
    <tr>
      <td>#${f.id}</td>
      <td>${f.name}</td>
      <td>${f.location}</td>
      <td>${f.governorate}</td>
      <td>${f.sport_type}</td>
      <td>EGP ${parseFloat(f.price_hour).toFixed(2)}</td>
      <td>⭐ ${parseFloat(f.rating).toFixed(1)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn action-view" onclick="viewFieldDetails(${f.id})">View</button>
          <button class="action-btn action-edit" onclick="editField(${f.id})">Edit</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Setup Event Listeners ──────────────────────────
function setupEventListeners() {
  // Add field form
  const form = document.getElementById('addFieldForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await createField(new FormData(form));
    });
  }
}

// ── Create Field ───────────────────────────────────
async function createField(formData) {
  try {
    const payload = {
      action: 'create_field',
      user_id: currentUser.id,
      name: formData.get('name'),
      location: formData.get('location'),
      governorate: formData.get('governorate'),
      sport_type: formData.get('sport_type'),
      price_hour: parseFloat(formData.get('price_hour')),
      rating: parseFloat(formData.get('rating')),
      image_url: formData.get('image_url')
    };

    const res = await fetch('/kickzone-fixed/backend/admin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      alert('Field created successfully!');
      closeAddFieldModal();
      await loadFields();
    } else {
      alert('Error creating field: ' + data.message);
    }
  } catch (error) {
    console.error('Error creating field:', error);
    alert('Error creating field');
  }
}

// ── Cancel Booking ─────────────────────────────────
async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    const res = await fetch('/kickzone-fixed/backend/admin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cancel_booking',
        user_id: currentUser.id,
        booking_id: bookingId
      })
    });

    const data = await res.json();

    if (data.success) {
      alert('Booking cancelled successfully!');
      await loadBookings();
      await loadDashboard();
    } else {
      alert('Error cancelling booking: ' + data.message);
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    alert('Error cancelling booking');
  }
}

// ── Refund Payment ─────────────────────────────────
async function refundPayment(paymentId) {
  if (!confirm('Are you sure you want to refund this payment?')) return;

  try {
    const res = await fetch('/kickzone-fixed/backend/admin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'refund_payment',
        user_id: currentUser.id,
        payment_id: paymentId
      })
    });

    const data = await res.json();

    if (data.success) {
      alert('Payment refunded successfully!');
      await loadPayments();
      await loadDashboard();
    } else {
      alert('Error refunding payment: ' + data.message);
    }
  } catch (error) {
    console.error('Error refunding payment:', error);
    alert('Error refunding payment');
  }
}

// ── Modal Controls ────────────────────────────────
function openAddFieldModal() {
  document.getElementById('addFieldModal').style.display = 'flex';
}

function closeAddFieldModal() {
  document.getElementById('addFieldModal').style.display = 'none';
  document.getElementById('addFieldForm').reset();
}

// ── Detail View Functions (Stubs) ──────────────────
function viewBookingDetails(id) {
  const booking = bookingsData.find(b => b.id === id);
  if (booking) {
    alert(`Booking Details:\n\nField: ${booking.field_name}\nDate: ${booking.date}\nTime: ${booking.start_time} - ${booking.end_time}\nAmount: EGP ${booking.total_price}\nStatus: ${booking.status}`);
  }
}

function viewUserDetails(id) {
  const user = usersData.find(u => u.id === id);
  if (user) {
    alert(`User Details:\n\nName: ${user.full_name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nRole: ${user.role}\nJoined: ${formatDate(user.created_at)}`);
  }
}

function viewPaymentDetails(id) {
  const payment = paymentsData.find(p => p.id === id);
  if (payment) {
    alert(`Payment Details:\n\nBooking: #${payment.booking_id}\nUser: ${payment.user_name}\nAmount: EGP ${payment.amount}\nMethod: ${payment.payment_method}\nStatus: ${payment.payment_status}\nReference: ${payment.reference_code}`);
  }
}

function viewFieldDetails(id) {
  const field = fieldsData.find(f => f.id === id);
  if (field) {
    alert(`Field Details:\n\nName: ${field.name}\nLocation: ${field.location}\nGovernorate: ${field.governorate}\nSport: ${field.sport_type}\nPrice: EGP ${field.price_hour}/hour\nRating: ⭐ ${field.rating}`);
  }
}

function editField(id) {
  alert('Edit functionality would open a modal form');
}

// ── Helper: Format Date ────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// ── Global switch section function ─────────────────
window.switchSection = switchSection;
