/* ===================================================
   KICKZONE — Landing Page Script
   =================================================== */

// Redirect logged-in users to browse
(function () {
  const user = localStorage.getItem('kickzone_user');
  if (user) {
    // user is already logged in — optionally update nav
    const actions = document.querySelector('.nav-actions');
    if (actions) {
      const parsed = JSON.parse(user);
      actions.innerHTML = `
        <a href="../browse/index.html" class="btn btn-ghost">Browse</a>
        <a href="../player/index.html" class="btn btn-green">Hi, ${parsed.name || 'Player'} 👋</a>
      `;
    }
  }
})();
