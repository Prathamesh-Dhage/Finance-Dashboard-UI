// ─── Transactions ────────────────────────────────────────────────────────────
const TransactionsModule = (() => {

  function init() {
    _populateCategoryFilter();
    _populateMonthFilter();
    _bindFilters();
    _bindSort();
    render();
  }

  function _populateCategoryFilter() {
    const sel = document.getElementById('filterCat');
    // Clear old
    sel.innerHTML = '<option value="">All Categories</option>';
    const cats = [...new Set(AppState.get().transactions.map(t => t.category))].sort();
    cats.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });

    // Also populate modal category select
    const fCat = document.getElementById('fCategory');
    if (fCat) {
      fCat.innerHTML = '';
      CATEGORIES.forEach(c => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c;
        fCat.appendChild(o);
      });
    }
  }

  function _populateMonthFilter() {
    const sel = document.getElementById('filterMonth');
    sel.innerHTML = '<option value="">All Months</option>';
    AppState.getUniqueMonths().forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = fmtMonth(m);
      sel.appendChild(o);
    });
  }

  function _bindFilters() {
    document.getElementById('searchInput').addEventListener('input', e => {
      AppState.setFilter('search', e.target.value);
      render();
    });
    document.getElementById('filterCat').addEventListener('change', e => {
      AppState.setFilter('category', e.target.value);
      render();
    });
    document.getElementById('filterType').addEventListener('change', e => {
      AppState.setFilter('type', e.target.value);
      render();
    });
    document.getElementById('filterMonth').addEventListener('change', e => {
      AppState.setFilter('month', e.target.value);
      render();
    });
    document.getElementById('clearFilters').addEventListener('click', () => {
      AppState.clearFilters();
      document.getElementById('searchInput').value = '';
      document.getElementById('filterCat').value = '';
      document.getElementById('filterType').value = '';
      document.getElementById('filterMonth').value = '';
      render();
    });
  }

  function _bindSort() {
    document.querySelectorAll('.tx-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        AppState.setSort(th.dataset.sort);
        _updateSortHeaders();
        render();
      });
    });
  }

  function _updateSortHeaders() {
    const { col, dir } = AppState.get().sort;
    document.querySelectorAll('.tx-table th[data-sort]').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.sort === col) th.classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');
    });
  }

  function render() {
    const isAdmin = AppState.get().role === 'admin';
    const list    = AppState.getFilteredTransactions();
    const body    = document.getElementById('txBody');
    const empty   = document.getElementById('tableEmpty');
    const count   = document.getElementById('txCount');

    count.textContent = `${list.length} record${list.length !== 1 ? 's' : ''} found`;

    if (!list.length) {
      body.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    body.innerHTML = '';
    list.forEach(tx => {
      const tr = document.createElement('tr');
      const color = CATEGORY_COLORS[tx.category] || '#888';
      tr.innerHTML = `
        <td class="tx-date">${tx.date}</td>
        <td class="tx-desc">${escHtml(tx.desc)}</td>
        <td><span class="tx-cat-badge" style="background:${color}18;color:${color}">${escHtml(tx.category)}</span></td>
        <td><span class="tx-type-badge badge-${tx.type}">${tx.type}</span></td>
        <td class="tx-amount amount-${tx.type}" style="text-align:right">${tx.type === 'income' ? '+' : '-'}${fmtUSDFull(tx.amount)}</td>
        <td class="admin-only ${isAdmin ? '' : 'hidden'} actions-col">
          <div class="tx-actions-cell">
            <button class="btn btn-edit edit-btn" data-id="${tx.id}">Edit</button>
            <button class="btn btn-danger del-btn" data-id="${tx.id}">Del</button>
          </div>
        </td>
      `;
      body.appendChild(tr);
    });

    // Bind inline action buttons
    body.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this transaction?')) {
          AppState.deleteTransaction(+btn.dataset.id);
          render();
          Charts.renderSummaryCards();
          Charts.renderBarChart();
          Charts.renderDonutChart();
          InsightsModule.render();
          showToast('Transaction deleted', 'success');
        }
      });
    });
    body.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tx = AppState.get().transactions.find(t => t.id === +btn.dataset.id);
        if (tx) ModalModule.open(tx);
      });
    });
  }

  return { init, render };
})();

// ─── Export CSV ──────────────────────────────────────────────────────────────
function exportCSV() {
  const list = AppState.getFilteredTransactions();
  const header = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = [header, ...list.map(t => [t.date, `"${t.desc}"`, t.category, t.type, t.amount])];
  const csv = rows.map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'ledger-transactions.csv';
  a.click();
}

// ─── Util ─────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 3000);
}
