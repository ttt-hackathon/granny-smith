// What-if section: "What if this supplier shuts down?" Pick a supplier and a number of weeks and the page
// replays our stock, day by day, from the data date, and shows which bikes stop and what sales are at risk.
// Fills <div id="whatif">. Uses only window.LAUREL_RIDGE (our purchasing data), not the warning feed.
(function () {
  'use strict';
  var DAY = 86400000;
  var RECOVERY_DAYS = 56;      // after the outage ends we keep counting for this many more days
  var DEFAULT_SUPPLIER = 'S04', DEFAULT_WEEKS = 4;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function parseDate(s) { var p = String(s).split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }

  var css =
    '.whatif-card{background:var(--card,#fff);border:1px solid var(--line,#ddd8cc);border-radius:12px;padding:20px 24px;color:var(--ink,#1f2a24)}' +
    '.whatif-card h2{margin:0 0 6px;font-size:22px}' +
    '.whatif-note{color:var(--muted,#5b6b62);font-size:14px;line-height:1.5;margin:0 0 10px}' +
    '.whatif-controls{display:flex;flex-wrap:wrap;gap:14px 28px;align-items:center;background:#f6f4ee;border:1px solid var(--line,#ddd8cc);border-radius:8px;padding:12px 16px;margin:10px 0}' +
    '.whatif-controls select{font:inherit;padding:4px 8px}.whatif-controls input[type=range]{width:220px;vertical-align:middle}' +
    '.whatif-sum{font-size:17px;line-height:1.5;font-weight:600;background:#fff3d6;border:1px solid #d9951a;border-radius:8px;padding:10px 14px;margin:12px 0}' +
    '.whatif-sum.whatif-ok{background:#e3f2e8;border-color:#2f6b4f}' +
    '.whatif-scroll{overflow-x:auto}.whatif-table{border-collapse:collapse;width:100%;font-size:14px;min-width:760px}' +
    '.whatif-table th{text-align:left;border-bottom:2px solid var(--line,#ddd8cc);padding:8px;color:var(--muted,#5b6b62);font-size:12px;text-transform:uppercase;letter-spacing:.04em}' +
    '.whatif-table td{border-bottom:1px solid var(--line,#ddd8cc);padding:8px;vertical-align:top}' +
    '.whatif-num{text-align:right!important}.whatif-small{font-size:12px;color:var(--muted,#5b6b62)}' +
    '.whatif-simp{font-size:13px;color:var(--muted,#5b6b62);line-height:1.5;margin:12px 0 0;padding-left:20px}';

  // Replay stock day by day. outageSupplier may be null (normal run). Day 0 is the data date.
  function simulate(D, outageSupplier, outageDays, horizon) {
    var asOf = parseDate(D.asOf);
    var stock = {}, partSupplier = {};
    D.inventory.forEach(function (r) { stock[r.part_number] = +r.on_hand_units || 0; });
    D.parts.forEach(function (p) { partSupplier[p.part_number] = p.supplier_id; });
    // Deliveries by day. An outage supplier's orders promised during the outage arrive the first day after it.
    var arrivals = {};
    D.openOrders.forEach(function (o) {
      var d = Math.round((parseDate(o.promised_arrival_date) - asOf) / DAY);
      if (d < 0) d = 0;
      if (outageSupplier && o.supplier_id === outageSupplier && d < outageDays) d = outageDays;
      (arrivals[d] = arrivals[d] || []).push(o);
    });
    var models = D.products.map(function (p) {
      return { id: p.product_id, name: p.product_name, rate: +p.weekly_build_rate || 0, price: +p.retail_price_usd || 0,
        bom: D.bom.filter(function (b) { return b.product_id === p.product_id; }).map(function (b) { return { part: b.part_number, qty: +b.qty_per_bike || 0 }; }),
        built: 0, stopDay: null, stoppedDays: 0, blockers: {}, firstBlocker: null };
    });
    var firstLack = {}; // part -> first day any bike could not get a full day of it
    for (var d = 0; d < horizon; d++) {
      (arrivals[d] || []).forEach(function (o) { stock[o.part_number] = (stock[o.part_number] || 0) + (+o.quantity || 0); });
      models.forEach(function (m) {
        var perDay = m.rate / 7, lacking = m.bom.filter(function (b) { return (stock[b.part] || 0) < b.qty * perDay - 1e-9; });
        if (lacking.length) {
          m.stoppedDays++;
          if (m.stopDay === null) { m.stopDay = d; m.firstBlocker = lacking[0].part; }
          lacking.forEach(function (b) { m.blockers[b.part] = (m.blockers[b.part] || 0) + 1; if (!(b.part in firstLack)) firstLack[b.part] = d; });
        } else {
          m.bom.forEach(function (b) { stock[b.part] -= b.qty * perDay; });
          m.built += perDay;
        }
      });
    }
    return { models: models, firstLack: firstLack, partSupplier: partSupplier };
  }

  function earliest(firstLack, filterFn) {
    var best = null;
    Object.keys(firstLack).forEach(function (p) { if (filterFn(p) && (best === null || firstLack[p] < best.day)) best = { part: p, day: firstLack[p] }; });
    return best;
  }

  function analyse(D, supplierId, weeks) {
    var outageDays = weeks * 7, horizon = outageDays + RECOVERY_DAYS;
    var base = simulate(D, null, 0, horizon), hit = simulate(D, supplierId, outageDays, horizon);
    var asOf = parseDate(D.asOf);
    function date(day) { return new Date(asOf + day * DAY).toISOString().slice(0, 10); }
    var partDesc = {}; D.parts.forEach(function (p) { partDesc[p.part_number] = p.description; });
    var rows = hit.models.map(function (m, i) {
      var b = base.models[i], plan = m.rate * horizon / 7;
      return { m: m, b: b, plan: plan, lostVsPlan: plan - m.built, lostCaused: Math.max(0, b.built - m.built) };
    });
    return { weeks: weeks, outageDays: outageDays, horizon: horizon, rows: rows, date: date, partDesc: partDesc,
      first: earliest(hit.firstLack, function () { return true; }),
      firstOwn: earliest(hit.firstLack, function (p) { return hit.partSupplier[p] === supplierId; }),
      firstBase: earliest(base.firstLack, function () { return true; }), base: base, hit: hit };
  }

  function show(box, D) {
    var sid = document.getElementById('whatif-sup').value, weeks = parseInt(document.getElementById('whatif-wk').value, 10) || 1;
    document.getElementById('whatif-wkout').textContent = weeks + (weeks === 1 ? ' week' : ' weeks');
    var sup = D.suppliers.filter(function (s) { return s.supplier_id === sid; })[0];
    var a = analyse(D, sid, weeks);
    var stopped = a.rows.filter(function (r) { return r.m.stopDay !== null; });
    var caused = a.rows.reduce(function (t, r) { return t + r.lostCaused; }, 0);
    var revenue = a.rows.reduce(function (t, r) { return t + r.lostCaused * r.m.price; }, 0);
    var totalLost = a.rows.reduce(function (t, r) { return t + r.lostVsPlan; }, 0);
    var totalRev = a.rows.reduce(function (t, r) { return t + r.lostVsPlan * r.m.price; }, 0);
    var names = function (arr) { return arr.map(function (r) { return r.m.name; }).join(', ').replace(/, ([^,]*)$/, ' and $1'); };

    var sentence;
    if (!stopped.length) {
      sentence = 'If ' + sup.supplier_name + ' shut down for ' + weeks + (weeks === 1 ? ' week' : ' weeks') + ' starting ' + D.asOf + ', our stock would carry every bike through the outage and the following ' + RECOVERY_DAYS / 7 + ' weeks, with no bikes stopped.';
    } else {
      sentence = 'If ' + sup.supplier_name + ' shut down for ' + weeks + (weeks === 1 ? ' week' : ' weeks') + ' starting ' + D.asOf + ', ' + names(stopped) + ' would stop building' +
        (stopped.length === 1 ? ' on ' + a.date(stopped[0].m.stopDay) : ' (the first on ' + a.date(Math.min.apply(null, stopped.map(function (r) { return r.m.stopDay; }))) + ')') + '. ' +
        'Measured against the production plan, about ' + num(totalLost) + ' bikes (' + money(totalRev) + ' of sales) go unbuilt over the next ' + Math.round(a.horizon / 7) + ' weeks. ' +
        (caused > 0.5 ? 'About ' + num(caused) + ' of those (' + money(revenue) + ') are extra losses caused by this outage; the rest would happen anyway.'
          : 'None of those are extra losses from this outage: they would happen anyway.') +
        ' (Our data lists only the orders already on the way, so some parts run short within weeks even with no outage.)';
    }
    var firstTxt = a.first
      ? esc(a.first.part) + ' (' + esc(a.partDesc[a.first.part]) + ') is the first part to run out, on ' + a.date(a.first.day) +
        (a.firstBase && a.firstBase.part === a.first.part && a.firstBase.day === a.first.day ? ' (this would happen even with no outage).' : '.')
      : 'No part runs out in this period.';
    var ownTxt = a.firstOwn ? esc(a.firstOwn.part) + ' (' + esc(a.partDesc[a.firstOwn.part]) + ') is the first part from ' + esc(sup.supplier_name) + ' to run out, on ' + a.date(a.firstOwn.day) + '.' : 'None of ' + esc(sup.supplier_name) + '\'s parts run out in this period.';

    document.getElementById('whatif-out').innerHTML =
      '<div class="whatif-sum' + (stopped.length ? '' : ' whatif-ok') + '">' + esc(sentence) + '</div>' +
      '<p class="whatif-note"><strong>First part to run out:</strong> ' + firstTxt + '<br><strong>From this supplier:</strong> ' + ownTxt + '</p>' +
      '<div class="whatif-scroll"><table class="whatif-table"><thead><tr><th>Bike</th><th>Stops on</th><th>Days stopped</th><th>Held up by</th><th class="whatif-num">Built (' + Math.round(a.horizon / 7) + ' wks)</th><th class="whatif-num">Not built vs. plan</th><th class="whatif-num">Of which caused by the outage</th><th class="whatif-num">Sales at risk (caused by outage)</th></tr></thead><tbody>' +
      a.rows.map(function (r) {
        var m = r.m, blk = Object.keys(m.blockers).sort(function (x, y) { return m.blockers[y] - m.blockers[x]; }).slice(0, 3);
        return '<tr><td><strong>' + esc(m.name) + '</strong></td><td>' + (m.stopDay === null ? 'Keeps building' : a.date(m.stopDay) +
          (r.b.stopDay !== null && r.b.stopDay <= m.stopDay ? '<div class="whatif-small">would stop on ' + a.date(r.b.stopDay) + ' even with no outage</div>' : '')) + '</td>' +
          '<td>' + m.stoppedDays + '</td><td>' + (blk.length ? esc(blk.join(', ')) : 'nothing') + '</td><td class="whatif-num">' + num(m.built) + '</td>' +
          '<td class="whatif-num">' + num(r.lostVsPlan) + '</td><td class="whatif-num">' + num(r.lostCaused) + '</td><td class="whatif-num">' + money(r.lostCaused * m.price) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function render() {
    var box = document.getElementById('whatif');
    if (!box) return;
    var D = window.LAUREL_RIDGE;
    if (!D || !D.suppliers) { box.innerHTML = '<div class="whatif-card"><h2>What if a supplier shuts down?</h2><p class="whatif-note">Purchasing data did not load.</p></div>'; return; }
    box.innerHTML = '<style>' + css + '</style><div class="whatif-card"><h2>What if this supplier shuts down?</h2>' +
      '<p class="whatif-note">Pick a supplier and how long it is out. The page replays our stock from ' + esc(D.asOf) + ' day by day, using what is on our shelves and the orders already on the way. It updates as you change the choices.</p>' +
      '<div class="whatif-controls"><label>Supplier: <select id="whatif-sup">' +
      D.suppliers.map(function (s) { return '<option value="' + esc(s.supplier_id) + '"' + (s.supplier_id === DEFAULT_SUPPLIER ? ' selected' : '') + '>' + esc(s.supplier_name) + ' (' + esc(s.supplier_id) + ')</option>'; }).join('') +
      '</select></label><label>Shut down for: <input type="range" id="whatif-wk" min="1" max="26" step="1" value="' + DEFAULT_WEEKS + '"> <strong id="whatif-wkout"></strong></label></div>' +
      '<div id="whatif-out" aria-live="polite"></div>' +
      '<ul class="whatif-simp"><strong>Simplifications:</strong>' +
      '<li>The outage starts on the data date (day 0). That supplier\'s deliveries promised during the outage arrive on the first day after it ends; its later deliveries arrive as promised. Other suppliers deliver on their promised dates.</li>' +
      '<li>A bike is built on a day only if every part in its bill of materials is in stock for that day; then it uses weekly build rate / 7 of each part. If any part is missing, nothing on that bike is used that day, so other parts are saved.</li>' +
      '<li>Bikes share parts, and are served in the order Ridgeline Trail, Mill River Commuter, Haywood Cargo when stock is tight.</li>' +
      '<li>No overtime or catch-up builds, no extra orders beyond the open ones, no air freight, no substitute parts, and no demand changes. Safety stock is treated as usable stock.</li>' +
      '<li>"Not built vs. plan" counts every bike below the normal weekly rate; "caused by the outage" compares with a run of the same dates with no outage. Several parts run short even without an outage, which is why both are shown.</li>' +
      '<li>Counting covers the outage plus ' + RECOVERY_DAYS / 7 + ' weeks afterwards. Revenue is bikes lost x retail price, not profit.</li></ul></div>';
    var again = function () { try { show(box, D); } catch (e) { if (window.console) console.error('whatif.js', e); } };
    ['whatif-sup', 'whatif-wk'].forEach(function (id) {
      var el = document.getElementById(id); el.addEventListener('change', again); el.addEventListener('input', again);
    });
    again();
  }

  function run() { try { render(); } catch (e) { if (window.console) console.error('whatif.js', e); } }
  if (typeof window.addEventListener === 'function') window.addEventListener('load', run);
})();
