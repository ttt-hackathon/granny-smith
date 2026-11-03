// Map section: a simple world map (drawn with plain SVG, no map tiles or libraries) of our 13 supplier
// factories, the two US ports and our home in Hendersonville, coloured by risk level from window.GS_RISK.
// Fills <div id="map">. Below the map is an "eggs in one basket" summary worked out from our spend data.
(function () {
  'use strict';

  // Where each place is (latitude, longitude). Suppliers share a spot when they share a city.
  var PLACES = {
    S01: [35.49, -82.99, 'Waynesville'], S02: [48.10, 20.78, 'Miskolc'], S03: [31.30, 120.58, 'Suzhou'],
    S04: [24.15, 120.67, 'Taichung (Dajia)'], S05: [24.15, 120.67, 'Taichung'], S06: [1.58, 103.52, 'Pekan Nanas'],
    S07: [22.99, 120.21, 'Tainan'], S08: [24.15, 120.67, 'Taichung'], S09: [51.27, 8.87, 'Korbach'],
    S10: [47.14, 7.25, 'Biel'], S11: [51.11, 7.64, 'Meinerzhagen'], S12: [45.67, 11.57, 'Pozzoleone'],
    S13: [42.53, -87.90, 'Pleasant Prairie']
  };
  var OTHER = [
    { id: 'HQ', kind: 'home', name: 'Hendersonville NC (our factory)', short: 'Hendersonville', lat: 35.32, lon: -82.46 },
    { id: 'SAV', kind: 'port', name: 'Port of Savannah', short: 'Savannah', lat: 32.08, lon: -81.09 },
    { id: 'CHS', kind: 'port', name: 'Port of Charleston', short: 'Charleston', lat: 32.78, lon: -79.93 }
  ];
  // Map frame: longitudes -100..135, latitudes 60..-5, 5 drawing units per degree, 40 units of margin.
  var LON0 = -100, LON1 = 135, LAT0 = 60, LAT1 = -5, S = 5, M = 40;
  var W = (LON1 - LON0) * S + 2 * M, H = (LAT0 - LAT1) * S + 2 * M;
  function px(lon) { return M + (lon - LON0) * S; }
  function py(lat) { return M + (LAT0 - lat) * S; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function pct(n) { return (Math.round(n * 10) / 10) + '%'; }

  var COLORS = { High: '#c0392b', Medium: '#d9951a', Low: '#2f6b4f', Unknown: '#8a8f8c' };
  var LETTER = { High: 'H', Medium: 'M', Low: 'L', Unknown: '?' };

  var css =
    '.map-card{background:var(--card,#fff);border:1px solid var(--line,#d3dfe8);border-radius:12px;padding:20px 24px;color:var(--ink,#17323f)}' +
    '.map-card h2{margin:0 0 6px;font-size:22px}.map-card h3{margin:20px 0 6px;font-size:17px}' +
    '.map-note{color:var(--muted,#4f6b7e);font-size:14px;line-height:1.5;margin:0 0 10px}' +
    '.map-svg{width:100%;height:auto;display:block;background:#f3f6f7;border:1px solid var(--line,#d3dfe8);border-radius:8px}' +
    '.map-marker{cursor:pointer}.map-marker:focus{outline:none}.map-marker:focus .map-shape,.map-marker:hover .map-shape{stroke:#000;stroke-width:2.5}' +
    '.map-legend{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13px;margin:10px 0}' +
    '.map-detail{min-height:44px;background:#eaf1f6;border:1px solid var(--line,#d3dfe8);border-radius:8px;padding:8px 12px;font-size:14px;line-height:1.45}' +
    '.map-table{border-collapse:collapse;font-size:14px;min-width:360px}' +
    '.map-table th{text-align:left;border-bottom:2px solid var(--line,#d3dfe8);padding:6px 10px;font-size:12px;color:var(--muted,#4f6b7e);text-transform:uppercase}' +
    '.map-table td{border-bottom:1px solid var(--line,#d3dfe8);padding:6px 10px}.map-table td.map-num,.map-table th.map-num{text-align:right}' +
    '.map-tables{display:flex;flex-wrap:wrap;gap:20px;overflow-x:auto}' +
    '.map-basket{background:#fff3d6;border:1px solid #d9951a;border-radius:8px;padding:10px 14px;font-size:15px;line-height:1.5;margin:10px 0}';

  // Spread out markers that sit on top of each other, so every one stays visible.
  function spread(items) {
    var MIN = 46, i, j, it;
    items.forEach(function (m, k) { m.x = m.tx + (k % 3) * 0.01; m.y = m.ty + (k % 5) * 0.01; });
    for (var iter = 0; iter < 300; iter++) {
      for (i = 0; i < items.length; i++) for (j = i + 1; j < items.length; j++) {
        var a = items[i], b = items[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < MIN) {
          if (d < 0.001) { var ang = (i * 7 + j * 3) * 0.9; dx = Math.cos(ang); dy = Math.sin(ang); d = 1; }
          var push = (MIN - d) / 2 + 0.01;
          a.x -= dx / d * push; a.y -= dy / d * push; b.x += dx / d * push; b.y += dy / d * push;
        }
      }
      // Gentle pull back towards the true location so markers don't drift away.
      for (i = 0; i < items.length; i++) { it = items[i]; it.x += (it.tx - it.x) * 0.02; it.y += (it.ty - it.y) * 0.02; }
    }
  }

  function shape(level, x, y) {
    var c = COLORS[level], base = 'class="map-shape" fill="' + c + '" stroke="#fff" stroke-width="1.5"';
    if (level === 'High') return '<polygon ' + base + ' points="' + x + ',' + (y - 13) + ' ' + (x + 13) + ',' + y + ' ' + x + ',' + (y + 13) + ' ' + (x - 13) + ',' + y + '"/>';
    if (level === 'Medium') return '<rect ' + base + ' x="' + (x - 10) + '" y="' + (y - 10) + '" width="20" height="20" rx="2"/>';
    return '<circle ' + base + ' cx="' + x + '" cy="' + y + '" r="11"/>';
  }

  function graticule() {
    var g = '', lon, lat;
    for (lon = -100; lon <= 130; lon += 10) {
      g += '<line x1="' + px(lon) + '" y1="' + M + '" x2="' + px(lon) + '" y2="' + (H - M) + '" stroke="#d4dde0" stroke-width="1"/>' +
        '<text x="' + px(lon) + '" y="' + (H - M + 14) + '" font-size="10" fill="#7b8a90" text-anchor="middle">' + Math.abs(lon) + (lon < 0 ? 'W' : lon > 0 ? 'E' : '') + '</text>';
    }
    for (lat = -0; lat <= 60; lat += 10) {
      g += '<line x1="' + M + '" y1="' + py(lat) + '" x2="' + (W - M) + '" y2="' + py(lat) + '" stroke="#d4dde0" stroke-width="1"/>' +
        '<text x="' + (M - 6) + '" y="' + (py(lat) + 3) + '" font-size="10" fill="#7b8a90" text-anchor="end">' + lat + 'N</text>';
    }
    var regions = [['UNITED STATES', 55, -92], ['EUROPE', 54, 14], ['CHINA', 36, 100], ['MALAYSIA', -2.5, 112], ['ATLANTIC OCEAN', 40, -55]];
    regions.forEach(function (r) {
      g += '<text x="' + px(r[2]) + '" y="' + py(r[1]) + '" font-size="12" fill="#a9b6bb" letter-spacing="2" text-anchor="middle">' + r[0] + '</text>';
    });
    return g;
  }

  function build(D, risk) {
    var byId = {};
    (risk || []).forEach(function (r) { byId[r.supplier_id] = r; });
    var items = [];
    D.suppliers.forEach(function (s) {
      var p = PLACES[s.supplier_id]; if (!p) return;
      var r = byId[s.supplier_id], level = r ? r.level : 'Unknown';
      items.push({
        id: s.supplier_id, kind: 'supplier', level: level, lat: p[0], lon: p[1], city: p[2], name: s.supplier_name,
        short: s.supplier_name.split(' ')[0], tx: px(p[1]), ty: py(p[0]),
        why: r ? r.reasons.join(' ') : 'Risk table not available.'
      });
    });
    OTHER.forEach(function (o) { items.push({ id: o.id, kind: o.kind, name: o.name, short: o.short, lat: o.lat, lon: o.lon, tx: px(o.lon), ty: py(o.lat) }); });
    spread(items);

    var svg = '<svg class="map-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="World map of supplier factories coloured by risk level">' + graticule();
    // Leader lines first (so badges sit on top), then small true-location dots, then badges.
    items.forEach(function (m) {
      var moved = Math.abs(m.x - m.tx) + Math.abs(m.y - m.ty) > 3;
      svg += (moved ? '<line x1="' + m.tx + '" y1="' + m.ty + '" x2="' + m.x + '" y2="' + m.y + '" stroke="#4f6b7e" stroke-width="1"/>' : '') +
        '<circle cx="' + m.tx + '" cy="' + m.ty + '" r="2" fill="#17323f"/>';
    });
    items.forEach(function (m) {
      var x = m.x.toFixed(1), y = m.y.toFixed(1), tip, body, label;
      if (m.kind === 'supplier') {
        tip = m.name + ' (' + m.id + '), ' + m.city + ': ' + m.level + ' risk. ' + m.why;
        body = shape(m.level, +x, +y) + '<text x="' + x + '" y="' + (+y + 4) + '" font-size="12" font-weight="700" fill="#fff" text-anchor="middle" pointer-events="none">' + LETTER[m.level] + '</text>';
        label = m.short;
      } else if (m.kind === 'home') {
        tip = m.name + ': where every shipment ends up.';
        body = '<polygon class="map-shape" fill="#17323f" stroke="#fff" stroke-width="1.5" points="' + x + ',' + (+y - 13) + ' ' + (+x + 12) + ',' + (+y - 4) + ' ' + (+x + 8) + ',' + (+y + 11) + ' ' + (+x - 8) + ',' + (+y + 11) + ' ' + (+x - 12) + ',' + (+y - 4) + '"/>' +
          '<text x="' + x + '" y="' + (+y + 5) + '" font-size="9" font-weight="700" fill="#fff" text-anchor="middle" pointer-events="none">HQ</text>';
        label = m.short;
      } else {
        tip = m.name + ': overseas shipments arrive here, then go by truck to Hendersonville.';
        body = '<rect class="map-shape" x="' + (+x - 8) + '" y="' + (+y - 8) + '" width="16" height="16" fill="#fff" stroke="#17323f" stroke-width="2" transform="rotate(45 ' + x + ' ' + y + ')"/>' +
          '<text x="' + x + '" y="' + (+y + 4) + '" font-size="10" font-weight="700" fill="#17323f" text-anchor="middle" pointer-events="none">P</text>';
        label = m.short;
      }
      // The name goes under the badge, with a pale outline so it stays readable over lines.
      svg += '<g class="map-marker" tabindex="0" data-map-tip="' + esc(tip) + '" role="img" aria-label="' + esc(tip) + '"><title>' + esc(tip) + '</title>' + body +
        '<text x="' + x + '" y="' + (+y + 26) + '" font-size="11" fill="#17323f" text-anchor="middle" pointer-events="none" stroke="#f3f6f7" stroke-width="3" paint-order="stroke">' + esc(label) + '</text></g>';
    });
    svg += '</svg>';
    return svg;
  }

  function basket(D) {
    var total = 0, byCountry = {}, byPort = {};
    D.suppliers.forEach(function (s) {
      var spend = +s.annual_spend_usd || 0, c = s.factory_country, port = String(s.us_port_of_entry || '');
      total += spend;
      (byCountry[c] = byCountry[c] || { spend: 0, n: 0, names: [] }).spend += spend; byCountry[c].n++; byCountry[c].names.push(s.supplier_name.split(' ')[0]);
      var pk = /savannah/i.test(port) ? 'Savannah, GA' : /charleston/i.test(port) ? 'Charleston, SC' : 'No port (trucked in the US)';
      (byPort[pk] = byPort[pk] || { spend: 0, n: 0, names: [] }).spend += spend; byPort[pk].n++; byPort[pk].names.push(s.supplier_name.split(' ')[0]);
    });
    function tbl(title, obj) {
      var keys = Object.keys(obj).sort(function (a, b) { return obj[b].spend - obj[a].spend; });
      return '<div><table class="map-table"><thead><tr><th>' + title + '</th><th class="map-num">Suppliers</th><th class="map-num">Annual spend</th><th class="map-num">Share</th></tr></thead><tbody>' +
        keys.map(function (k) {
          return '<tr><td>' + esc(k) + '<div style="font-size:12px;color:#4f6b7e">' + esc(obj[k].names.join(', ')) + '</div></td><td class="map-num">' + obj[k].n + '</td><td class="map-num">' + money(obj[k].spend) + '</td><td class="map-num">' + pct(obj[k].spend / total * 100) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    var tw = byCountry.Taiwan || { spend: 0, n: 0, names: [] };
    var twParts = {}, twBikes = {};
    D.parts.forEach(function (p) { var s = D.suppliers.filter(function (x) { return x.supplier_id === p.supplier_id; })[0]; if (s && s.factory_country === 'Taiwan') twParts[p.part_number] = true; });
    D.bom.forEach(function (b) { if (twParts[b.part_number]) twBikes[b.product_id] = true; });
    var bikeCount = Object.keys(twBikes).length, allBikes = D.products.length;
    var sav = byPort['Savannah, GA'] || { spend: 0 };
    var sentence = pct(tw.spend / total * 100) + ' of our annual spend (' + money(tw.spend) + ' of ' + money(total) + ') sits in Taiwan, across ' + tw.n +
      ' suppliers, and ' + pct(sav.spend / total * 100) + ' arrives through one port, Savannah. ' +
      'A typhoon, an earthquake or a port problem in that one corner of the world would hit ' + bikeCount + ' of our ' + allBikes + ' bike models at once, so a single event could stop more than one supplier at the same time.';
    return '<h3>Eggs in one basket</h3><div class="map-basket"><strong>In plain English:</strong> ' + esc(sentence) + '</div>' +
      '<div class="map-tables">' + tbl('Country', byCountry) + tbl('US port of entry', byPort) + '</div>' +
      '<p class="map-note">Spend is the yearly amount in our purchasing data (data as of ' + esc(D.asOf) + '). Taiwan suppliers: ' + esc(tw.names.join(', ')) + '.</p>';
  }

  function render() {
    var box = document.getElementById('map');
    if (!box) return;
    var D = window.LAUREL_RIDGE;
    if (!D || !D.suppliers) { box.innerHTML = '<div class="map-card"><h2>Supplier map</h2><p class="map-note">Purchasing data did not load.</p></div>'; return; }
    var risk = window.GS_RISK || (typeof window.GS_RISK_ASSESS === 'function' ? window.GS_RISK_ASSESS() : []);
    box.innerHTML = '<style>' + css + '</style><div class="map-card"><h2>Where our suppliers are</h2>' +
      '<p class="map-note">Each badge is a supplier factory. The shape and letter show the risk level as well as the colour. Hover over a badge or tap it for the details. ' +
      'Suppliers in the same city are fanned out so you can see all of them; a thin line points back to the real location (the small black dot). This is a simple outline map, not to scale for small distances.</p>' +
      '<div class="map-legend"><span><svg width="22" height="22" viewBox="-13 -13 26 26" style="vertical-align:middle"><polygon fill="' + COLORS.High + '" points="0,-12 12,0 0,12 -12,0"/><text y="4" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">H</text></svg> High risk</span>' +
      '<span><svg width="22" height="22" viewBox="-13 -13 26 26" style="vertical-align:middle"><rect fill="' + COLORS.Medium + '" x="-10" y="-10" width="20" height="20" rx="2"/><text y="4" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">M</text></svg> Medium risk</span>' +
      '<span><svg width="22" height="22" viewBox="-13 -13 26 26" style="vertical-align:middle"><circle fill="' + COLORS.Low + '" r="11"/><text y="4" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">L</text></svg> Low risk</span>' +
      '<span><svg width="22" height="22" viewBox="-13 -13 26 26" style="vertical-align:middle"><rect x="-8" y="-8" width="16" height="16" fill="#fff" stroke="#17323f" stroke-width="2" transform="rotate(45)"/><text y="4" font-size="10" font-weight="700" text-anchor="middle">P</text></svg> US port</span>' +
      '<span><svg width="22" height="22" viewBox="-13 -13 26 26" style="vertical-align:middle"><polygon fill="#17323f" points="0,-13 12,-4 8,11 -8,11 -12,-4"/><text y="5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">HQ</text></svg> Our factory</span></div>' +
      build(D, risk) +
      '<div class="map-detail" id="map-detail" aria-live="polite">Tap or hover over a badge to see the supplier, its city, its risk level and why.</div>' +
      basket(D) + '</div>';
    box.addEventListener('click', function (ev) {
      var t = ev.target;
      while (t && t !== box && !(t.getAttribute && t.getAttribute('data-map-tip'))) t = t.parentNode;
      if (t && t !== box) document.getElementById('map-detail').textContent = t.getAttribute('data-map-tip');
    });
    box.addEventListener('keydown', function (ev) {
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target && ev.target.getAttribute && ev.target.getAttribute('data-map-tip')) {
        document.getElementById('map-detail').textContent = ev.target.getAttribute('data-map-tip'); ev.preventDefault();
      }
    });
  }

  function run() { try { render(); } catch (e) { if (window.console) console.error('map.js', e); } }
  if (typeof window.addEventListener === 'function') window.addEventListener('load', run);
})();
