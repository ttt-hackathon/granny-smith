// Stock-up advisor: for every part we can only buy from one supplier ("sole-source"), works out how long our
// stock lasts, how long a new order takes, what bikes would stop, and how much extra stock to hold.
// Fills <div id="stockup">. Uses only window.LAUREL_RIDGE (our purchasing data).
(function () {
  'use strict';

  // ---- ASSUMPTIONS (you can change these here, or type new numbers into the boxes on the page) ----
  var LONG_LEAD_DAYS = 84;      // a supplier with a lead time longer than this counts as "long lead time"
  var TARGET_WEEKS_LONG = 8;    // weeks of stock we want to hold for sole-source parts with a long lead time
  var TARGET_WEEKS_SHORT = 6;   // weeks of stock we want to hold for all other sole-source parts

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }
  function wk(n) { return (Math.round(n * 10) / 10) + ''; }

  var css =
    '.stockup-card{background:var(--card,#fff);border:1px solid var(--line,#d3dfe8);border-radius:12px;padding:20px 24px;color:var(--ink,#17323f)}' +
    '.stockup-card h2{margin:0 0 6px;font-size:22px}.stockup-card h3{margin:18px 0 6px;font-size:17px}' +
    '.stockup-note{color:var(--muted,#4f6b7e);font-size:14px;line-height:1.5;margin:0 0 10px}' +
    '.stockup-assume{background:#eaf1f6;border:1px solid var(--line,#d3dfe8);border-radius:8px;padding:10px 14px;font-size:14px;line-height:1.9}' +
    '.stockup-assume input{width:64px;font:inherit;padding:2px 6px;border:1px solid var(--line,#d3dfe8);border-radius:4px}' +
    '.stockup-total{font-size:18px;font-weight:700;margin:14px 0}' +
    '.stockup-top{margin:0;padding-left:22px;line-height:1.55}.stockup-top li{margin-bottom:8px}' +
    '.stockup-scroll{overflow-x:auto}.stockup-table{border-collapse:collapse;width:100%;font-size:14px;min-width:980px}' +
    '.stockup-table th{text-align:left;border-bottom:2px solid var(--line,#d3dfe8);padding:8px;color:var(--muted,#4f6b7e);font-size:12px;text-transform:uppercase;letter-spacing:.04em}' +
    '.stockup-table td{border-bottom:1px solid var(--line,#d3dfe8);padding:8px;vertical-align:top}' +
    '.stockup-table .stockup-num{text-align:right}.stockup-small{font-size:12px;color:var(--muted,#4f6b7e)}' +
    '.stockup-warn{background:#fff3d6;border:1px solid #d9951a;border-radius:8px;padding:8px 12px;font-size:14px;line-height:1.5;margin-top:12px}';

  function compute(D, longWeeks, shortWeeks, longDays) {
    var inv = {}, prod = {}, sup = {};
    D.inventory.forEach(function (r) { inv[r.part_number] = r; });
    D.products.forEach(function (p) { prod[p.product_id] = p; });
    D.suppliers.forEach(function (s) { sup[s.supplier_id] = s; });
    var rows = [];
    D.parts.forEach(function (p) {
      if (String(p.only_source).toLowerCase() !== 'yes') return;
      var i = inv[p.part_number] || {}, s = sup[p.supplier_id] || {};
      var weekly = +i.weekly_usage_units || 0, onHand = +i.on_hand_units || 0;
      var cover = weekly > 0 ? onHand / weekly : Infinity;
      var leadDays = +s.lead_time_days || 0, leadWeeks = leadDays / 7;
      var bikes = [], seen = {};
      D.bom.forEach(function (b) { if (b.part_number === p.part_number && !seen[b.product_id] && prod[b.product_id]) { seen[b.product_id] = 1; bikes.push(prod[b.product_id]); } });
      var weeklySales = bikes.reduce(function (a, b) { return a + (+b.weekly_build_rate) * (+b.retail_price_usd); }, 0);
      var target = leadDays > longDays ? longWeeks : shortWeeks;
      var extraWeeks = Math.max(0, target - cover);
      var extraUnits = Math.ceil(extraWeeks * weekly - 1e-9);
      var gapWeeks = Math.max(0, leadWeeks - cover); // weeks we would be without the part if we ordered today
      rows.push({
        part: p, supplier: s, weekly: weekly, onHand: onHand, cover: cover, leadDays: leadDays, leadWeeks: leadWeeks, bikes: bikes,
        weeklySales: weeklySales, target: target, extraWeeks: extraWeeks, extraUnits: extraUnits, cash: extraUnits * (+p.unit_cost_usd || 0),
        gapWeeks: gapWeeks, exposure: weeklySales * gapWeeks
      });
    });
    rows.sort(function (a, b) { return b.exposure - a.exposure || b.weeklySales - a.weeklySales || a.part.part_number.localeCompare(b.part.part_number); });
    return rows;
  }

  function reason(r) {
    var bikes = r.bikes.map(function (b) { return b.product_name; }).join(', ') || 'no bikes';
    return r.part.description + ' (' + r.supplier.supplier_name + ') is sole-source: no one else can supply it. We have ' + wk(r.cover) + ' weeks of stock, but a new order takes about ' +
      wk(r.leadWeeks) + ' weeks (' + r.leadDays + ' days), so a problem today could leave us ' + (r.gapWeeks > 0 ? wk(r.gapWeeks) + ' weeks short' : 'covered, if no other delays') +
      ' and stop ' + bikes + ' (about ' + money(r.weeklySales) + ' of sales a week). Holding ' + wk(r.target) + ' weeks means ' +
      (r.extraUnits > 0 ? 'buying ' + num(r.extraUnits) + ' more units (' + money(r.cash) + ' of cash).' : 'no extra stock is needed.');
  }

  function draw(box, D, vals) {
    var rows = compute(D, vals.long, vals.short, vals.days);
    var total = rows.reduce(function (a, r) { return a + r.cash; }, 0);
    var top = rows.filter(function (r) { return r.extraUnits > 0; }).slice(0, 5);
    var html = '<h3>Top recommendations</h3>' + (top.length ? '<ol class="stockup-top">' + top.map(function (r) { return '<li><strong>' + esc(r.part.part_number) + ' ' + esc(r.part.description) + ': hold ' + num(r.extraUnits) + ' extra units (' + money(r.cash) + ').</strong><br>' + esc(reason(r)) + '</li>'; }).join('') + '</ol>' : '<p class="stockup-note">With these assumptions no extra stock is needed.</p>') +
      '<div class="stockup-total">Total cash tied up if we follow every recommendation below: ' + money(total) + '</div>' +
      '<h3>All sole-source parts, ranked by exposure</h3><div class="stockup-scroll"><table class="stockup-table"><thead><tr><th>Part</th><th>Supplier</th><th class="stockup-num">Weeks of cover</th><th class="stockup-num">Supplier lead time (weeks)</th><th>Bikes it would stop</th><th class="stockup-num">Weekly sales at risk</th><th class="stockup-num">Target weeks</th><th class="stockup-num">Extra units</th><th class="stockup-num">Cash tied up</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><strong>' + esc(r.part.part_number) + '</strong><div class="stockup-small">' + esc(r.part.description) + '</div></td><td>' + esc(r.supplier.supplier_name) + '</td>' +
          '<td class="stockup-num">' + wk(r.cover) + '</td><td class="stockup-num">' + wk(r.leadWeeks) + '<div class="stockup-small">' + r.leadDays + ' days</div></td>' +
          '<td>' + esc(r.bikes.map(function (b) { return b.product_name; }).join(', ')) + '</td><td class="stockup-num">' + money(r.weeklySales) + '</td>' +
          '<td class="stockup-num">' + wk(r.target) + '</td><td class="stockup-num">' + num(r.extraUnits) + '</td><td class="stockup-num">' + money(r.cash) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    box.querySelector('.stockup-results').innerHTML = html;
  }

  function render() {
    var box = document.getElementById('stockup');
    if (!box) return;
    var D = window.LAUREL_RIDGE;
    if (!D || !D.parts) { box.innerHTML = '<div class="stockup-card"><h2>Stock-up advisor</h2><p class="stockup-note">Purchasing data did not load.</p></div>'; return; }
    box.innerHTML = '<style>' + css + '</style><div class="stockup-card"><h2>Stock-up advisor</h2>' +
      '<p class="stockup-note">For parts only one supplier can make, this shows how much extra stock to hold so that a supply problem does not stop a bike line. ' +
      'Exposure = weekly sales at risk x the weeks we would be without the part if we ordered today (lead time minus weeks of cover). Weeks of cover and sales use our data as of ' + esc(D.asOf) + '. Open orders already on the way are not counted here.</p>' +
      '<div class="stockup-assume"><strong>Assumptions (editable):</strong><br>' +
      'If a supplier\'s lead time is more than <input type="number" min="0" id="stockup-days" value="' + LONG_LEAD_DAYS + '"> days, hold <input type="number" min="0" step="0.5" id="stockup-long" value="' + TARGET_WEEKS_LONG + '"> weeks of stock; otherwise hold <input type="number" min="0" step="0.5" id="stockup-short" value="' + TARGET_WEEKS_SHORT + '"> weeks.<br>' +
      '<span class="stockup-small">Extra units = (target weeks minus weeks of cover) x weekly usage. Cash tied up = extra units x unit cost.</span></div>' +
      '<div class="stockup-results"></div>' +
      '<div class="stockup-warn"><strong>An honest limit:</strong> we do not have data on warehouse shelf space or how much cash we can spare, so these numbers show what the target would cost, not what we can afford. Check with finance and the warehouse before ordering.</div></div>';
    function read() {
      function v(id, d) { var x = parseFloat(document.getElementById(id).value); return isNaN(x) || x < 0 ? d : x; }
      return { days: v('stockup-days', LONG_LEAD_DAYS), long: v('stockup-long', TARGET_WEEKS_LONG), short: v('stockup-short', TARGET_WEEKS_SHORT) };
    }
    var again = function () { draw(box, D, read()); };
    ['stockup-days', 'stockup-long', 'stockup-short'].forEach(function (id) {
      var el = document.getElementById(id); el.addEventListener('input', again); el.addEventListener('change', again);
    });
    again();
  }

  function run() { try { render(); } catch (e) { if (window.console) console.error('stockup.js', e); } }
  if (typeof window.addEventListener === 'function') window.addEventListener('load', run);
})();
