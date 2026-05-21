/* ===================================================
   KICKZONE — Payment Page Script
   =================================================== */

// ── Auth guard ────────────────────────────────────────
const currentUser = requireAuth('../login/index.html');
if (!currentUser) {
  throw new Error('Not authenticated');
}

// ── Get booking ID from URL or localStorage ─────────
const bookingId = parseInt(
  new URLSearchParams(window.location.search).get('booking_id') || 
  sessionStorage.getItem('pendingBookingId') || '0'
);

if (!bookingId) {
  showStatus('No booking found. Redirecting...', 'error');
  setTimeout(() => window.location.href = '../browse/index.html', 2000);
}

// ── State ──────────────────────────────────────────
let bookingData = null;
let fieldData = null;

// ── Initialize ─────────────────────────────────────
(async () => {
  await loadBookingData();
  setupEventListeners();
})();

// ── Load booking and field data ────────────────────
async function loadBookingData() {
  try {
    const res = await fetch(`/kickzone-fixed/backend/booking.php?user_id=${currentUser.id}`);
    const data = await res.json();

    if (!data.success) {
      showStatus('Failed to load booking details', 'error');
      return;
    }

    // Find the specific booking
    bookingData = data.bookings.find(b => b.id === bookingId);
    if (!bookingData) {
      showStatus('Booking not found', 'error');
      return;
    }

    displayOrderSummary();
  } catch (error) {
    console.error('Error loading booking:', error);
    showStatus('Error loading booking details', 'error');
  }
}

