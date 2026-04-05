// ─── Insights ────────────────────────────────────────────────────────────────
const InsightsModule = (() => {

  function render() {
    const txs  = AppState.get().transactions;
    const grid = document.getElementById('insightsGrid');
    const catBreak = document.getElementById('catBreakdown');

    if (!txs.length) {
      grid.innerHTML = '<div class="insight-card"><div class="insight-desc">Add transactions to see insights.</div></div>';
      catBreak.innerHTML = '';
      return;
    }

    const income  = txs.filter(t => t.type === 'income').reduce((s,t)=>s+t.amount,0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s,t)=>s+t.amount,0);

    // Category map
    const catMap = {};
    txs.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(catMap).sort((a,b) => b[1]-a[1]);
    const topCat = sortedCats[0];
    const leastCat = sortedCats[sortedCats.length-1];

    // Monthly expense averages
    const monthMap = {};
    txs.filter(t => t.type === 'expense').forEach(t => {
      const m = t.date.slice(0,7);
      monthMap[m] = (monthMap[m] || 0) + t.amount;
    });
    const monthVals = Object.values(monthMap);
    const avgMonthlyExp = monthVals.length ? monthVals.reduce((a,b)=>a+b,0)/monthVals.length : 0;

    // This vs last month expense
    const now  = new Date();
    const m0   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const lm   = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const m1   = `${lm.getFullYear()}-${String(lm.getMonth()+1).padStart(2,'0')}`;
    const thisMonthExp = txs.filter(t=>t.type==='expense'&&t.date.startsWith(m0)).reduce((s,t)=>s+t.amount,0);
    const lastMonthExp = txs.filter(t=>t.type==='expense'&&t.date.startsWith(m1)).reduce((s,t)=>s+t.amount,0);
    const momDiff = thisMonthExp - lastMonthExp;

    // Savings rate
    const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : '0.0';
    const srNum = parseFloat(savingsRate);

    const insights = [
      {
        icon: '🏆',
        label: 'Top Spending Category',
        value: topCat ? topCat[0] : '—',
        desc: topCat
          ? `${fmtUSD(topCat[1])} spent — ${((topCat[1]/expense)*100).toFixed(1)}% of total expenses.`
          : 'No expense data.',
      },
      {
        icon: '📉',
        label: 'Month-over-Month',
        value: momDiff === 0 ? 'No change' : (momDiff > 0 ? `+${fmtUSD(momDiff)}` : fmtUSD(momDiff)),
        desc: momDiff > 0
          ? `Spending rose ${fmtUSD(Math.abs(momDiff))} vs last month.`
          : momDiff < 0
          ? `Spending fell ${fmtUSD(Math.abs(momDiff))} vs last month. 🎉`
          : 'Same spending as last month.',
        accent: momDiff > 0 ? 'rose' : momDiff < 0 ? 'moss' : '',
      },
      {
        icon: '💰',
        label: 'Savings Rate',
        value: `${savingsRate}%`,
        desc: srNum >= 20
          ? `Excellent! Above the 20% benchmark — you're saving well.`
          : srNum > 0
          ? `Currently at ${savingsRate}%. Aim for 20%+ for a strong buffer.`
          : 'No savings this period.',
        accent: srNum >= 20 ? 'moss' : 'amber',
      },
      {
        icon: '📊',
        label: 'Avg Monthly Expenses',
        value: fmtUSD(avgMonthlyExp),
        desc: `Across ${monthVals.length} recorded month${monthVals.length !== 1 ? 's' : ''}. This month: ${fmtUSD(thisMonthExp)}.`,
      },
      {
        icon: '🌱',
        label: 'Lowest Spend Category',
        value: leastCat ? leastCat[0] : '—',
        desc: leastCat ? `Only ${fmtUSD(leastCat[1])} spent — your most controlled category.` : '—',
      },
      {
        icon: '🔢',
        label: 'Total Transactions',
        value: txs.length,
        desc: `${txs.filter(t=>t.type==='income').length} income · ${txs.filter(t=>t.type==='expense').length} expense records tracked.`,
      },
    ];

    grid.innerHTML = '';
    insights.forEach((ins, i) => {
      const card = document.createElement('div');
      card.className = `insight-card anim-in`;
      card.style.setProperty('--delay', i);

      let valueStyle = '';
      if (ins.accent === 'rose')  valueStyle = 'color:var(--rose)';
      if (ins.accent === 'moss')  valueStyle = 'color:var(--moss)';
      if (ins.accent === 'amber') valueStyle = 'color:var(--amber)';

      card.innerHTML = `
        <div class="insight-icon">${ins.icon}</div>
        <div class="insight-eyebrow">${ins.label}</div>
        <div class="insight-value" style="${valueStyle}">${ins.value}</div>
        <div class="insight-desc">${ins.desc}</div>
      `;
      grid.appendChild(card);
    });

    // Category breakdown bars
    catBreak.innerHTML = '';
    if (!sortedCats.length) {
      catBreak.innerHTML = '<p style="color:var(--text-faint);font-size:13px;padding:12px 0">No expense data yet.</p>';
      return;
    }
    const maxVal = sortedCats[0][1];
    sortedCats.forEach(([cat, val]) => {
      const color = CATEGORY_COLORS[cat] || '#888';
      const pct   = ((val / maxVal) * 100).toFixed(1);
      const row   = document.createElement('div');
      row.className = 'cat-row';
      row.innerHTML = `
        <span class="cat-name">${cat}</span>
        <div class="cat-bar-bg"><div class="cat-bar-fill" style="width:0%;background:${color}" data-pct="${pct}"></div></div>
        <span class="cat-amount">${fmtUSD(val)}</span>
      `;
      catBreak.appendChild(row);
    });

    // Animate bars after render
    requestAnimationFrame(() => requestAnimationFrame(() => {
      catBreak.querySelectorAll('.cat-bar-fill').forEach(el => {
        el.style.width = el.dataset.pct + '%';
      });
    }));
  }

  return { render };
})();
