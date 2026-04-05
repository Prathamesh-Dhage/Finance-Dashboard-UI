// ─── Modal ───────────────────────────────────────────────────────────────────
const ModalModule = (() => {
  let editingId = null;

  function open(tx = null) {
    editingId = tx ? tx.id : null;
    const title = document.getElementById('modalTitle');
    const submit = document.getElementById('submitBtn');
    title.textContent  = tx ? 'Edit Transaction' : 'Add Transaction';
    submit.textContent = tx ? 'Save Changes'     : 'Add Transaction';

    // Populate form
    document.getElementById('fDesc').value     = tx ? tx.desc     : '';
    document.getElementById('fAmount').value   = tx ? tx.amount   : '';
    document.getElementById('fDate').value     = tx ? tx.date     : new Date().toISOString().slice(0, 10);
    document.getElementById('fType').value     = tx ? tx.type     : 'expense';
    document.getElementById('fCategory').value = tx ? tx.category : CATEGORIES[0];

    // Clear errors
    ['fDesc','fAmount'].forEach(id => document.getElementById(id).classList.remove('error'));
    ['errDesc','errAmount'].forEach(id => document.getElementById(id).textContent = '');

    document.getElementById('modalOverlay').classList.remove('hidden');
    document.getElementById('fDesc').focus();
  }

  function close() {
    document.getElementById('modalOverlay').classList.add('hidden');
    editingId = null;
  }

  function init() {
    document.getElementById('modalClose').addEventListener('click', close);
    document.getElementById('cancelBtn').addEventListener('click', close);
    document.getElementById('modalOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modalOverlay')) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    document.getElementById('txForm').addEventListener('submit', e => {
      e.preventDefault();
      if (!_validate()) return;

      const tx = {
        desc:     document.getElementById('fDesc').value.trim(),
        amount:   parseFloat(document.getElementById('fAmount').value),
        date:     document.getElementById('fDate').value,
        type:     document.getElementById('fType').value,
        category: document.getElementById('fCategory').value,
      };

      if (editingId !== null) {
        AppState.updateTransaction(editingId, tx);
        showToast('Transaction updated', 'success');
      } else {
        AppState.addTransaction(tx);
        showToast('Transaction added', 'success');
      }

      close();
      _refreshAll();
    });
  }

  function _validate() {
    let ok = true;
    const desc   = document.getElementById('fDesc');
    const amount = document.getElementById('fAmount');

    if (!desc.value.trim()) {
      desc.classList.add('error');
      document.getElementById('errDesc').textContent = 'Description is required';
      ok = false;
    } else {
      desc.classList.remove('error');
      document.getElementById('errDesc').textContent = '';
    }

    const amt = parseFloat(amount.value);
    if (!amount.value || isNaN(amt) || amt <= 0) {
      amount.classList.add('error');
      document.getElementById('errAmount').textContent = 'Enter a valid amount > 0';
      ok = false;
    } else {
      amount.classList.remove('error');
      document.getElementById('errAmount').textContent = '';
    }

    return ok;
  }

  function _refreshAll() {
    Charts.renderSummaryCards();
    Charts.renderBarChart();
    Charts.renderDonutChart();
    TransactionsModule.render();
    InsightsModule.render();
  }

  return { init, open, close };
})();