// ── Display order summary ──────────────────────────
function displayOrderSummary() {
  const date = new Date(bookingData.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const startTime = bookingData.start_time;
  const endTime = bookingData.end_time;
  const [startHour, startMin] = startTime.split(':');
  const [endHour, endMin] = endTime.split(':');
  
  const startMins = parseInt(startHour) * 60 + parseInt(startMin);
  const endMins = parseInt(endHour) * 60 + parseInt(endMin);
  const durationHours = (endMins - startMins) / 60;

  const pricePerHour = parseFloat(bookingData.price_hour || 0);
  const total = parseFloat(bookingData.total_price);

  // Update DOM
  document.getElementById('fieldName').textContent = bookingData.field_name;
  document.getElementById('fieldLocation').textContent = bookingData.location;
  document.getElementById('fieldImage').src = bookingData.image_url || '';
  
  document.getElementById('bookingDate').textContent = formattedDate;
  document.getElementById('bookingTime').textContent = `${startTime} - ${endTime}`;
  document.getElementById('sportType').textContent = bookingData.sport_type;

  document.getElementById('pricePerHour').textContent = `EGP ${pricePerHour.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('duration').textContent = `${durationHours} hour${durationHours !== 1 ? 's' : ''}`;
  document.getElementById('subtotal').textContent = `EGP ${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('totalPrice').textContent = `EGP ${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// ── Setup event listeners ──────────────────────────
function setupEventListeners() {
  // Payment method change
  document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      updatePaymentFormVisibility(e.target.value);
    });
  });

  // Card formatting
  document.getElementById('cardNumber').addEventListener('input', formatCardNumber);
  document.getElementById('cardExp').addEventListener('input', formatExpiry);
  document.getElementById('cardCvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Submit payment
  document.getElementById('submitBtn').addEventListener('click', submitPayment);
  
  // Cancel
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.history.back();
  });
}

// ── Update form visibility based on payment method ──
function updatePaymentFormVisibility(method) {
  document.getElementById('cardSection').style.display = method === 'card' ? 'block' : 'none';
  document.getElementById('walletSection').style.display = method === 'wallet' ? 'block' : 'none';
  document.getElementById('cashSection').style.display = method === 'cash' ? 'block' : 'none';
}

// ── Format card number (1234 5678 9012 3456) ──────
function formatCardNumber(e) {
  let value = e.target.value.replace(/\s/g, '').slice(0, 16);
  let formatted = '';
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += value[i];
  }
  e.target.value = formatted;
}

// ── Format expiry (MM/YY) ──────────────────────────
function formatExpiry(e) {
  let value = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2);
  }
  e.target.value = value;
}

// ── Validate card form ─────────────────────────────
function validateCardForm() {
  const form = document.getElementById('cardForm');
  if (!form.checkValidity()) {
    showStatus('Please fill in all card details', 'error');
    return false;
  }

  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cardNumber)) {
    showStatus('Invalid card number (must be 16 digits)', 'error');
    return false;
  }

  const cardExp = document.getElementById('cardExp').value;
  if (!/^\d{2}\/\d{2}$/.test(cardExp)) {
    showStatus('Invalid expiry date (use MM/YY format)', 'error');
    return false;
  }

  const cardCvv = document.getElementById('cardCvv').value;
  if (!/^\d{3}$/.test(cardCvv)) {
    showStatus('Invalid CVV (must be 3 digits)', 'error');
    return false;
  }

  return true;
}

// ── Submit payment ────────────────────────────────
async function submitPayment() {
  const method = document.querySelector('input[name="payment_method"]:checked').value;
  
  // Validate based on method
  if (method === 'card' && !validateCardForm()) {
    return;
  }

  // Show loading
  document.getElementById('loadingSpinner').style.display = 'flex';
  document.getElementById('submitBtn').disabled = true;

  try {
    const payload = {
      booking_id: bookingId,
      user_id: currentUser.id,
      payment_method: method,
      amount: bookingData.total_price
    };

    // Add card details if card payment
    if (method === 'card') {
      payload.card_number = document.getElementById('cardNumber').value.replace(/\s/g, '');
      payload.card_exp = document.getElementById('cardExp').value;
      payload.card_cvv = document.getElementById('cardCvv').value;
    }

    const res = await fetch('/kickzone-fixed/backend/payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      showSuccessScreen(data.payment);
      
      // Clear pending booking from session
      sessionStorage.removeItem('pendingBookingId');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '../player/index.html';
      }, 3000);
    } else {
      showStatus(data.message || 'Payment failed', 'error');
    }
  } catch (error) {
    console.error('Payment error:', error);
    showStatus('Payment processing failed. Please try again.', 'error');
  } finally {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('submitBtn').disabled = false;
  }
}

// ── Show success screen ────────────────────────────
function showSuccessScreen(payment) {
  const content = document.querySelector('.payment-content');
  content.innerHTML = `
    <div style="padding: 60px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
      <h1 style="margin: 0 0 10px 0; font-size: 2rem;">Payment Successful!</h1>
      <p style="margin: 0 0 30px 0; font-size: 1.1rem; opacity: 0.9;">Your booking has been confirmed.</p>
      
      <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <div style="text-align: left; margin: 10px 0;">
          <strong>Reference Code:</strong> ${payment.reference_code}
        </div>
        <div style="text-align: left; margin: 10px 0;">
          <strong>Amount:</strong> EGP ${payment.amount.toFixed(2)}
        </div>
        <div style="text-align: left; margin: 10px 0;">
          <strong>Method:</strong> ${payment.payment_method.toUpperCase()}
        </div>
        <div style="text-align: left; margin: 10px 0;">
          <strong>Status:</strong> ${payment.payment_status}
        </div>
      </div>

      <p style="margin: 0; font-size: 0.95rem; opacity: 0.8;">A confirmation email has been sent to ${currentUser.email}</p>
      <p style="margin: 15px 0 0 0; font-size: 0.9rem; opacity: 0.7;">Redirecting to your profile...</p>
    </div>
  `;
}

// ── Show status message ────────────────────────────
function showStatus(message, type) {
  const el = document.getElementById('statusMessage');
  el.textContent = message;
  el.className = `status-message ${type}`;
  el.style.display = 'block';
  
  if (type === 'error') {
    setTimeout(() => {
      el.style.display = 'none';
    }, 5000);
  }
}

// ── Update nav ─────────────────────────────────────
(function () {
  const actions = document.getElementById('nav-actions');
  if (actions && currentUser) {
    actions.innerHTML = `
      <a href="../player/index.html" class="btn btn-ghost">👤 ${currentUser.name || 'Profile'}</a>
      <button class="btn btn-ghost" onclick="logout()">Logout</button>
    `;
  }
})();
