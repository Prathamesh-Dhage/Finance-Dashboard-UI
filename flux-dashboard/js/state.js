// ─── State ───────────────────────────────────────────────────────────────────
const AppState = (() => {
  // Load persisted transactions or fall back to seed
  function loadTxs() {
    try {
      const s = localStorage.getItem('ledger_transactions');
      return s ? JSON.parse(s) : [...SEED_TRANSACTIONS];
    } catch { return [...SEED_TRANSACTIONS]; }
  }

  let state = {
    transactions: loadTxs(),
    role:         localStorage.getItem('ledger_role') || 'admin',
    activeTab:    'dashboard',
    theme:        localStorage.getItem('ledger_theme') || 'light',
    filters: {
      search:    '',
      category:  '',
      type:      '',
      month:     '',
    },
    sort: {
      col: 'date',
      dir: 'desc',
    },
    editingId: null,
  };

  const subscribers = [];
  function notify(changed) {
    subscribers.forEach(fn => fn(state, changed));
  }

  return {
    get: () => state,

    subscribe: (fn) => subscribers.push(fn),

    setRole(role) {
      state.role = role;
      localStorage.setItem('ledger_role', role);
      notify('role');
    },

    setTab(tab) {
      state.activeTab = tab;
      notify('tab');
    },

    setTheme(theme) {
      state.theme = theme;
      localStorage.setItem('ledger_theme', theme);
      notify('theme');
    },

    setFilter(key, value) {
      state.filters[key] = value;
      notify('filters');
    },

    clearFilters() {
      state.filters = { search: '', category: '', type: '', month: '' };
      notify('filters');
    },

    setSort(col) {
      if (state.sort.col === col) {
        state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort.col = col;
        state.sort.dir = col === 'amount' ? 'desc' : 'asc';
      }
      notify('sort');
    },

    addTransaction(tx) {
      const newTx = { ...tx, id: Date.now() };
      state.transactions = [newTx, ...state.transactions];
      this._persist();
      notify('transactions');
      return newTx;
    },

    updateTransaction(id, tx) {
      state.transactions = state.transactions.map(t => t.id === id ? { ...t, ...tx } : t);
      this._persist();
      notify('transactions');
    },

    deleteTransaction(id) {
      state.transactions = state.transactions.filter(t => t.id !== id);
      this._persist();
      notify('transactions');
    },

    _persist() {
      try {
        localStorage.setItem('ledger_transactions', JSON.stringify(state.transactions));
      } catch (e) { console.warn('Could not persist transactions', e); }
    },

    getFilteredTransactions() {
      const { filters, sort, transactions } = state;
      let list = [...transactions];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(t =>
          t.desc.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      }
      if (filters.category) list = list.filter(t => t.category === filters.category);
      if (filters.type)     list = list.filter(t => t.type === filters.type);
      if (filters.month)    list = list.filter(t => t.date.startsWith(filters.month));

      list.sort((a, b) => {
        let va = a[sort.col], vb = b[sort.col];
        if (sort.col === 'amount') { va = +va; vb = +vb; }
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sort.dir === 'asc' ? cmp : -cmp;
      });

      return list;
    },

    getMonthlyData() {
      // Returns last 6 months of income/expense
      const map = {};
      state.transactions.forEach(t => {
        const m = t.date.slice(0, 7);
        if (!map[m]) map[m] = { income: 0, expense: 0 };
        map[m][t.type] += t.amount;
      });
      return Object.entries(map)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6);
    },

    getCategoryData() {
      const map = {};
      state.transactions.filter(t => t.type === 'expense').forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
      return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#888' }));
    },

    getSummary() {
      const txs = state.transactions;
      const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      // This month vs last month
      const now  = new Date();
      const m0   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      const lm   = new Date(now.getFullYear(), now.getMonth()-1, 1);
      const m1   = `${lm.getFullYear()}-${String(lm.getMonth()+1).padStart(2,'0')}`;

      const thisMonthExp = txs.filter(t => t.type === 'expense' && t.date.startsWith(m0)).reduce((s,t)=>s+t.amount,0);
      const lastMonthExp = txs.filter(t => t.type === 'expense' && t.date.startsWith(m1)).reduce((s,t)=>s+t.amount,0);
      const thisMonthInc = txs.filter(t => t.type === 'income'  && t.date.startsWith(m0)).reduce((s,t)=>s+t.amount,0);
      const lastMonthInc = txs.filter(t => t.type === 'income'  && t.date.startsWith(m1)).reduce((s,t)=>s+t.amount,0);

      return { income, expense, balance: income - expense,
               thisMonthExp, lastMonthExp, thisMonthInc, lastMonthInc };
    },

    getUniqueMonths() {
      const months = [...new Set(state.transactions.map(t => t.date.slice(0, 7)))].sort().reverse();
      return months;
    },
  };
})();
