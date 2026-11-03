(function () {
  "use strict";
  var KIND = "news";
  var P = "news-";
  var TODAY = "2026-11-03";

  var findings = [
    {"supplier_id": "S05", "headline": "Fox Factory: CEO steps down, 2026 outlook cut, weaker bike sales", "summary": "Fox named an interim CEO on 16 Oct, cut its full-year 2026 sales forecast and said Q3 sales missed guidance; softer bike demand was one cited factor. The cited supply disruption was in its Powered Vehicles unit, not forks. Full Q3 results will appear in its quarterly filing (date not given in the article). Worth watching for supplier stability, but no fork shipment problem is reported.", "source_name": "THE SHOP", "source_url": "https://theshopmag.com/?p=203603", "date": "2026-10-19", "confidence": "high", "severity": "watch"},
    {"supplier_id": "S04", "headline": "Giant: US customs forced-labor order on Taiwan-made bikes and parts is still in force (as of 4 Aug 2026)", "summary": "US Customs' Withhold Release Order (Sept 2025) blocks Giant's Taiwan-made products from entering the US. An Aug 2026 trade report says it is still in place, Giant has filed its appeal and remediation evidence, and legal experts say resolution could take months or years. Giant US is importing from its plants in Vietnam, China, the Netherlands and Hungary instead, and dealers report shortages of some aluminum models. Our frames are made in Taichung, so ask Giant today which plant our frames now ship from and whether any are held at the border. We found nothing newer than 4 Aug.", "source_name": "Bicycle Retailer & Industry News", "source_url": "https://bicycleretailer.com/international/2026/08/03/experts-wro", "date": "2026-08-04", "confidence": "medium", "severity": "serious"},
    {"supplier_id": "S03", "headline": "Shanghai port congestion easing but not gone (mid-October)", "summary": "Kuehne+Nagel's port update for 14 to 20 Oct puts the average vessel wait at Shanghai at about 2.1 days, improved but with some terminals still seeing longer delays. Bafang ships from Shanghai, so ocean transit may still run a bit late. An earlier trade report (Seatrade, 1 Oct) of only 12% on-time berthing could not be opened and is not relied on. We found no update after about 24 Oct, including on the effect of Typhoon Champi.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S02", "headline": "New US Section 301 tariffs apply to EU goods (Hungary is in the EU)", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from the EU. The article says the combined rate for Taiwan and the EU is capped at 10%. The article does not name Hungary and does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S03", "headline": "New US Section 301 tariffs apply to goods from China", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from China. The article says this is added on top of existing duties. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S04", "headline": "New US Section 301 tariffs apply to goods from Taiwan", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Taiwan. The article says the combined rate for Taiwan and the EU is capped at 10%. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S05", "headline": "New US Section 301 tariffs apply to goods from Taiwan", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Taiwan. The article says the combined rate for Taiwan and the EU is capped at 10%. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S06", "headline": "New US Section 301 tariffs apply to goods from Malaysia", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Malaysia. The article says this is added on top of existing duties. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S07", "headline": "New US Section 301 tariffs apply to goods from Taiwan", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Taiwan. The article says the combined rate for Taiwan and the EU is capped at 10%. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S08", "headline": "New US Section 301 tariffs apply to goods from Taiwan", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Taiwan. The article says the combined rate for Taiwan and the EU is capped at 10%. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S09", "headline": "New US Section 301 tariffs apply to goods from Germany (EU)", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Germany (EU). The article says the combined rate for Taiwan and the EU is capped at 10%. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S11", "headline": "New US Section 301 tariffs apply to goods from Germany (EU)", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Germany (EU). The article says the combined rate for Taiwan and the EU is capped at 10%. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S12", "headline": "New US Section 301 tariffs apply to goods from Italy (EU)", "summary": "Since 24 Jul 2026 a new 10% / 12.5% US tariff covers imports from Italy (EU). The article says the combined rate for Taiwan and the EU is capped at 10%. The source does not say exactly which rate applies to which country, so check the landed-cost impact with our broker.", "source_name": "Escape Collective", "source_url": "https://escapecollective.com/new-us-tariffs-on-bikes-take-effect-today/", "date": "2026-07-24", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S10", "headline": "Rotterdam: barge and feeder delays of 12 to 72 hours, maintenance outage planned", "summary": "Kuehne+Nagel's 14 to 20 Oct update says Rotterdam yards are 86-90% full, with barge and feeder delays of 12 to 72 hours and a scheduled outage at the MVII terminal that may add disruption. Vessel waits are about 1.2 days. DT Swiss wheelsets truck to Rotterdam, so a few days of slack is advisable. No strikes were listed.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S03", "headline": "Savannah port: delays continue (high volumes, chassis shortages)", "summary": "Kuehne+Nagel's 14 to 20 Oct update says delays continue at Savannah because of high container volumes, chassis shortages and trucking delays. Average vessel wait is about 1.35 days and rail dwell about 2 days. Our Savannah shipments could arrive a little late. No strikes or weather problems were listed. No later update found.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S04", "headline": "Savannah port: delays continue (high volumes, chassis shortages)", "summary": "Kuehne+Nagel's 14 to 20 Oct update says delays continue at Savannah because of high container volumes, chassis shortages and trucking delays. Average vessel wait is about 1.35 days and rail dwell about 2 days. Our Savannah shipments could arrive a little late. No strikes or weather problems were listed. No later update found.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S05", "headline": "Savannah port: delays continue (high volumes, chassis shortages)", "summary": "Kuehne+Nagel's 14 to 20 Oct update says delays continue at Savannah because of high container volumes, chassis shortages and trucking delays. Average vessel wait is about 1.35 days and rail dwell about 2 days. Our Savannah shipments could arrive a little late. No strikes or weather problems were listed. No later update found.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S06", "headline": "Savannah port: delays continue (high volumes, chassis shortages)", "summary": "Kuehne+Nagel's 14 to 20 Oct update says delays continue at Savannah because of high container volumes, chassis shortages and trucking delays. Average vessel wait is about 1.35 days and rail dwell about 2 days. Our Savannah shipments could arrive a little late. No strikes or weather problems were listed. No later update found.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S07", "headline": "Savannah port: delays continue (high volumes, chassis shortages)", "summary": "Kuehne+Nagel's 14 to 20 Oct update says delays continue at Savannah because of high container volumes, chassis shortages and trucking delays. Average vessel wait is about 1.35 days and rail dwell about 2 days. Our Savannah shipments could arrive a little late. No strikes or weather problems were listed. No later update found.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"},
    {"supplier_id": "S08", "headline": "Savannah port: delays continue (high volumes, chassis shortages)", "summary": "Kuehne+Nagel's 14 to 20 Oct update says delays continue at Savannah because of high container volumes, chassis shortages and trucking delays. Average vessel wait is about 1.35 days and rail dwell about 2 days. Our Savannah shipments could arrive a little late. No strikes or weather problems were listed. No later update found.", "source_name": "Kuehne+Nagel port operational updates, 14-20 Oct 2026", "source_url": "https://mykn.kuehne-nagel.com/news/article/port-operational-updates-from-20-10-2026", "date": "2026-10-20", "confidence": "medium", "severity": "info"}
  ];

  // Suppliers actually checked for this kind of signal.
  var CHECKED = ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10", "S11", "S12", "S13"];
  // City / port that was checked, for display.
  var WHERE = {
    "S01": "Samsung SDI cell supply (Korea)",
    "S02": "Miskolc; Hamburg; Charleston",
    "S03": "Suzhou; Shanghai; Savannah",
    "S04": "Taichung; Savannah",
    "S05": "Taichung; Savannah",
    "S06": "Johor; Tanjung Pelepas; Savannah",
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
    "." + P + "wrap{font-family:inherit;color:#17323f;}" +
    "." + P + "title{margin:0 0 4px;font-size:1.25rem;color:#255572;}" +
    "." + P + "sub{margin:0 0 12px;font-size:.85rem;color:#5b655f;}" +
    "." + P + "row{background:#fff;border:1px solid #d3dfe8;border-radius:8px;padding:10px 14px;margin:0 0 8px;}" +
    "." + P + "name{font-weight:600;}" +
    "." + P + "where{font-size:.8rem;color:#5b655f;margin-left:6px;}" +
    "." + P + "none{margin:6px 0 0;font-size:.9rem;color:#5b655f;}" +
    "." + P + "item{margin:8px 0 0;padding-top:8px;border-top:1px solid #d3dfe8;}" +
    "." + P + "head{font-weight:600;}" +
    "." + P + "text{margin:4px 0;font-size:.92rem;line-height:1.4;}" +
    "." + P + "meta{font-size:.8rem;color:#5b655f;}" +
    "." + P + "meta a{color:#255572;}" +
    "." + P + "badge{display:inline-block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:1px 7px;border-radius:10px;margin-right:6px;border:1px solid #d3dfe8;}" +
    "." + P + "badge-serious{background:#fbe4e1;color:#8a1f11;border-color:#e6b3ab;}" +
    "." + P + "badge-watch{background:#fff3d6;color:#7a5200;border-color:#e8d08f;}" +
    "." + P + "badge-info{background:#e3ecf3;color:#255572;border-color:#b7cbdb;}";

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
    wrap.appendChild(el("h2", "title", "Supplier and port news"));
    wrap.appendChild(el("p", "sub", "Strikes, plant problems, financial trouble, port delays, tariffs. Checked " + TODAY + "."));

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
