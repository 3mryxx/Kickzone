/* ===================================================
   KICKZONE — Fields Map JavaScript
   Google Maps API Implementation with Professional UI
   =================================================== */

// ── All Egyptian soccer fields with coordinates ──────
const EGYPT_FIELDS = [
  // Cairo
  { id:1,  name:'Champions Arena',      loc:'Maadi, Cairo',           gov:'Cairo',       sport:'Football', price:350, rating:4.9, lat:29.9602, lng:31.2569, img:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&q=80' },
  { id:2,  name:'Stars Field',          loc:'Zamalek, Cairo',         gov:'Cairo',       sport:'Football', price:420, rating:4.8, lat:30.0650, lng:31.2238, img:'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&q=80' },
  { id:3,  name:'Heliopolis Ground',    loc:'Heliopolis, Cairo',      gov:'Cairo',       sport:'Futsal',   price:280, rating:4.6, lat:30.0908, lng:31.3428, img:'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80' },
  { id:11, name:'Maadi Club Field',     loc:'Maadi, Cairo',           gov:'Cairo',       sport:'Football', price:500, rating:4.8, lat:29.9622, lng:31.2499, img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' },
  { id:12, name:'Nasr City Ground',     loc:'Nasr City, Cairo',       gov:'Cairo',       sport:'Futsal',   price:240, rating:4.2, lat:30.0621, lng:31.3414, img:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80' },
  { id:13, name:'El Ahly Training',     loc:'Mokattam, Cairo',        gov:'Cairo',       sport:'Football', price:600, rating:5.0, lat:30.0181, lng:31.2891, img:'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=500&q=80' },
  { id:14, name:'Downtown Pitch',       loc:'Downtown Cairo',         gov:'Cairo',       sport:'Futsal',   price:220, rating:4.1, lat:30.0444, lng:31.2357, img:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80' },
  // Alexandria
  { id:4,  name:'Pro Pitch Alex',       loc:'Stanley, Alexandria',    gov:'Alexandria',  sport:'Football', price:300, rating:4.7, lat:31.2230, lng:29.9553, img:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80' },
  { id:5,  name:'Corniche Arena',       loc:'Miami, Alexandria',      gov:'Alexandria',  sport:'Football', price:250, rating:4.5, lat:31.2527, lng:29.9850, img:'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80' },
  { id:15, name:'Alex Sports Complex',  loc:'Smouha, Alexandria',     gov:'Alexandria',  sport:'Football', price:320, rating:4.6, lat:31.2197, lng:29.9533, img:'https://images.unsplash.com/photo-1518604964726-6ae8c99c5b5e?w=500&q=80' },
  { id:16, name:'Borg El-Arab Stadium', loc:'Borg El-Arab, Alex',     gov:'Alexandria',  sport:'Football', price:400, rating:4.8, lat:30.9214, lng:29.6631, img:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80' },
  // Giza
  { id:6,  name:'Pyramids Field',       loc:'Haram, Giza',            gov:'Giza',        sport:'Football', price:200, rating:4.4, lat:29.9750, lng:31.1305, img:'https://images.unsplash.com/photo-1518604964726-6ae8c99c5b5e?w=500&q=80' },
  { id:7,  name:'Dokki Sports Club',    loc:'Dokki, Giza',            gov:'Giza',        sport:'Futsal',   price:320, rating:4.7, lat:30.0395, lng:31.2111, img:'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500&q=80' },
  { id:17, name:'Giza Stadium Field',   loc:'Mohandessen, Giza',      gov:'Giza',        sport:'Football', price:280, rating:4.5, lat:30.0563, lng:31.1921, img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80' },
  // 6th October
  { id:8,  name:'October Arena',        loc:'6th October City',       gov:'6th October', sport:'Football', price:180, rating:4.3, lat:29.9341, lng:30.9315, img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80' },
  { id:18, name:'Dream Park Pitch',     loc:'6th October City',       gov:'6th October', sport:'Football', price:220, rating:4.4, lat:29.9241, lng:30.9515, img:'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80' },
  // New Cairo
  { id:9,  name:'Cairo Festival Pitch', loc:'New Cairo',              gov:'New Cairo',   sport:'Football', price:450, rating:4.9, lat:30.0290, lng:31.4714, img:'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=500&q=80' },
  { id:10, name:'East Field',           loc:'Rehab City, New Cairo',  gov:'New Cairo',   sport:'Football', price:380, rating:4.6, lat:30.0591, lng:31.4849, img:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&q=80' },
  { id:19, name:'El-Tagamoa Ground',    loc:'El-Tagamoa, New Cairo',  gov:'New Cairo',   sport:'Futsal',   price:340, rating:4.5, lat:30.0141, lng:31.4514, img:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80' },
  // Mansoura
  { id:20, name:'Mansoura Pitch',       loc:'El Mansoura City',       gov:'Mansoura',    sport:'Football', price:150, rating:4.3, lat:31.0369, lng:31.3806, img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80' },
  { id:21, name:'Dakahlia Arena',       loc:'Mansoura, Dakahlia',     gov:'Mansoura',    sport:'Football', price:130, rating:4.1, lat:31.0560, lng:31.3650, img:'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=500&q=80' },
  // Tanta
  { id:22, name:'Tanta Stadium Field',  loc:'Tanta, Gharbia',         gov:'Tanta',       sport:'Football', price:140, rating:4.2, lat:30.7865, lng:30.9965, img:'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&q=80' },
  // Aswan
  { id:23, name:'Aswan Nile Pitch',     loc:'Aswan City',             gov:'Aswan',       sport:'Football', price:120, rating:4.0, lat:24.0889, lng:32.8998, img:'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80' },
  // Luxor
  { id:24, name:'Luxor West Bank Field',loc:'Luxor City',             gov:'Luxor',       sport:'Football', price:100, rating:4.0, lat:25.6872, lng:32.6396, img:'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=500&q=80' },
  // Port Said
  { id:25, name:'Canal Zone Stadium',   loc:'Port Said City',         gov:'Port Said',   sport:'Football', price:160, rating:4.3, lat:31.2565, lng:32.2841, img:'https://images.unsplash.com/photo-1518604964726-6ae8c99c5b5e?w=500&q=80' },
  // Suez
  { id:26, name:'Suez Canal Arena',     loc:'Suez City',              gov:'Suez',        sport:'Football', price:170, rating:4.2, lat:29.9668, lng:32.5498, img:'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=500&q=80' },
  // Ismailia
  { id:27, name:'Ismailia Sports Field',loc:'Ismailia City',          gov:'Ismailia',    sport:'Football', price:155, rating:4.2, lat:30.6043, lng:32.2723, img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80' },
];

// ── State ─────────────────────────────────────────────
let filteredFields = [...EGYPT_FIELDS];
let map, markers = [], infoWindows = [], activeMarker = null;
let currentInfoWindow = null;

// ── Dark Mode Map Styling ─────────────────────────────
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9080' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  }
];

// ── Initialize Google Map ─────────────────────────────
function initMap() {
  if (typeof google === 'undefined') {
    console.error('Google Maps API not loaded. Add your API key to the HTML file.');
    document.getElementById('google-map').innerHTML = '<div style="padding: 20px; color: red;">Error: Google Maps API not loaded. Check console.</div>';
    return;
  }

  map = new google.maps.Map(document.getElementById('google-map'), {
    zoom: 6,
    center: { lat: 26.8206, lng: 30.8025 }, // Center of Egypt
    styles: mapStyle,
    mapTypeControl: true,
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: false,
  });

  renderMarkers();
  renderSidebarList();
}

// ── Create custom marker with SVG icon ────────────────
function createMarkerIcon(field) {
  const svgMarker = document.createElement('div');
  svgMarker.style.cssText = `
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(29,185,84,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
  `;
  svgMarker.innerHTML = '⚽';
  return svgMarker;
}

// ── Render markers ────────────────────────────────────
function renderMarkers() {
  // Clear existing
  markers.forEach(m => m.setMap(null));
  infoWindows.forEach(iw => iw.close());
  markers = [];
  infoWindows = [];

  filteredFields.forEach((field, idx) => {
    const marker = new google.maps.Marker({
      position: { lat: field.lat, lng: field.lng },
      map: map,
      title: field.name,
      icon: createMarkerIcon(field),
      animation: google.maps.Animation.DROP,
    });

    // Create info window content
    const infoContent = `
      <div style="
        font-family: system-ui, -apple-system, sans-serif;
        min-width: 260px;
        padding: 0;
        background: #0f0f0f;
        border: 2px solid #1db954;
        border-radius: 12px;
        overflow: hidden;
      ">
        <div style="
          height: 140px;
          background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
          background-image: url('${field.img}');
          background-size: cover;
          background-position: center;
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0,0,0,0.7);
            color: #1ed760;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 12px;
          ">${field.sport}</div>
        </div>
        <div style="padding: 12px;">
          <h3 style="margin: 0 0 8px 0; color: #fff; font-size: 16px; font-weight: bold;">⚽ ${field.name}</h3>
          <p style="margin: 0 0 4px 0; color: #bbb; font-size: 13px;">📍 ${field.loc}</p>
          <p style="margin: 0 0 4px 0; color: #bbb; font-size: 13px;">🏘️ ${field.gov}</p>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #333;
          ">
            <div style="color: #1ed760; font-weight: bold; font-size: 16px;">${field.price} EGP/hr</div>
            <div style="color: #ffc107; font-size: 13px;">⭐ ${field.rating}</div>
          </div>
          <a href="../browse/index.html" style="
            display: block;
            margin-top: 10px;
            background: #1db954;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            text-align: center;
            text-decoration: none;
            font-size: 13px;
            font-weight: bold;
            transition: all 0.2s;
          " onmouseover="this.style.background='#1ed760'" onmouseout="this.style.background='#1db954'">Book Now →</a>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
    });

    marker.addListener('click', () => {
      if (currentInfoWindow) currentInfoWindow.close();
      infoWindow.open(map, marker);
      currentInfoWindow = infoWindow;
      map.panTo(marker.getPosition());
      openPanel(field);
      highlightListItem(field.id);
    });

    markers.push(marker);
    infoWindows.push(infoWindow);
  });

  document.getElementById('field-count').textContent = filteredFields.length;
}

// ── Render sidebar list ───────────────────────────────
function renderSidebarList() {
  const list = document.getElementById('field-list');
  if (!filteredFields.length) {
    list.innerHTML = '<div class="map-loading">No fields found.</div>';
    return;
  }

  list.innerHTML = filteredFields.map(f => `
    <div class="field-list-item" id="fli-${f.id}" onclick="selectField(${f.id})">
      <div class="fli-thumb" style="background-image:url('${f.img}')"></div>
      <div class="fli-info">
        <div class="fli-name">${f.name}</div>
        <div class="fli-loc">📍 ${f.loc}</div>
        <div class="fli-price">${f.price} EGP/hr · ⭐ ${f.rating}</div>
      </div>
    </div>
  `).join('');
}

// ── Select a field (sidebar click) ───────────────────
function selectField(id) {
  const field = EGYPT_FIELDS.find(f => f.id === id);
  if (!field) return;

  // Pan map
  map.panTo({ lat: field.lat, lng: field.lng });
  map.setZoom(15);

  // Open info window on matching marker
  const idx = filteredFields.findIndex(f => f.id === id);
  if (idx >= 0 && markers[idx]) {
    if (currentInfoWindow) currentInfoWindow.close();
    infoWindows[idx].open(map, markers[idx]);
    currentInfoWindow = infoWindows[idx];
  }

  openPanel(field);
  highlightListItem(id);
}

// ── Highlight sidebar item ────────────────────────────
function highlightListItem(id) {
  document.querySelectorAll('.field-list-item').forEach(el => el.classList.remove('active'));
  const item = document.getElementById(`fli-${id}`);
  if (item) {
    item.classList.add('active');
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── Open detail panel ─────────────────────────────────
function openPanel(field) {
  document.getElementById('panel-img').style.backgroundImage = `url('${field.img}')`;
  document.getElementById('panel-name').textContent = field.name;
  document.getElementById('panel-loc').textContent  = `📍 ${field.loc}`;
  document.getElementById('panel-rating').textContent = `⭐ ${field.rating}`;
  document.getElementById('panel-price').textContent = `${field.price} EGP/hr`;
  document.getElementById('panel-tags').innerHTML = `
    <span class="panel-tag">${field.sport}</span>
    <span class="panel-tag">${field.gov}</span>
  `;
  document.getElementById('field-panel').classList.add('open');
}

// ── Close detail panel ────────────────────────────────
function closePanel() {
  document.getElementById('field-panel').classList.remove('open');
}

// ── Filter fields ─────────────────────────────────────
function filterMapFields() {
  const gov   = document.getElementById('gov-filter').value;
  const sport = document.getElementById('sport-filter').value;
  const q     = (document.getElementById('map-search').value || '').toLowerCase();

  filteredFields = EGYPT_FIELDS.filter(f => {
    if (gov   !== 'all' && f.gov   !== gov)   return false;
    if (sport !== 'all' && f.sport !== sport) return false;
    if (q && !f.name.toLowerCase().includes(q) && !f.loc.toLowerCase().includes(q)) return false;
    return true;
  });

  renderMarkers();
  renderSidebarList();
}

// ── Load map on DOM ready ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initMap, 500);
});
    return true;
  });

  renderMarkers();
  renderSidebarList();
  closePanel();

  // Fit map to markers
  if (filteredFields.length && markers.length) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

// ── Update nav if logged in ───────────────────────────
(function() {
  const user = getUser();
  const actions = document.getElementById('nav-actions');
  if (user && actions) {
    actions.innerHTML = `
      <a href="../player/index.html" class="btn btn-ghost">👤 ${user.name || 'Profile'}</a>
      <button class="btn btn-ghost" onclick="logout()">Logout</button>
    `;
  }
})();

// ── Boot ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initMap);

/* ── GOOGLE MAPS API INTEGRATION (for production) ──────
   To enable Google Maps instead of OpenStreetMap:
   1. Get a key at https://console.cloud.google.com
   2. Replace the Leaflet <script> tags in index.html with:
      <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initGoogleMap" async></script>
   3. Use this function:

function initGoogleMap() {
  const center = { lat: 26.8206, lng: 30.8025 };
  const gmap = new google.maps.Map(document.getElementById('google-map'), {
    zoom: 6, center,
    styles: [ // Dark mode
      { elementType:'geometry', stylers:[{color:'#0d1710'}] },
      { featureType:'road', stylers:[{color:'#1a2e1f'}] },
      { featureType:'water', stylers:[{color:'#051015'}] },
      { elementType:'labels.text.fill', stylers:[{color:'#7a8c82'}] },
    ]
  });

  EGYPT_FIELDS.forEach(field => {
    const marker = new google.maps.Marker({
      position: { lat: field.lat, lng: field.lng },
      map: gmap,
      title: field.name,
      icon: { path: google.maps.SymbolPath.CIRCLE, fillColor:'#1db954', fillOpacity:1, scale:10, strokeColor:'#080f0a', strokeWeight:2 }
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<h3>${field.name}</h3><p>${field.loc}</p><p>${field.price} EGP/hr</p>`
    });
    marker.addListener('click', () => { infoWindow.open(gmap, marker); openPanel(field); });
  });
}
──────────────────────────────────────────────────────── */
