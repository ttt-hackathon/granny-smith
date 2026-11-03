// Alerts section: turns High-risk suppliers from window.GS_RISK into alert cards with ready-to-send emails.
// Fills <div id="alerts">. Also has a clearly labelled TEST alert about Cataloochee Cell Works only.
(function () {
  'use strict';
  var TO = 'purchasing@laurelridge.example';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function actions(r) {
    var a = [], hasGap = r.runOutGaps.length > 0, noOrder = r.runOutGaps.some(function (g) { return g.no_order; });
    var overseas = r.leadTimeDays > 60;
    if (noOrder) a.push('Place a purchase order now, there is no open order for ' + r.runOutGaps.filter(function (g) { return g.no_order; }).map(function (g) { return g.part_number; }).join(', ') + '.');
    if (hasGap) {
      a.push('Confirm the ship date with ' + r.supplier_name + ' today and ask whether the order can be pulled forward.');
      a.push(overseas ? 'Ask about expediting or air-freighting the part that runs short, and get a price.' : 'Ask for an expedited truck delivery of the part that runs short.');
    }
    if (r.escalatingSignals.length) {
      a.push('Ask ' + r.supplier_name + ' how the reported event affects our orders and request an allocation of parts for us.');
      a.push('Stock up: bring forward the next order, or raise the order size, while supply is still available.');
    }
    if (r.soleSource) a.push('This supplier is sole-source for us. Check whether a second source could be approved, even as a short-term backup.');
    a.push('Tell production planning which bikes are exposed so they can reorder the build schedule if needed.');
    return a;
  }

  function bgLine(s) {
    return s.headline + ' (' + s.why + '; Source: ' + (s.source_name || 'link') + ', ' + s.date + ', ' + s.source_url + ')';
  }
  function bgItem(s, who) {
    return '<li>' + (who ? '<strong>' + esc(who) + ':</strong> ' : '') + esc(s.headline) + ' <span class="alerts-small">(<a href="' + esc(s.source_url) + '" target="_blank" rel="noopener">' + esc(s.source_name || 'source') + '</a>, ' + esc(s.date) + '; shown, not escalating: ' + esc(s.why) + ')</span></li>';
  }

  function buildEmail(r, isTest) {
    var D = window.LAUREL_RIDGE || {}, L = [];
    var prefix = isTest ? 'TEST: ' : '';
    var subject = prefix + 'Supply alert: ' + r.supplier_name + ' (' + r.level + ' risk)';
    if (isTest) L.push('*** THIS IS A TEST. The event below is made up to check the alert system. Do not act on it. ***', '');
    L.push('Hello purchasing team,', '');
    L.push('Our early-warning dashboard has flagged ' + r.supplier_name + ' as ' + r.level + ' risk as of ' + (D.asOf || 'today') + '.', '', 'What happened:');
    r.escalatingSignals.forEach(function (s) {
      L.push('- ' + s.headline + (s.summary ? ' ' + s.summary : '') + ' (Source: ' + (s.source_name || 'link') + ', ' + s.date + ', ' + s.source_url + ')');
    });
    var dataReasons = r.reasons.filter(function (x) { return !/real warning/.test(x); });
    if (r.runOutGaps.length || !r.escalatingSignals.length) {
      dataReasons.forEach(function (x) { L.push('- Our own numbers show: ' + x); });
    } else if (r.minWeeksCover != null) {
      L.push('- Our own numbers show ' + (r.soleSource ? 'this is a sole-source supplier' : 'a thin stock position') + ' with ' + r.minWeeksCover.toFixed(1) + ' weeks of cover on the thinnest part.');
    }
    if (r.backgroundSignals.length) {
      L.push('', 'Background notes (not disruptions):');
      r.backgroundSignals.forEach(function (s) { L.push('- ' + bgLine(s)); });
    }
    L.push('', 'Bikes at risk:');
    if (r.bikesAtRisk.length) {
      r.bikesAtRisk.forEach(function (b) { L.push('- ' + b.product_name + ' (we build ' + b.weekly_build_rate + ' per week)'); });
      L.push('About ' + money(r.weeklySalesAtRisk) + ' of weekly sales depends on this supplier (build rate times retail price).');
    } else L.push('- None found in the bill of materials.');
    L.push('', 'What we recommend:');
    actions(r).forEach(function (x, i) { L.push((i + 1) + '. ' + x); });
    L.push('', 'Please reply with what you find out and what you decide.', '', 'Thank you,', 'Supplier Early Warning Dashboard (Team Granny Smith)');
    return { to: TO, subject: subject, body: L.join('\n') };
  }

  function card(r, isTest) {
    var em = buildEmail(r, isTest);
    var id = 'alerts-ta-' + (isTest ? 'test' : r.supplier_id);
    var mailto = 'mailto:' + TO + '?subject=' + encodeURIComponent(em.subject) + '&body=' + encodeURIComponent(em.body);
    var full = 'To: ' + em.to + '\nSubject: ' + em.subject + '\n\n' + em.body;
    var what = [];
    r.escalatingSignals.forEach(function (s) {
      what.push('<li>' + esc(s.headline) + ' <span class="alerts-small">(<a href="' + esc(s.source_url) + '" target="_blank" rel="noopener">' + esc(s.source_name || 'source') + '</a>, ' + esc(s.date) + ')</span></li>');
    });
    r.reasons.forEach(function (x) { if (!/real warning/.test(x)) what.push('<li>Our own numbers show: ' + esc(x) + '</li>'); });
    var bikes = r.bikesAtRisk.map(function (b) { return esc(b.product_name); }).join(', ') || 'none';
    return '<div class="alerts-item' + (isTest ? ' alerts-itemtest' : '') + '">' +
      (isTest ? '<div class="alerts-banner">TEST ALERT: not real, nothing has actually happened</div>' : '') +
      '<h3>' + esc(r.supplier_name) + ' <span class="alerts-badge">' + esc(r.level) + ' risk</span></h3>' +
      '<p><strong>What happened</strong></p><ul>' + what.join('') + '</ul>' +
      (r.backgroundSignals.length ? '<p><strong>Background notes (not disruptions)</strong></p><ul>' + r.backgroundSignals.map(function (s) { return bgItem(s); }).join('') + '</ul>' : '') +
      '<p><strong>Bikes at risk:</strong> ' + bikes + (r.weeklySalesAtRisk ? ' (about ' + money(r.weeklySalesAtRisk) + ' of weekly sales)' : '') + '</p>' +
      '<p><strong>What purchasing should do</strong></p><ol>' + actions(r).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
      '<p><strong>Ready-to-send email</strong></p>' +
      '<textarea id="' + id + '" class="alerts-email" readonly rows="16">' + esc(full) + '</textarea>' +
      '<div class="alerts-row"><button type="button" class="alerts-btn" data-alerts-copy="' + id + '">Copy email</button> ' +
      '<a class="alerts-link" href="' + esc(mailto) + '">Open in my email program</a> <span class="alerts-small alerts-status"></span></div></div>';
  }

  var css =
    '.alerts-card{background:var(--card,#fff);border:1px solid var(--line,#d3dfe8);border-radius:12px;padding:20px 24px;color:var(--ink,#17323f)}' +
    '.alerts-card h2{margin:0 0 6px;font-size:22px}' +
    '.alerts-rule{background:#eaf1f6;border:1px solid var(--line,#d3dfe8);border-radius:8px;padding:10px 14px;font-size:14px;line-height:1.5;color:var(--muted,#4f6b7e)}' +
    '.alerts-rule ul{margin:4px 0 0;padding-left:20px}' +
    '.alerts-none{font-size:18px;font-weight:700;color:#1d5a37;margin:16px 0}' +
    '.alerts-item{border:2px solid #c0392b;border-radius:10px;padding:14px 18px;margin-top:16px;background:#fffafa}' +
    '.alerts-item h3{margin:0 0 8px;font-size:18px}' +
    '.alerts-item p{margin:8px 0 4px}.alerts-item ul,.alerts-item ol{margin:4px 0;padding-left:22px;line-height:1.5}' +
    '.alerts-badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:13px;background:#fde8e6;color:#8a1c14;border:1px solid #c0392b}' +
    '.alerts-itemtest{border-color:#6b3fa0;background:#faf7fe}' +
    '.alerts-banner{background:#6b3fa0;color:#fff;font-size:22px;font-weight:800;text-align:center;padding:12px;border-radius:6px;margin:0 0 12px;letter-spacing:.04em}' +
    '.alerts-email{width:100%;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.45;padding:10px;border:1px solid var(--line,#d3dfe8);border-radius:6px;background:#fff;color:var(--ink,#17323f)}' +
    '.alerts-row{margin-top:8px}' +
    '.alerts-btn{font:inherit;font-weight:600;background:var(--accent,#255572);color:#fff;border:0;border-radius:6px;padding:8px 14px;cursor:pointer}' +
    '.alerts-btn-test{background:#6b3fa0}' +
    '.alerts-link{margin-left:10px;color:var(--accent,#255572);font-weight:600}' +
    '.alerts-small{font-size:12px;color:var(--muted,#4f6b7e)}' +
    '.alerts-bg{margin-top:20px;border-top:1px dashed var(--line,#d3dfe8);padding-top:10px}.alerts-bg h3{margin:0 0 4px;font-size:16px}.alerts-bg ul{margin:4px 0;padding-left:22px;line-height:1.5;font-size:14px}' +
    '.alerts-testbox{margin-top:20px;border-top:1px dashed var(--line,#d3dfe8);padding-top:14px}';

  function testSignal(D) {
    return { supplier_id: 'S01', kind: 'news', headline: 'TEST: Fictional fire at Cataloochee Cell Works battery plant (made up, for testing only)',
      summary: 'This is a made-up test event and is not real.', source_name: 'Cataloochee Cell Works (test)',
      source_url: 'https://ttt-hackathon.github.io/cataloochee-cellworks/', date: (window.GS_RISK_RULE && window.GS_RISK_RULE.today) || D.asOf, confidence: 'high', severity: 'serious', test: true };
  }

  function render() {
    var box = document.getElementById('alerts');
    if (!box) return;
    var D = window.LAUREL_RIDGE;
    var risk = window.GS_RISK || [];
    var high = risk.filter(function (r) { return r.level === 'High'; });
    var html = '<style>' + css + '</style><div class="alerts-card"><h2>Alerts</h2>' +
      '<div class="alerts-rule"><strong>When we raise an alert:</strong><ul>' +
      '<li>a supplier\'s stock will run out before its next delivery arrives, or</li>' +
      '<li>a real weather or news warning is found for a supplier whose parts are sole-source or whose stock covers under 5 weeks, AND the warning is serious or watch level, medium or high confidence, dated within the last 30 days (since 2026-10-04), with a source link and date.</li></ul>' +
      '<div class="alerts-small">Other warnings (low confidence, older than 30 days, or info only) are still listed below as background notes, but they do not raise an alert.</div></div>';
    if (!D || !risk.length) html += '<p class="alerts-none" style="color:#7a4b00">Alerts could not be checked because the risk table did not load.</p>';
    else if (!high.length) html += '<p class="alerts-none">No alerts right now (as of ' + esc(D.asOf) + ').</p>';
    else html += '<p><strong>' + high.length + ' alert' + (high.length > 1 ? 's' : '') + ' right now (as of ' + esc(D.asOf) + ').</strong></p>' + high.map(function (r) { return card(r, false); }).join('');
    var bg = [];
    risk.forEach(function (r) { r.backgroundSignals.forEach(function (s) { bg.push(bgItem(s, r.supplier_name)); }); });
    html += '<div class="alerts-bg"><h3>Background notes (not disruptions)</h3>' +
      (bg.length ? '<p class="alerts-small">Real, sourced items that do not meet the alert rule. Worth knowing, no action required.</p><ul>' + bg.join('') + '</ul>' : '<p class="alerts-small">None.</p>') + '</div>';
    html += '<div class="alerts-testbox"><p class="alerts-small">Want to check that alerts work? This button shows a made-up warning about Cataloochee Cell Works (our fictional battery supplier). It is not added to the real warnings or the risk table.</p>' +
      '<button type="button" class="alerts-btn alerts-btn-test" id="alerts-testbtn">Run a TEST alert</button><div id="alerts-testout"></div></div></div>';
    box.innerHTML = html;

    box.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var copyId = t.getAttribute('data-alerts-copy');
      if (copyId) {
        var ta = document.getElementById(copyId), st = t.parentNode.querySelector('.alerts-status');
        var done = function () { if (st) st.textContent = 'Copied.'; };
        var fallback = function () { ta.focus(); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { if (st) st.textContent = 'Press Ctrl+C (or Cmd+C) to copy.'; } };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, fallback); else fallback();
      }
      if (t.id === 'alerts-testbtn') {
        var out = document.getElementById('alerts-testout');
        var res = typeof window.GS_RISK_ASSESS === 'function' ? window.GS_RISK_ASSESS([testSignal(D)]) : [];
        var r = res.filter(function (x) { return x.supplier_id === 'S01'; })[0];
        out.innerHTML = r ? card(r, true) : '<p class="alerts-small">The test could not run because the risk calculation is missing.</p>';
      }
    });
  }

  function run() { try { render(); } catch (e) { if (window.console) console.error('alerts.js', e); } }
  if (typeof window.addEventListener === 'function') window.addEventListener('load', run);
})();
