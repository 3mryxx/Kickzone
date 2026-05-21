/* ===================================================
   KICKZONE — Browse Page Script
   =================================================== */

// ── Auth guard ────────────────────────────────────────
const currentUser = requireAuth('../login/index.html');
if (!currentUser) {
  throw new Error('Not authenticated');
}

// ── Update nav with logged-in user ────────────────────
(function () {
  const actions = document.getElementById('nav-actions');
  if (actions && currentUser) {
    actions.innerHTML = `
      <a href="../player/index.html" class="btn btn-ghost">👤 ${currentUser.name || 'Profile'}</a>
      <button class="btn btn-ghost" onclick="logout()">Logout</button>
    `;
  }
})();

// ── State ─────────────────────────────────────────────
let allFields = [];
let activeGov = 'All';
let maxPrice  = 1000;
let liked     = new Set(JSON.parse(localStorage.getItem('kickzone_liked') || '[]'));

// ── Fallback data (matches DB seed) ──────────────────
const FALLBACK_FIELDS = [
  { id:1,  name:'Champions Arena',      loc:'Maadi, Cairo',           gov:'Cairo',       sport:'Football', price:350, rating:4.9, img:'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80' },
  { id:2,  name:'Stars Field',          loc:'Zamalek, Cairo',         gov:'Cairo',       sport:'Football', price:420, rating:4.8, img:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80' },
  { id:3,  name:'Heliopolis Ground',    loc:'Heliopolis, Cairo',      gov:'Cairo',       sport:'Futsal',   price:280, rating:4.6, img:'https://images.unsplash.com/photo-1551958219-acbc595e4777?w=500&q=80' },
  { id:4,  name:'Pro Pitch Alex',       loc:'Stanley, Alexandria',    gov:'Alexandria',  sport:'Football', price:300, rating:4.7, img:'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80' },
  { id:5,  name:'Corniche Arena',       loc:'Miami, Alexandria',      gov:'Alexandria',  sport:'Football', price:250, rating:4.5, img:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80' },
  { id:6,  name:'Pyramids Field',       loc:'Haram, Giza',            gov:'Giza',        sport:'Football', price:200, rating:4.4, img:'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80' },
  { id:7,  name:'Dokki Sports Club',    loc:'Dokki, Giza',            gov:'Giza',        sport:'Futsal',   price:320, rating:4.7, img:'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=500&q=80' },
  { id:8,  name:'October Arena',        loc:'6th October City',       gov:'6th October', sport:'Football', price:180, rating:4.3, img:'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500&q=80' },
  { id:9,  name:'Cairo Festival Pitch', loc:'New Cairo',              gov:'New Cairo',   sport:'Football', price:450, rating:4.9, img:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&q=80' },
  { id:10, name:'East Field',           loc:'Rehab City, New Cairo',  gov:'New Cairo',   sport:'Football', price:380, rating:4.6, img:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80' },
  { id:11, name:'Maadi Club Field',     loc:'Maadi, Cairo',           gov:'Cairo',       sport:'Football', price:500, rating:4.8, img:'https://images.unsplash.com/photo-1551958219-acbc595e4777?w=500&q=80' },
  { id:12, name:'Nasr City Ground',     loc:'Nasr City, Cairo',       gov:'Cairo',       sport:'Futsal',   price:240, rating:4.2, img:'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80' },
  { id:13, name:'El Ahly Training',     loc:'Mokattam, Cairo',        gov:'Cairo',       sport:'Football', price:600, rating:5.0, img:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80' },
  { id:14, name:'Downtown Pitch',       loc:'Downtown Cairo',         gov:'Cairo',       sport:'Futsal',   price:220, rating:4.1, img:'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80' },
  { id:15, name:'Alex Sports Complex',  loc:'Smouha, Alexandria',     gov:'Alexandria',  sport:'Football', price:320, rating:4.6, img:'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=500&q=80' },
  { id:16, name:'Borg El-Arab Stadium', loc:'Borg El-Arab, Alex',     gov:'Alexandria',  sport:'Football', price:400, rating:4.8, img:'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500&q=80' },
  { id:17, name:'Giza Stadium Field',   loc:'Mohandessen, Giza',      gov:'Giza',        sport:'Football', price:280, rating:4.5, img:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&q=80' },
  { id:18, name:'Dream Park Pitch',     loc:'6th October City',       gov:'6th October', sport:'Football', price:220, rating:4.4, img:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80' },
  { id:19, name:'El-Tagamoa Ground',    loc:'El-Tagamoa, New Cairo',  gov:'New Cairo',   sport:'Futsal',   price:340, rating:4.5, img:'https://images.unsplash.com/photo-1551958219-acbc595e4777?w=500&q=80' },
  { id:20, name:'Mansoura Pitch',       loc:'El Mansoura City',       gov:'Mansoura',    sport:'Football', price:150, rating:4.3, img:'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80' },
  { id:21, name:'Dakahlia Arena',       loc:'Mansoura, Dakahlia',     gov:'Mansoura',    sport:'Football', price:130, rating:4.1, img:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80' },
  { id:22, name:'Tanta Stadium Field',  loc:'Tanta, Gharbia',         gov:'Tanta',       sport:'Football', price:140, rating:4.2, img:'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80' },
  { id:23, name:'Aswan Nile Pitch',     loc:'Aswan City',             gov:'Aswan',       sport:'Football', price:120, rating:4.0, img:'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=500&q=80' },
  { id:24, name:'Luxor West Bank Field',loc:'Luxor City',             gov:'Luxor',       sport:'Football', price:100, rating:4.0, img:'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500&q=80' },
  { id:25, name:'Canal Zone Stadium',   loc:'Port Said City',         gov:'Port Said',   sport:'Football', price:160, rating:4.3, img:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&q=80' },
  { id:26, name:'Suez Canal Arena',     loc:'Suez City',              gov:'Suez',        sport:'Football', price:170, rating:4.2, img:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80' },
  { id:27, name:'Ismailia Sports Field',loc:'Ismailia City',          gov:'Ismailia',    sport:'Football', price:155, rating:4.2, img:'https://images.unsplash.com/photo-1551958219-acbc595e4777?w=500&q=80' },
];

// ── Load fields from API ──────────────────────────────
async function loadFields() {
  const grid = document.getElementById('fields-grid');
  grid.innerHTML = '<div class="loading-state">Loading fields…</div>';

  try {
    const res  = await fetch('/kickzone-fixed/backend/fields.php');
    const data = await res.json();
    if (data.success && data.fields.length) {
      allFields = data.fields.map(f => ({
        id:     parseInt(f.id),
        name:   f.name,
        loc:    f.location,
        gov:    f.governorate,
        sport:  f.sport_type,
        price:  parseFloat(f.price_hour),
        rating: parseFloat(f.rating),
        img:    f.image_url || '',
      }));
    } else {
      allFields = FALLBACK_FIELDS;
    }
  } catch (_) {
    allFields = FALLBACK_FIELDS;
  }

  renderFields();
}

// ── Gov chips ─────────────────────────────────────────
function setGov(btn, gov) {
  activeGov = gov;
  document.querySelectorAll('.chip').forEach(c => {
    const label = c.textContent.trim();
    c.classList.toggle('active',
      (gov === 'All' && label === 'All') ||
      (gov !== 'All' && label === gov) ||
      (gov === 'Alexandria' && label === 'Alex')
    );
  });
  renderFields();
}

// ── Price slider ──────────────────────────────────────
function updatePrice(slider) {
  maxPrice = parseInt(slider.value);
  document.getElementById('price-label').textContent =
    'Up to ' + maxPrice.toLocaleString() + ' EGP';
  renderFields();
}

// ── Render fields ─────────────────────────────────────
function renderFields() {
  const q    = (document.getElementById('field-search').value || '').toLowerCase().trim();
  const sort = document.getElementById('sort-sel').value;

  // Read sport-type checkboxes by value attribute; if none checked show all
  const sportSection = document.getElementById('sport-filter-section');
  const checkedSports = new Set();
  let allUnchecked = true;
  if (sportSection) {
    sportSection.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb.checked) {
        allUnchecked = false;
        checkedSports.add(cb.value);
      }
    });
  }

  let list = allFields.filter(f => {
    const govOk   = activeGov === 'All' || f.gov === activeGov;
    const priceOk = f.price <= maxPrice;
    const qOk     = !q || f.name.toLowerCase().includes(q) || f.loc.toLowerCase().includes(q);
    const sportOk = allUnchecked || checkedSports.has(f.sport);
    return govOk && priceOk && qOk && sportOk;
  });

  if (sort === 'price-asc')  list.sort((a, b) => a.price  - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price  - a.price);
  if (sort === 'rating')     list.sort((a, b) => b.rating - a.rating);

  document.getElementById('res-num').textContent = list.length;

  const grid = document.getElementById('fields-grid');
  if (!list.length) {
    grid.innerHTML = '<div class="empty-state"><p>🏟️</p><div>No fields found. Try adjusting your filters.</div></div>';
    return;
  }

  grid.innerHTML = list.map(f => `
    <div class="fcard" onclick="openBookingModal(${f.id})">
      <div class="fcard-img" style="background-image:url('${f.img}')">
        <span class="fcard-sport">${f.sport}</span>
        <button class="fcard-fav ${liked.has(f.id) ? 'liked' : ''}"
          onclick="event.stopPropagation();toggleLike(this,${f.id})" aria-label="Favourite">&#9829;</button>
      </div>
      <div class="fcard-body">
        <h3>${f.name}</h3>
        <div class="fcard-loc">📍 ${f.loc}</div>
        <div class="fcard-foot">
          <div class="fcard-price">${f.price.toLocaleString()} EGP <span>/ hour</span></div>
          <div class="fcard-stars">⭐ ${f.rating}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Favourite toggle ──────────────────────────────────
function toggleLike(btn, id) {
  if (liked.has(id)) {
    liked.delete(id);
    btn.classList.remove('liked');
  } else {
    liked.add(id);
    btn.classList.add('liked');
    showNotif('Added to favourites ❤️', 'success');
  }
  localStorage.setItem('kickzone_liked', JSON.stringify([...liked]));
}

// ── Booking Modal ─────────────────────────────────────
function openBookingModal(fieldId) {
  const field = allFields.find(f => f.id === fieldId);
  if (!field) return;

  document.getElementById('modal-field-name').textContent  = field.name;
  document.getElementById('modal-field-loc').textContent   = '📍 ' + field.loc;
  document.getElementById('modal-field-sport').textContent = field.sport;
  document.getElementById('modal-field-price').textContent = field.price.toLocaleString() + ' EGP / hr';
  document.getElementById('modal-field-img').style.backgroundImage = "url('" + field.img + "')";
  document.getElementById('modal-field-id').value = fieldId;
  document.getElementById('modal-price-per-hour').dataset.price = field.price;
  document.getElementById('modal-price-preview').textContent = '';

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('book-date').min   = today;
  document.getElementById('book-date').value = '';
  document.getElementById('book-start').value = '';
  document.getElementById('book-end').value   = '';

  // Reset button
  const btn = document.getElementById('book-confirm-btn');
  btn.disabled    = false;
  btn.textContent = 'Confirm Booking';

  document.getElementById('booking-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function updatePricePreview() {
  const start        = document.getElementById('book-start').value;
  const end          = document.getElementById('book-end').value;
  const pricePerHour = parseFloat(document.getElementById('modal-price-per-hour').dataset.price || 0);
  const preview      = document.getElementById('modal-price-preview');

  if (!start || !end || start >= end) { preview.textContent = ''; return; }

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const hours    = ((eh * 60 + em) - (sh * 60 + sm)) / 60;

  if (hours < 1) {
    preview.textContent = 'Minimum 1 hour required.';
    preview.style.color = '#ef4444';
    return;
  }

  const total = (pricePerHour * hours).toLocaleString();
  preview.textContent = 'Total: ' + total + ' EGP for ' + hours + ' hour' + (hours !== 1 ? 's' : '');
  preview.style.color = 'var(--green)';
}

async function submitBooking(e) {
  e.preventDefault();

  const date      = document.getElementById('book-date').value;
  const startTime = document.getElementById('book-start').value;
  const endTime   = document.getElementById('book-end').value;
  const fieldId   = parseInt(document.getElementById('modal-field-id').value);
  const btn       = document.getElementById('book-confirm-btn');

  if (!date)                  { showNotif('Please select a date.', 'error'); return; }
  if (!startTime || !endTime) { showNotif('Please select start and end times.', 'error'); return; }
  if (startTime >= endTime)   { showNotif('End time must be after start time.', 'error'); return; }

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const hours    = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  if (hours < 1) { showNotif('Minimum booking duration is 1 hour.', 'error'); return; }

  btn.disabled    = true;
  btn.textContent = 'Confirming…';

  try {
    const res  = await fetch('/kickzone-fixed/backend/booking.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        user_id:    currentUser.id,
        field_id:   fieldId,
        date:       date,
        start_time: startTime,
        end_time:   endTime,
      }),
    });
    const data = await res.json();

    if (data.success) {
      closeBookingModal();
      showNotif('Booking confirmed! Redirecting to payment...', 'success');
      
      // Store booking ID for payment page
      sessionStorage.setItem('pendingBookingId', data.booking_id);
      
      // Redirect to payment page after 1.5 seconds
      setTimeout(() => {
        window.location.href = '../payment/index.html?booking_id=' + data.booking_id;
      }, 1500);
    } else {
      showNotif(data.message || 'Booking failed. Please try again.', 'error');
      btn.disabled    = false;
      btn.textContent = 'Confirm Booking';
    }
  } catch (_) {
    showNotif('Cannot reach server. Is XAMPP running?', 'error');
    btn.disabled    = false;
    btn.textContent = 'Confirm Booking';
  }
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFields();

  document.getElementById('modal-close').addEventListener('click', closeBookingModal);
  document.getElementById('booking-modal').addEventListener('click', function(e) {
    if (e.target === this) closeBookingModal();
  });
  document.getElementById('booking-form').addEventListener('submit', submitBooking);
  document.getElementById('book-start').addEventListener('change', updatePricePreview);
  document.getElementById('book-end').addEventListener('change', updatePricePreview);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBookingModal(); });
});
