// Risk section: scores all 13 suppliers using our own numbers plus real warnings (window.GS_SIGNALS).
// Fills <div id="risk">. Exports window.GS_RISK (results) and window.GS_RISK_ASSESS(extraSignals) for alerts.js.
(function () {
  'use strict';
  var DAY = 86400000;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function parseDate(s) { var p = String(s).split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function iso(ms) { return new Date(ms).toISOString().slice(0, 10); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  // ---- The escalation rule (decided by the team's delegate) ----
  // "Today" for judging how old a warning is. Change this one line to move the clock.
  var TODAY = '2026-11-03';
  var FRESH_DAYS = 30; // a warning must be dated within this many days before TODAY to raise a supplier to High

  // A warning counts only if it has a supplier, a source link and a date (house rule: no unsourced warnings).
  function isReal(s) { return !!(s && s.supplier_id && s.source_url && s.date); }
  // Decide whether a real warning may raise a supplier to High. Returns the warning plus escalates (true/false) and why.
  function classify(s) {
    var why = [];
    if (s.severity !== 'serious' && s.severity !== 'watch') why.push('info only');
    if (s.confidence !== 'medium' && s.confidence !== 'high') why.push('low confidence');
    var age = (parseDate(TODAY) - parseDate(s.date)) / DAY;
    if (isNaN(age)) why.push('date could not be read');
    else if (age > FRESH_DAYS) why.push('older than ' + FRESH_DAYS + ' days');
    else if (age < 0) why.push('dated after today');
    var out = {};
    for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) out[k] = s[k];
    out.escalates = why.length === 0;
    out.why = why.join(', ');
    return out;
  }

  function assess(extraSignals) {
    var D = window.LAUREL_RIDGE;
    if (!D || !D.suppliers) return [];
    var asOf = parseDate(D.asOf);
    var signals = (window.GS_SIGNALS || []).concat(extraSignals || []).filter(isReal).map(classify);

    var inv = {}; (D.inventory || []).forEach(function (r) { inv[r.part_number] = r; });
    var prod = {}; (D.products || []).forEach(function (p) { prod[p.product_id] = p; });
    var firstArrival = {};
    (D.openOrders || []).forEach(function (o) {
      var t = parseDate(o.promised_arrival_date);
      if (!(o.part_number in firstArrival) || t < firstArrival[o.part_number].t) firstArrival[o.part_number] = { t: t, po: o.po_number };
    });

    var results = D.suppliers.map(function (s) {
      var parts = (D.parts || []).filter(function (p) { return p.supplier_id === s.supplier_id; });
      var minCover = Infinity, gaps = [], partInfo = [], soleSource = false;
      parts.forEach(function (p) {
        var i = inv[p.part_number] || {};
        var weekly = +i.weekly_usage_units || 0, onHand = +i.on_hand_units || 0;
        var perDay = weekly / 7;
        var cover = weekly > 0 ? onHand / weekly : Infinity;
        if (cover < minCover) minCover = cover;
        if (String(p.only_source).toLowerCase() === 'yes') soleSource = true;
        var runOutMs = perDay > 0 ? asOf + Math.floor(onHand / perDay) * DAY : null;
        var arr = firstArrival[p.part_number];
        var info = {
          part_number: p.part_number, description: p.description, only_source: String(p.only_source).toLowerCase() === 'yes',
          on_hand: onHand, weekly_usage: weekly, weeks_of_cover: cover,
          run_out_date: runOutMs ? iso(runOutMs) : null,
          next_arrival: arr ? iso(arr.t) : null, next_po: arr ? arr.po : null, gap_days: null, no_order: !arr
        };
        if (runOutMs !== null) {
          if (!arr) { info.gap_days = null; gaps.push(info); }
          else if (runOutMs < arr.t) { info.gap_days = Math.round((arr.t - runOutMs) / DAY); gaps.push(info); }
        }
        partInfo.push(info);
      });

      // Bikes that use any of this supplier's parts (they stop if the part runs out).
      var partNums = parts.map(function (p) { return p.part_number; });
      var bikeIds = {};
      (D.bom || []).forEach(function (b) { if (partNums.indexOf(b.part_number) >= 0) bikeIds[b.product_id] = true; });
      var bikes = Object.keys(bikeIds).map(function (id) {
        var p = prod[id] || {};
        return { product_id: id, product_name: p.product_name || id, weekly_build_rate: +p.weekly_build_rate || 0,
                 weekly_sales: (+p.weekly_build_rate || 0) * (+p.retail_price_usd || 0) };
      });
      var salesAtRisk = bikes.reduce(function (a, b) { return a + b.weekly_sales; }, 0);

      var sigs = signals.filter(function (x) { return x.supplier_id === s.supplier_id; });
      var strongSigs = sigs.filter(function (x) { return x.escalates; });
      var softSigs = sigs.filter(function (x) { return !x.escalates; });
      var onTime = +s.on_time_delivery_pct_last_12_months, lead = +s.lead_time_days;
      var lowCover = minCover < 5;

      var reasons = [], level = 'Low';
      gaps.forEach(function (g) {
        reasons.push(g.no_order
          ? g.part_number + ' (' + g.description + ') has no open order and runs out about ' + g.run_out_date + '.'
          : g.part_number + ' (' + g.description + ') runs out about ' + g.run_out_date + ', ' + g.gap_days + (g.gap_days === 1 ? ' day' : ' days') + ' before the next delivery on ' + g.next_arrival + '.');
      });
      if (gaps.length) level = 'High';
      if (strongSigs.length && (soleSource || lowCover)) {
        level = 'High';
        reasons.push(strongSigs.length + ' real warning' + (strongSigs.length > 1 ? 's' : '') + ' found, and this supplier is ' +
          (soleSource ? 'sole-source' : 'under 5 weeks of cover') + (soleSource && lowCover ? ' with under 5 weeks of cover' : '') + '.');
      }
      if (level !== 'High') {
        if (lowCover) { level = 'Medium'; reasons.push('Only ' + minCover.toFixed(1) + ' weeks of cover on the thinnest part (under 5).'); }
        if (onTime < 90) { level = 'Medium'; reasons.push('On-time delivery is ' + onTime + '% (under 90%).'); }
        if (lead > 90) { level = 'Medium'; reasons.push('Lead time is ' + lead + ' days (over 90).'); }
        if (strongSigs.length) reasons.push(strongSigs.length + ' real warning(s) found, but supply is not sole-source and cover is 5+ weeks.');
      }
      if (softSigs.length) reasons.push(softSigs.length + ' real warning' + (softSigs.length > 1 ? 's' : '') + ' shown, not escalating (' +
        softSigs.map(function (x) { return x.why; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join('; ') + ').');
      if (!reasons.length) reasons.push('Stock lasts until the next delivery, cover is 5+ weeks, on-time is ' + onTime + '%, lead time is ' + lead + ' days.');

      return {
        supplier_id: s.supplier_id, supplier_name: s.supplier_name, level: level, reasons: reasons,
        parts: partInfo, runOutGaps: gaps, bikesAtRisk: bikes, weeklySalesAtRisk: salesAtRisk, signals: sigs,
        escalatingSignals: strongSigs, backgroundSignals: softSigs,
        minWeeksCover: minCover === Infinity ? null : minCover, soleSource: soleSource, onTimePct: onTime, leadTimeDays: lead
      };
    });
    var order = { High: 0, Medium: 1, Low: 2 };
    results.sort(function (a, b) {
      return order[a.level] - order[b.level] || b.weeklySalesAtRisk - a.weeklySalesAtRisk || a.supplier_id.localeCompare(b.supplier_id);
    });
    return results;
  }

  window.GS_RISK_ASSESS = assess;
  window.GS_RISK_RULE = { today: TODAY, freshDays: FRESH_DAYS };

  var css =
    '.risk-card{background:var(--card,#fff);border:1px solid var(--line,#ddd8cc);border-radius:12px;padding:20px 24px;color:var(--ink,#1f2a24)}' +
    '.risk-card h2{margin:0 0 6px;font-size:22px}' +
    '.risk-note{color:var(--muted,#5b6b62);font-size:14px;line-height:1.5;margin:0 0 14px}' +
    '.risk-scroll{overflow-x:auto}' +
    '.risk-table{border-collapse:collapse;width:100%;font-size:14px;min-width:900px}' +
    '.risk-table th{text-align:left;border-bottom:2px solid var(--line,#ddd8cc);padding:8px;color:var(--muted,#5b6b62);font-size:12px;text-transform:uppercase;letter-spacing:.04em}' +
    '.risk-table td{border-bottom:1px solid var(--line,#ddd8cc);padding:10px 8px;vertical-align:top;line-height:1.45}' +
    '.risk-badge{display:inline-block;padding:3px 10px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid}' +
    '.risk-High{background:#fde8e6;color:#8a1c14;border-color:#c0392b}' +
    '.risk-Medium{background:#fff3d6;color:#7a4b00;border-color:#d9951a}' +
    '.risk-Low{background:#e3f2e8;color:#1d5a37;border-color:#2f6b4f}' +
    '.risk-reasons{margin:0;padding-left:16px}' +
    '.risk-small{color:var(--muted,#5b6b62);font-size:12px}' +
    '.risk-tag{display:inline-block;font-size:12px;border:1px solid var(--line,#ddd8cc);border-radius:4px;padding:0 5px;margin-right:4px}' +
    '.risk-warnings a{font-weight:600}';

  function render() {
    var box = document.getElementById('risk');
    if (!box) return;
    var D = window.LAUREL_RIDGE;
    if (!D) { box.innerHTML = '<div class="risk-card"><h2>Supplier risk</h2><p class="risk-note">Purchasing data did not load.</p></div>'; return; }
    var WARN_CHECKED = TODAY;
    var res = assess();
    window.GS_RISK = res;

    var rows = res.map(function (r) {
      var gapTxt = r.runOutGaps.length
        ? r.runOutGaps.map(function (g) { return esc(g.part_number) + (g.no_order ? ': no open order' : ': ' + g.gap_days + (g.gap_days === 1 ? ' day' : ' days') + ' short'); }).join('<br>')
        : 'None';
      var bikes = r.bikesAtRisk.length
        ? r.bikesAtRisk.map(function (b) { return esc(b.product_name); }).join(', ') +
          '<div class="risk-small">about ' + money(r.weeklySalesAtRisk) + ' per week in sales depends on this supplier</div>'
        : 'None';
      var n = r.signals.length;
      var warn = n
        ? r.signals.map(function (x) {
            return '<div><a href="#' + (x.kind === 'weather' ? 'weather' : 'news') + '">' + esc(x.kind === 'weather' ? 'Weather' : 'News') + ' warning</a> ' +
              (x.escalates ? '<span class="risk-tag">raises risk</span>' : '<span class="risk-tag">shown, not escalating</span><div class="risk-small">' + esc(x.why) + '</div>') + '</div>';
          }).join('')
        : '<span class="risk-small">No warnings found as of ' + esc(WARN_CHECKED) + '</span>';
      return '<tr>' +
        '<td><strong>' + esc(r.supplier_name) + '</strong><div class="risk-small">' + esc(r.supplier_id) + '</div></td>' +
        '<td><span class="risk-badge risk-' + r.level + '">' + r.level + ' risk</span></td>' +
        '<td><ul class="risk-reasons">' + r.reasons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></td>' +
        '<td>' + r.parts.map(function (p) { return esc(p.part_number); }).join(', ') + '</td>' +
        '<td>' + (r.minWeeksCover == null ? 'n/a' : r.minWeeksCover.toFixed(1) + ' wks') + '</td>' +
        '<td>' + gapTxt + '</td>' +
        '<td>' + (r.soleSource ? 'Yes' : 'No') + '</td>' +
        '<td>' + r.onTimePct + '%</td>' +
        '<td>' + r.leadTimeDays + ' days</td>' +
        '<td>' + bikes + '</td>' +
        '<td class="risk-warnings">' + warn + '</td></tr>';
    }).join('');

    var counts = { High: 0, Medium: 0, Low: 0 };
    res.forEach(function (r) { counts[r.level]++; });
    box.innerHTML = '<style>' + css + '</style><div class="risk-card">' +
      '<h2>Supplier risk</h2>' +
      '<p class="risk-note">As of ' + esc(D.asOf) + ': ' + counts.High + ' High, ' + counts.Medium + ' Medium, ' + counts.Low + ' Low. ' +
      '<strong>High</strong> = stock runs out before the next delivery, OR a real warning that is serious or watch level, medium or high confidence, dated within the last ' + FRESH_DAYS + ' days (since ' + iso(parseDate(TODAY) - FRESH_DAYS * DAY) + '), with a source link, on a sole-source supplier (or one with under 5 weeks of cover). ' +
      '<strong>Medium</strong> = under 5 weeks of cover, on-time record under 90%, or lead time over 90 days. <strong>Low</strong> = none of those. ' +
      'Other warnings (low confidence, older than ' + FRESH_DAYS + ' days, or info only) are still shown and counted, labelled &quot;shown, not escalating&quot;. ' +
      'Run-out dates assume normal weekly usage and count from the data date. Sales figures are weekly build rate times retail price.</p>' +
      '<div class="risk-scroll"><table class="risk-table"><thead><tr><th>Supplier</th><th>Risk</th><th>Why</th><th>Parts</th><th>Weeks of cover (lowest)</th><th>Runs out before delivery?</th><th>Sole source?</th><th>On-time</th><th>Lead time</th><th>Bikes that stop / sales at risk</th><th>Real warnings</th></tr></thead><tbody>' +
      rows + '</tbody></table></div></div>';
  }

  // Expose results even if the box is missing, so alerts.js can still work.
  function run() { try { render(); if (!window.GS_RISK && window.LAUREL_RIDGE) window.GS_RISK = assess(); } catch (e) { if (window.console) console.error('risk.js', e); } }
  if (typeof window.addEventListener === 'function') window.addEventListener('load', run);
})();
