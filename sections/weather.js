(function () {
  "use strict";
  var KIND = "weather";
  var P = "weather-";
  var TODAY = "2026-11-03";

  var findings = [
    {"supplier_id": "S10", "headline": "Rhine river gauge at Kaub is very low (18 cm on 3 Nov)", "summary": "Germany's official river gauge at Kaub read about 18 cm on 3 Nov, down from about 45 cm five days earlier. Very low Rhine water cuts barge capacity and can add surcharges and crowding at Rotterdam, which is on DT Swiss's route. Wheelsets travel by truck to Rotterdam, so the direct impact on us is uncertain.", "source_name": "German Federal Waterways (PEGELONLINE), Kaub gauge", "source_url": "https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/KAUB/W/measurements.json?start=P5D", "date": "2026-11-03", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S06", "headline": "Malaysia northeast monsoon began 27 Oct: flash-flood risk in Johor", "summary": "Malaysian forecasters expect three to five spells of heavy rain between November and January, with low-lying areas including Johor at risk of flash floods and road congestion. This is a seasonal outlook, not a flood warning for the Pekan Nanas factory, but trucking to Tanjung Pelepas could be slowed.", "source_name": "SAYS (reporting MetMalaysia outlook)", "source_url": "https://says.com/my/news/northeast-monsoon-malaysia-flood-warning-el-nino-heatwave", "date": "2026-10-29", "confidence": "medium", "severity": "info"}
  ];

  // Suppliers actually checked for this kind of signal.
  var CHECKED = ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10", "S11", "S12", "S13"];
  // City / port that was checked, for display.
  var WHERE = {
    "S01": "Waynesville, NC",
    "S02": "Miskolc; Hamburg; Charleston",
    "S03": "Suzhou; Shanghai; Savannah",
    "S04": "Taichung; Savannah",
    "S05": "Taichung; Savannah",
    "S06": "Pekan Nanas, Johor; Tanjung Pelepas; Savannah",
    "S07": "Tainan; Kaohsiung; Savannah",
    "S08": "Taichung; Savannah",
    "S09": "Korbach; Bremerhaven; Charleston",
    "S10": "Biel/Bienne; Rotterdam; Charleston",
    "S11": "Meinerzhagen; Hamburg; Charleston",
    "S12": "Pozzoleone; Genoa; Charleston",
    "S13": "Pleasant Prairie, WI"
};

  window.GS_SIGNALS = window.GS_SIGNALS || [];
  findings.forEach(function (f) {
    f.kind = KIND;
    window.GS_SIGNALS.push(f);
  });
  window.GS_CHECKED = window.GS_CHECKED || {};
  window.GS_CHECKED[KIND] = { date: TODAY, suppliers: CHECKED.slice() };

  var CSS =
    "." + P + "wrap{font-family:inherit;color:#1f2a24;}" +
    "." + P + "title{margin:0 0 4px;font-size:1.25rem;color:#2f6b4f;}" +
    "." + P + "sub{margin:0 0 12px;font-size:.85rem;color:#5b655f;}" +
    "." + P + "row{background:#fff;border:1px solid #ddd8cc;border-radius:8px;padding:10px 14px;margin:0 0 8px;}" +
    "." + P + "name{font-weight:600;}" +
    "." + P + "where{font-size:.8rem;color:#5b655f;margin-left:6px;}" +
    "." + P + "none{margin:6px 0 0;font-size:.9rem;color:#5b655f;}" +
    "." + P + "item{margin:8px 0 0;padding-top:8px;border-top:1px solid #ddd8cc;}" +
    "." + P + "head{font-weight:600;}" +
    "." + P + "text{margin:4px 0;font-size:.92rem;line-height:1.4;}" +
    "." + P + "meta{font-size:.8rem;color:#5b655f;}" +
    "." + P + "meta a{color:#2f6b4f;}" +
    "." + P + "badge{display:inline-block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:1px 7px;border-radius:10px;margin-right:6px;border:1px solid #ddd8cc;}" +
    "." + P + "badge-serious{background:#fbe4e1;color:#8a1f11;border-color:#e6b3ab;}" +
    "." + P + "badge-watch{background:#fff3d6;color:#7a5200;border-color:#e8d08f;}" +
    "." + P + "badge-info{background:#e6f0ea;color:#2f6b4f;border-color:#bcd5c6;}";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = P + cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function render() {
    var box = document.getElementById(KIND);
    if (!box) return;
    if (!document.getElementById(P + "style")) {
      var st = document.createElement("style");
      st.id = P + "style";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    box.textContent = "";
    var wrap = el("div", "wrap");
    wrap.appendChild(el("h2", "title", "Weather and natural hazards"));
    wrap.appendChild(el("p", "sub", "Severe weather near each factory city and shipping port. Checked " + TODAY + "."));

    var data = window.LAUREL_RIDGE && window.LAUREL_RIDGE.suppliers || [];
    var names = {};
    data.forEach(function (s) { names[s.supplier_id] = s.supplier_name; });
    var ids = data.length ? data.map(function (s) { return s.supplier_id; }) : Object.keys(WHERE);

    ids.forEach(function (id) {
      var row = el("div", "row");
      var top = el("div", "top");
      top.appendChild(el("span", "name", names[id] || id));
      top.appendChild(el("span", "where", WHERE[id] ? "(" + WHERE[id] + ")" : ""));
      row.appendChild(top);
      var mine = findings.filter(function (f) { return f.supplier_id === id; });
      if (!mine.length) {
        row.appendChild(el("p", "none", CHECKED.indexOf(id) >= 0 ? "No warnings found as of " + TODAY : "Not checked as of " + TODAY));
      }
      mine.forEach(function (f) {
        var item = el("div", "item");
        var h = el("div", "head");
        h.appendChild(el("span", "badge " + P + "badge-" + f.severity, f.severity));
        h.appendChild(document.createTextNode(f.headline));
        item.appendChild(h);
        item.appendChild(el("p", "text", f.summary));
        var meta = el("div", "meta");
        var a = document.createElement("a");
        a.href = f.source_url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = f.source_name;
        meta.appendChild(document.createTextNode("Source: "));
        meta.appendChild(a);
        meta.appendChild(document.createTextNode(" | " + f.date + " | confidence: " + f.confidence));
        item.appendChild(meta);
        row.appendChild(item);
      });
      wrap.appendChild(row);
    });
    box.appendChild(wrap);
  }

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
