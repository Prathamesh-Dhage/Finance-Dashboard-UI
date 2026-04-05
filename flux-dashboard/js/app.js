// ─── App Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Theme ──
  applyTheme(AppState.get().theme);
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = AppState.get().theme === 'light' ? 'dark' : 'light';
    AppState.setTheme(next);
    applyTheme(next);
  });

  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    document.getElementById('themeIconSun').classList.toggle('hidden', t === 'dark');
    document.getElementById('themeIconMoon').classList.toggle('hidden', t === 'light');
  }

  // ── Date chip ──
  document.getElementById('dateChip').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  // ── Role ──
  const roleSelect = document.getElementById('roleSelect');
  roleSelect.value = AppState.get().role;
  applyRole(AppState.get().role);

  roleSelect.addEventListener('change', () => {
    AppState.setRole(roleSelect.value);
    applyRole(roleSelect.value);
    TransactionsModule.render(); // re-render to show/hide admin cols
    showToast(`Switched to ${roleSelect.value} role`);
  });

  function applyRole(role) {
    const isAdmin = role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => {
      el.classList.toggle('hidden', !isAdmin);
    });
    document.getElementById('rolePill').classList.toggle('viewer', !isAdmin);
    document.getElementById('roleText').textContent = isAdmin ? 'Admin' : 'Viewer';
    document.getElementById('mobileRole').textContent = isAdmin ? 'Admin' : 'Viewer';
  }

  // ── Tab navigation ──
  const tabs = {
    dashboard:    { title: 'Overview',      sub: 'Your financial picture at a glance' },
    transactions: { title: 'Transactions',  sub: 'Explore and manage your activity' },
    insights:     { title: 'Insights',      sub: 'What your data is telling you' },
  };

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  function switchTab(tab) {
    AppState.setTab(tab);
    // Update nav
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    // Update content
    document.querySelectorAll('.tab-content').forEach(el => {
      const active = el.id === `tab-${tab}`;
      el.classList.toggle('active', active);
      if (active) el.classList.add('tab-switching');
      setTimeout(() => el.classList.remove('tab-switching'), 350);
    });
    // Update title
    const info = tabs[tab];
    document.getElementById('pageTitle').textContent = info.title;
    document.getElementById('pageSubtitle').textContent = info.sub;
    // Lazy render
    if (tab === 'insights') InsightsModule.render();
    // Close mobile sidebar
    closeMobileSidebar();
  }

  // ── Mobile sidebar ──
  const sidebar  = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');

  // Overlay element
  const overlay  = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', closeMobileSidebar);

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }

  // ── Export ──
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  // ── Add TX button ──
  document.getElementById('addTxBtn').addEventListener('click', () => ModalModule.open());

  // ── Initial render ──
  Charts.renderSummaryCards();
  Charts.renderBarChart();
  Charts.renderDonutChart();
  TransactionsModule.init();
  ModalModule.init();

  // Kick off with initial role applied
  applyRole(AppState.get().role);
});
