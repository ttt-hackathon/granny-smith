(function () {
  "use strict";
  var P = "alternatives-";
  var ACCESSED = "2026-11-03";

  // LEADS ONLY. Nobody has been contacted. Everything below comes from the
  // linked public pages (read 2026-11-03). Anything we could not confirm is
  // written in the "unverified" field.
  // same_city / same_country compare the alternative's factory with the CURRENT
  // supplier's factory city / country (the "same basket" check).
  var A = [
    {
      supplier_id: "S04", supplier_name: "Giant Manufacturing", part: "Aluminum frames (OEM)",
      current_city: "Taichung", current_country: "Taiwan",
      alternatives: [
        {
          name: "Merida", hq: "Yuanlin (Changhua), Taiwan",
          factory: "Taiwan (a Taichung factory is named), China and Germany",
          makes: "Complete bicycles and frames; started as a maker for other brands.",
          why: "Large Taiwan-based maker with a long history of building bikes for other brands, so it has the know-how for aluminum frames.",
          tradeoffs: "Our frames are built to our own designs, so a new maker needs new tooling and sample approval. Same country (and a Taichung factory) as Giant, so it shares Taiwan risk. The source says OEM work is mainly in the past today.",
          unverified: "Whether Merida takes outside OEM orders now, whether it builds e-bike or cargo frames for others, and any minimum order. Source does not say.",
          same_city: true, same_country: true,
          source_name: "Wikipedia: Merida Bikes", source_url: "https://en.wikipedia.org/wiki/Merida_Bikes"
        },
        {
          name: "Kinesis Industry", hq: "Taiwan (city not stated in source)",
          factory: "Guangzhou, China (per source)",
          makes: "Aluminum and carbon frames and forks; builds for brands such as Trek, GT, Felt and Santa Cruz.",
          why: "Makes aluminum frames for many outside brands, and has a plant outside Taiwan.",
          tradeoffs: "New tooling and qualification. A China plant means different tariff and customs exposure than Taiwan, which we have not researched. Head office is in Taiwan.",
          unverified: "Source does not mention e-bike or cargo frames, current capacity or minimum orders. The page may be dated.",
          same_city: false, same_country: false,
          source_name: "Wikipedia: Kinesis Industry", source_url: "https://en.wikipedia.org/wiki/Kinesis_Industry"
        },
        {
          name: "A&J Enterprise (A&J)", hq: "Taiwan",
          factory: "Taiwan, China, Vietnam and Cambodia (trade reports; some are years old)",
          makes: "Bicycle frames and complete bikes for other brands; trade reports say it has built aluminum-frame models for Trek and others.",
          why: "Factories in Vietnam and Cambodia would move frame supply away from Taiwan, which is the main location risk with Giant.",
          tradeoffs: "New tooling, sample approval and quality checks. Cambodia plant reportedly relied on tubes made in Vietnam. Longer supply chain to learn.",
          unverified: "Current 2025 to 2026 status of the Vietnam and Cambodia plants, e-bike frame programs, and minimum orders were not found.",
          same_city: false, same_country: false,
          source_name: "Bicycle Retailer (2020) via web search", source_url: "https://bicycleretailer.com/international/2020/02/06/major-supplier-warns-delays-due-coronavirus-vietnam-strikes"
        }
      ]
    },
    {
      supplier_id: "S08", supplier_name: "Tektro", part: "Hydraulic disc brake sets",
      current_city: "Taichung", current_country: "Taiwan",
      alternatives: [
        {
          name: "Magura (Gustav Magenwirth GmbH & Co. KG)", hq: "Bad Urach, Germany",
          factory: "Bad Urach, Germany; also production in Taichung, Taiwan",
          makes: "Hydraulic bicycle brakes, including the MT4 eSTOP and MT4e e-bike models.",
          why: "Family-owned German brake maker with e-bike specific hydraulic brakes and German production.",
          tradeoffs: "Likely different mounting, hose and lever design than our current brakes, so frame and fork fit must be checked. Part of its output is also made in Taichung, so only the German line moves us out of the Taiwan basket.",
          unverified: "Price, minimum orders, lead times and whether it supplies OEM volume of 6,000 sets.",
          same_city: true, same_country: false,
          source_name: "bike-test.com factory visit and shop listings (search results)", source_url: "https://bike-test.com/en/mtb-industry/mountainbike/magura-factory-report/"
        },
        {
          name: "Formula", hq: "Italy (sources disagree: Prato and Casalecchio di Reno are both shown)",
          factory: "Italy (exact site unverified)",
          makes: "Hydraulic disc brakes, including the Cura-E for e-MTB.",
          why: "Italian maker with an e-bike oriented brake that works with common e-bike brake sensors.",
          tradeoffs: "Qualification and compatibility testing, possible lever and sensor changes. Ships from Europe, which would use our Charleston route.",
          unverified: "Factory location, OEM capacity and minimum orders. Only retailer listings were found, not a company source.",
          same_city: false, same_country: false,
          source_name: "bike-components.de (retailer listing)", source_url: "https://www.bike-components.de/en/Formula/Cura-4-Scheibenbremse-p66957/"
        },
        {
          name: "Shimano", hq: "Sakai, Osaka, Japan",
          factory: "Main plants in Kunshan (China), Malaysia and Singapore",
          makes: "Hydraulic disc brakes and STEPS e-bike systems.",
          why: "The largest component maker; brakes are widely used on e-bikes.",
          tradeoffs: "We already buy drivetrains from Shimano (S06), so this adds to one supplier's weight rather than spreading risk. Large brand, so small buyers may get less attention.",
          unverified: "Whether a current e-bike rated brake line is available to us, price and minimum orders.",
          same_city: false, same_country: false,
          source_name: "Wikipedia: Shimano", source_url: "https://en.wikipedia.org/wiki/Shimano"
        }
      ]
    },
    {
      supplier_id: "S05", supplier_name: "Fox Factory", part: "Suspension forks, 140 mm",
      current_city: "Taichung", current_country: "Taiwan",
      alternatives: [
        {
          name: "RockShox (part of SRAM)", hq: "Colorado Springs, Colorado, USA",
          factory: "Taichung, Taiwan (production moved there in 2002); small test site in Colorado Springs",
          makes: "Suspension forks and rear shocks.",
          why: "Direct fork competitor with a long product history and a US base.",
          tradeoffs: "Production is in the same city as Fox, so it does NOT diversify location. Fork changes mean re-checking frame fit, axle and travel.",
          unverified: "Current factory arrangements (source describes 2002), 140 mm e-bike rated models, minimum orders.",
          same_city: true, same_country: true,
          source_name: "Wikipedia: RockShox", source_url: "https://en.wikipedia.org/wiki/RockShox"
        },
        {
          name: "SR Suntour", hq: "Changhua, Taiwan",
          factory: "Taiwan and mainland China",
          makes: "Suspension forks, plus e-bike components including motors and battery packs.",
          why: "Fork specialist that also supplies e-bike parts, so it understands e-bike requirements.",
          tradeoffs: "Same country as Fox, so Taiwan and Savannah-route risk stays. Fork fit and qualification needed.",
          unverified: "OEM capacity, 140 mm e-bike rated models, pricing and minimum orders.",
          same_city: false, same_country: true,
          source_name: "Wikipedia: SR Suntour", source_url: "https://en.wikipedia.org/wiki/SR_Suntour"
        }
      ]
    },
    {
      supplier_id: "S10", supplier_name: "DT Swiss", part: "Wheelsets",
      current_city: "Biel/Bienne", current_country: "Switzerland",
      alternatives: [
        {
          name: "Fulcrum (Campagnolo subsidiary)", hq: "Vicenza, Italy (Campagnolo)",
          factory: "Not stated in our source",
          makes: "Wheelsets; Campagnolo and Shimano cassette compatible.",
          why: "Established European wheelset brand, similar truck-to-port route from Europe.",
          tradeoffs: "Different spoke, hub and axle standards may need testing against our frames. Europe to Charleston, so it shares the Atlantic route with DT Swiss.",
          unverified: "Where Fulcrum wheels are built, e-bike rated models, minimum orders and pricing.",
          same_city: false, same_country: false,
          source_name: "Wikipedia: Campagnolo", source_url: "https://en.wikipedia.org/wiki/Campagnolo"
        },
        {
          name: "Mavic", hq: "Near Annecy, France",
          factory: "Saint-Trivier, France (top carbon wheels, per a 2022 article)",
          makes: "Wheelsets including e-bike rated lines (E-Deemax, E-Access, E-Crossride).",
          why: "French maker with e-bike rated wheelsets.",
          tradeoffs: "Hub standard and brake interface (center lock or 6-bolt) may differ from our design. Same European route to Charleston.",
          unverified: "Current ownership, OEM terms, minimum orders. Our source is a 2022 article and retail listings.",
          same_city: false, same_country: false,
          source_name: "Rouleur: Inside the 2022 Mavic range", source_url: "https://rouleur.cc/blogs/desire-journal/mavic-back-to-the-start"
        },
        {
          name: "Alex Rims", hq: "Tainan, Taiwan",
          factory: "Taiwan",
          makes: "Aluminum and carbon rims and wheelsets, mostly for other brands.",
          why: "One of the largest rim makers; it builds for outside brands.",
          tradeoffs: "Moves wheelsets onto the Taiwan to Savannah route used by our frame, fork and brake suppliers, which concentrates risk there.",
          unverified: "E-bike OEM customers are not named in any source we found. 2011 trade report is old.",
          same_city: false, same_country: false,
          source_name: "Search results (ctyeh.com Taiwan wheelset article, Bicycle Retailer)", source_url: "https://ctyeh.com/articles/569?lang=en"
        }
      ]
    },
    {
      supplier_id: "S02", supplier_name: "Bosch eBike Systems", part: "Mid-drive motors and displays",
      current_city: "Miskolc", current_country: "Hungary",
      alternatives: [
        {
          name: "Yamaha Motor eBike Systems (includes the former Brose e-bike drive business)", hq: "Berlin, Germany (new Yamaha company; parent Yamaha Motor is in Iwata, Japan)",
          factory: "Not stated in our sources",
          makes: "E-bike drive systems. Yamaha completed its purchase of Brose's e-bike drive business in 2025.",
          why: "Established drive maker with its own and Brose-built drive systems, giving an independent choice outside Bosch.",
          tradeoffs: "Bosch is a closed system: motor, display, battery and app are matched, so switching means a new battery, display and frame mounts, new software and certification. Not a quick swap.",
          unverified: "Which models fit our bikes, where units are built, capacity, pricing and minimum orders.",
          same_city: false, same_country: false,
          source_name: "electrive (Aug 2025)", source_url: "https://www.electrive.com/2025/08/04/yamaha-completes-acquisition-of-broses-e-bike-drive-business"
        },
        {
          name: "Shimano (STEPS)", hq: "Sakai, Osaka, Japan",
          factory: "Main plants in Kunshan (China), Malaysia and Singapore (drive unit site unverified)",
          makes: "STEPS e-bike drive systems (also brakes and drivetrains).",
          why: "Large, established drive-system maker; widely used on e-bikes.",
          tradeoffs: "Same closed-system issue as Bosch: new motor, battery, display and frame interface. Adds to our Shimano dependence (S06). Likely ships via the Pacific route.",
          unverified: "Where STEPS units are built, allocation, pricing and minimum orders.",
          same_city: false, same_country: false,
          source_name: "Wikipedia: Shimano", source_url: "https://en.wikipedia.org/wiki/Shimano"
        }
      ]
    },
    {
      supplier_id: "S03", supplier_name: "Bafang", part: "Rear hub motor kits and displays",
      current_city: "Suzhou", current_country: "China",
      alternatives: [
        {
          name: "Ananda Drive Techniques", hq: "Shanghai, China",
          factory: "Jiangsu entity listed (city unverified)",
          makes: "Direct-drive and geared hub motors, mid-drives, and the R900 3-speed hub motor system. Reported to make millions of systems a year.",
          why: "Large hub motor maker, close match to the Bafang product.",
          tradeoffs: "Same country, probably the same Jiangsu region as Bafang, so little location diversity, and it faces the same China tariffs and Shanghai port.",
          unverified: "Whether its Jiangsu plant is in Suzhou, controller and display compatibility, pricing and minimum orders.",
          same_city: false, same_country: true,
          source_name: "Electric Bike Review: Ananda e-bike motors (via search)", source_url: "https://electricbikereview.com/ananda-e-bike-motors/"
        },
        {
          name: "MAHLE SmartBike Systems (formerly ebikemotion)", hq: "Spain (a retailer lists Palencia; not confirmed by company)",
          factory: "Not stated",
          makes: "X35 and X35+ hub motor systems for light e-bikes, 250 W class.",
          why: "Moves motor supply to Europe and out of China.",
          tradeoffs: "Aimed at light, sporty e-bikes with an integrated battery, so likely not a match for heavier cargo or trail models. A new system means a new battery and display.",
          unverified: "Our fetched source calls X35 a hub motor but does not say rear or front. Torque and power for our weights, location, pricing and minimum orders are not confirmed.",
          same_city: false, same_country: false,
          source_name: "Merida: MAHLE X35 explained (2021)", source_url: "https://www.merida-bikes.com/en/news/detail/899/MAHLE%E2%80%99s+Smart+Bike+Systems+lightweight+X35+ebike+drive+unit+explained"
        }
      ]
    },
    {
      supplier_id: "S01", supplier_name: "Cataloochee Cell Works", part: "Battery packs (general market options only)",
      current_city: "Waynesville, NC", current_country: "United States",
      alternatives: [
        {
          name: "American Electric", hq: "Hallandale Beach, Florida, USA",
          factory: "Hallandale Beach, FL (factory)",
          makes: "Built-to-order lithium-ion packs, including packs for e-bike OEM integration; names Samsung, LG, Panasonic, Molicel cells.",
          why: "US-made, keeps battery supply domestic with no ocean freight.",
          tradeoffs: "Same country as Cataloochee, so no country diversity. Different pack size, BMS and frame fit would need design work and testing.",
          unverified: "Capacity for 6,000 packs a year, minimum orders, lead time, UL certification and whether it does 625 Wh OEM packs.",
          same_city: false, same_country: true,
          source_name: "American Electric website", source_url: "https://www.american-electric.co/pages/naked-battery-pack"
        },
        {
          name: "Tritek Battery", hq: "Shenzhen, China",
          factory: "Shenzhen, China (per its address)",
          makes: "Custom e-bike packs (down tube, integrated, range extender); states a 200-piece minimum order and lists UL 2271 among its certifications (claims on its own site, not independently checked).",
          why: "E-bike specialist with ODM/OEM service and a low stated minimum order.",
          tradeoffs: "Adds ocean freight, China tariffs and a longer pipeline; certificates must be checked first. Lithium battery shipping rules apply.",
          unverified: "All certifications and capacity are the company's own claims. Lead time and pricing not found.",
          same_city: false, same_country: false,
          source_name: "Tritek Battery website", source_url: "https://tritekbattery.com/custom-e-bike-battery-manufacturer/"
        }
      ]
    }
  ];
  window.GS_ALTERNATIVES = A;

  var CSS =
    "." + P + "wrap{font-family:inherit;color:#17323f;}" +
    "." + P + "title{margin:0 0 4px;font-size:1.25rem;color:#255572;}" +
    "." + P + "caveat{margin:0 0 12px;padding:8px 12px;font-size:.88rem;line-height:1.4;background:#fff3d6;border:1px solid #e8d08f;border-radius:8px;color:#5a3d00;}" +
    "." + P + "group{margin:0 0 16px;}" +
    "." + P + "grouphead{margin:0 0 6px;font-size:1.02rem;font-weight:700;}" +
    "." + P + "groupsub{font-weight:400;font-size:.82rem;color:#5b655f;margin-left:6px;}" +
    "." + P + "cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;}" +
    "." + P + "card{background:#fff;border:1px solid #d3dfe8;border-radius:8px;padding:10px 14px;font-size:.88rem;line-height:1.4;}" +
    "." + P + "name{font-weight:700;font-size:.98rem;margin:0 0 2px;}" +
    "." + P + "loc{color:#5b655f;font-size:.82rem;margin:0 0 6px;}" +
    "." + P + "field{margin:4px 0;}" +
    "." + P + "label{font-weight:600;}" +
    "." + P + "unv{color:#7a5200;}" +
    "." + P + "flag{display:inline-block;font-size:.72rem;font-weight:700;padding:1px 7px;border-radius:10px;margin:0 4px 6px 0;border:1px solid #d3dfe8;}" +
    "." + P + "flag-same{background:#fbe4e1;color:#8a1f11;border-color:#e6b3ab;}" +
    "." + P + "flag-country{background:#fff3d6;color:#7a5200;border-color:#e8d08f;}" +
    "." + P + "flag-diff{background:#e3ecf3;color:#255572;border-color:#b7cbdb;}" +
    "." + P + "meta{font-size:.78rem;color:#5b655f;margin-top:6px;}" +
    "." + P + "meta a{color:#255572;}";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = P + cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function field(label, text, cls) {
    var d = el("p", "field" + (cls ? " " + P + cls : ""));
    d.appendChild(el("span", "label", label + " "));
    d.appendChild(document.createTextNode(text));
    return d;
  }

  function render() {
    var box = document.getElementById("alternatives");
    if (!box) return;
    if (!document.getElementById(P + "style")) {
      var st = document.createElement("style");
      st.id = P + "style";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    box.textContent = "";
    var wrap = el("div", "wrap");
    wrap.appendChild(el("h2", "title", "Find alternatives"));
    wrap.appendChild(el("p", "caveat",
      "Nobody has been contacted. These are leads for purchasing to qualify, not offers, and no company has agreed to supply us. " +
      "Facts come from the linked public pages, read " + ACCESSED + ". Anything we could not confirm is marked unverified. " +
      "Red or amber tags warn that an option sits in the same city or country as the current supplier."));

    A.forEach(function (g) {
      var grp = el("div", "group");
      var h = el("h3", "grouphead", g.supplier_name + " (" + g.supplier_id + ")");
      h.appendChild(el("span", "groupsub", g.part + " | now made in " + g.current_city + ", " + g.current_country));
      grp.appendChild(h);
      var cards = el("div", "cards");
      g.alternatives.forEach(function (a) {
        var c = el("div", "card");
        c.appendChild(el("p", "name", a.name));
        c.appendChild(el("p", "loc", "HQ: " + a.hq + " | Made in: " + a.factory));
        if (a.same_city) c.appendChild(el("span", "flag " + P + "flag-same", "Same city as current supplier"));
        else if (a.same_country) c.appendChild(el("span", "flag " + P + "flag-country", "Same country as current supplier"));
        else c.appendChild(el("span", "flag " + P + "flag-diff", "Different location"));
        c.appendChild(field("Makes:", a.makes));
        c.appendChild(field("Why it could fit:", a.why));
        c.appendChild(field("Trade-offs of switching:", a.tradeoffs));
        c.appendChild(field("Unverified:", a.unverified, "unv"));
        var meta = el("div", "meta");
        meta.appendChild(document.createTextNode("Source: "));
        var link = document.createElement("a");
        link.href = a.source_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = a.source_name;
        meta.appendChild(link);
        meta.appendChild(document.createTextNode(" | accessed " + ACCESSED));
        c.appendChild(meta);
        cards.appendChild(c);
      });
      grp.appendChild(cards);
      wrap.appendChild(grp);
    });
    box.appendChild(wrap);
  }

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
