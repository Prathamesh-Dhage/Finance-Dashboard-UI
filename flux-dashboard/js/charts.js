// ─── Formatters ──────────────────────────────────────────────────────────────
function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
function fmtUSDFull(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}
function fmtMonth(m) { // "2025-10" → "Oct '25"
  const [y, mo] = m.split('-');
  return new Date(+y, +mo-1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const Charts = (() => {
  function renderBarChart() {
    const wrap = document.getElementById('barChart');
    const data = AppState.getMonthlyData();

    // Clear old content except the empty state
    wrap.querySelectorAll('.bar-chart-area, .bar-labels, .bar-divider').forEach(el => el.remove());

    if (!data.length) {
      document.getElementById('barEmpty').classList.remove('hidden');
      return;
    }
    document.getElementById('barEmpty').classList.add('hidden');

    const max = Math.max(...data.flatMap(([, d]) => [d.income, d.expense])) || 1;
    const H = 140; // px height of chart area

    const area = document.createElement('div');
    area.className = 'bar-chart-area';

    data.forEach(([month, d], i) => {
      const group = document.createElement('div');
      group.className = 'bar-group';

      const pair = document.createElement('div');
      pair.className = 'bar-pair';

      // Income bar
      const bInc = document.createElement('div');
      bInc.className = 'bar bar-income';
      bInc.style.height = Math.max(Math.round((d.income / max) * H), 3) + 'px';
      bInc.style.animationDelay = (i * 0.06 + 0.05) + 's';
      const tipInc = document.createElement('div');
      tipInc.className = 'bar-tooltip';
      tipInc.textContent = fmtUSD(d.income);
      bInc.appendChild(tipInc);

      // Expense bar
      const bExp = document.createElement('div');
      bExp.className = 'bar bar-expense';
      bExp.style.height = Math.max(Math.round((d.expense / max) * H), 3) + 'px';
      bExp.style.animationDelay = (i * 0.06 + 0.08) + 's';
      const tipExp = document.createElement('div');
      tipExp.className = 'bar-tooltip';
      tipExp.textContent = fmtUSD(d.expense);
      bExp.appendChild(tipExp);

      pair.appendChild(bInc);
      pair.appendChild(bExp);

      const lbl = document.createElement('div');
      lbl.className = 'bar-xlabel';
      lbl.textContent = fmtMonth(month);

      group.appendChild(pair);
      group.appendChild(lbl);
      area.appendChild(group);
    });

    const divider = document.createElement('div');
    divider.className = 'bar-divider';

    wrap.appendChild(divider);
    wrap.appendChild(area);
  }

  // ─── Donut Chart ────────────────────────────────────────────────────────────
  function renderDonutChart() {
    const svg    = document.getElementById('donutSvg');
    const legend = document.getElementById('donutLegend');
    const data   = AppState.getCategoryData();

    svg.innerHTML = '';
    legend.innerHTML = '';

    if (!data.length) {
      document.getElementById('donutEmpty').classList.remove('hidden');
      svg.classList.add('hidden');
      legend.classList.add('hidden');
      return;
    }
    document.getElementById('donutEmpty').classList.add('hidden');
    svg.classList.remove('hidden');
    legend.classList.remove('hidden');

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = 60, cy = 60, r = 46, ri = 32;
    const gap = 0.025; // radians gap between segments
    let startAngle = -Math.PI / 2;

    // Background ring
    const bgRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgRing.setAttribute('cx', cx); bgRing.setAttribute('cy', cy);
    bgRing.setAttribute('r', (r + ri) / 2);
    bgRing.setAttribute('fill', 'none');
    bgRing.setAttribute('stroke', 'var(--bg-subtle)');
    bgRing.setAttribute('stroke-width', r - ri);
    svg.appendChild(bgRing);

    data.slice(0, 7).forEach((d, i) => {
      const angle = ((d.value / total) * Math.PI * 2) - gap;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;

      const x1 = cx + r * Math.cos(startAngle + gap/2);
      const y1 = cy + r * Math.sin(startAngle + gap/2);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const x3 = cx + ri * Math.cos(endAngle);
      const y3 = cy + ri * Math.sin(endAngle);
      const x4 = cx + ri * Math.cos(startAngle + gap/2);
      const y4 = cy + ri * Math.sin(startAngle + gap/2);
      const large = angle > Math.PI ? 1 : 0;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${x3},${y3} A${ri},${ri} 0 ${large},0 ${x4},${y4} Z`);
      path.setAttribute('fill', d.color);
      path.classList.add('donut-segment');
      path.setAttribute('title', `${d.name}: ${fmtUSD(d.value)}`);
      svg.appendChild(path);

      startAngle += angle + gap;
    });

    // Center text
    const txt1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt1.setAttribute('x', cx); txt1.setAttribute('y', cy - 6);
    txt1.setAttribute('text-anchor', 'middle'); txt1.setAttribute('dominant-baseline', 'middle');
    txt1.setAttribute('fill', 'var(--text-primary)');
    txt1.setAttribute('font-family', 'Playfair Display, serif');
    txt1.setAttribute('font-size', '11');
    txt1.setAttribute('font-weight', '700');
    txt1.textContent = fmtUSD(total);
    svg.appendChild(txt1);

    const txt2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt2.setAttribute('x', cx); txt2.setAttribute('y', cy + 8);
    txt2.setAttribute('text-anchor', 'middle');
    txt2.setAttribute('fill', 'var(--text-faint)');
    txt2.setAttribute('font-family', 'IBM Plex Mono, monospace');
    txt2.setAttribute('font-size', '6');
    txt2.textContent = 'total spend';
    svg.appendChild(txt2);

    // Legend
    data.slice(0, 7).forEach(d => {
      const pct = ((d.value / total) * 100).toFixed(1);
      const row = document.createElement('div');
      row.className = 'donut-row';
      row.innerHTML = `
        <div class="donut-dot" style="background:${d.color}"></div>
        <span class="donut-name">${d.name}</span>
        <div class="donut-mini-bar"><div class="donut-mini-fill" style="width:${pct}%;background:${d.color}"></div></div>
        <span class="donut-pct">${pct}%</span>
      `;
      legend.appendChild(row);
    });
  }

  // ─── Summary Cards ───────────────────────────────────────────────────────────
  function renderSummaryCards() {
    const s = AppState.getSummary();

    const expChange = s.lastMonthExp > 0 ? ((s.thisMonthExp - s.lastMonthExp) / s.lastMonthExp * 100).toFixed(1) : null;
    const incChange = s.lastMonthInc > 0 ? ((s.thisMonthInc - s.lastMonthInc) / s.lastMonthInc * 100).toFixed(1) : null;

    document.getElementById('cardBalance').textContent = fmtUSD(s.balance);
    document.getElementById('cardIncome').textContent  = fmtUSD(s.income);
    document.getElementById('cardExpense').textContent = fmtUSD(s.expense);

    const setDelta = (id, val, invertColor) => {
      const el = document.getElementById(id);
      if (val === null) { el.textContent = 'All time'; return; }
      const up = parseFloat(val) >= 0;
      const cls = invertColor ? (up ? 'delta-down' : 'delta-up') : (up ? 'delta-up' : 'delta-down');
      el.innerHTML = `<span class="${cls}">${up ? '↑' : '↓'} ${Math.abs(val)}%</span>&nbsp;vs last month`;
    };
    setDelta('cardBalanceDelta', null, false);
    setDelta('cardIncomeDelta', incChange, false);
    setDelta('cardExpenseDelta', expChange, true);
  }

  return { renderBarChart, renderDonutChart, renderSummaryCards };
})();
