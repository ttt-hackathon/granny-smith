# Workshop house rules

- We are business people, not programmers. Explain what you're doing in plain English.
- These are real companies. Never invent an event or show sample alerts about them.
  Every warning needs a real source link and date. For test data, use only
  Cataloochee Cell Works.
- Never write our API key into any file. This repository is public.
- Everything must work with a double-click on index.html and also at our live link.
- When we say "save to GitHub", commit and push with a short note.
  When we say "get the latest", pull first.

## How our dashboard fits together

Our team builds ONE dashboard together. Each person owns one section of it.

- index.html is the dashboard: the page frame, the layout and an empty box for each
  section. Only the dashboard owner edits it.
- Each section lives in its own file in the sections folder, such as
  sections/weather.js. Only that section's owner edits it.
- A section file draws its content into the box on index.html with the same name.
  For example, sections/weather.js fills <div id="weather">. index.html loads every
  section with a line like <script src="sections/weather.js"></script>.
- If a section's box isn't on index.html yet, the section should still load
  without errors; it simply shows up once the dashboard owner adds the box.
- Our purchasing data is in data/laurel-ridge-data.js, available as
  window.LAUREL_RIDGE. index.html loads it before any section. Use it instead of
  reading the CSV files, so everything works with a double-click.
- Keep each section's styles inside its own file, with names that start with the
  section's name, so sections don't change each other's look.

## Our team's plan

We are a team of TWO. Person A owns the frame, risk and alerts. Person B owns the
two kinds of real warning signs.

### What we watch
1. Severe weather and natural hazards (storms, typhoons, floods, earthquakes) near each
   supplier's factory city and its shipping port. (Person B, sections/weather.js)
2. Supplier and port news: strikes, fires, plant shutdowns, recalls, financial trouble,
   port delays. (Person B, sections/news.js)
3. Our own numbers: weeks of stock vs. the next delivery, sole-source parts, on-time
   record, lead time. (Person A, sections/risk.js)

Every real warning needs a source link and a date. If nothing current is found for a
supplier, show "No warnings found as of <date>". Never invent an event.

### What triggers an alert
An alert is raised when EITHER:
- a supplier's stock will run out before its next delivery arrives, OR
- a real warning (weather or news) counts as escalating for a supplier whose parts are
  sole-source or whose stock covers less than 5 weeks.
A warning is escalating only if ALL of these are true: its severity is "serious" or
"watch"; its confidence is "medium" or "high"; its date is within the 30 days before
"today" (today = 2026-11-03, so 2026-10-04 or later); and it has a source link and a date.
A warning without a source link or date is ignored. Every other real warning is still
shown and counted, labelled "shown, not escalating" with the reason (low confidence,
older than 30 days, or info only). In alerts and emails these appear under a separate
"Background notes (not disruptions)" heading, never as a disruption to our orders.
The alert section shows a ready-to-send email to purchasing: what happened, the source
link and date, which bikes are at risk, and what to do. Test alerts use only
Cataloochee Cell Works and are always labelled TEST.

### Risk levels (per supplier, with the reason shown)
- High: stock runs out before next delivery, or an escalating real warning (see above)
  on a sole-source supplier or one with under 5 weeks of cover.
- Medium: under 5 weeks of cover, or on-time record under 90%, or lead time over 90 days.
- Low: none of the above. Non-escalating warnings do not change the level.

### Dashboard sections and owners
| Box id (index.html) | File | Owner |
| --- | --- | --- |
| (page frame) | index.html | Person A |
| risk | sections/risk.js | Person A |
| alerts | sections/alerts.js | Person A |
| map | sections/map.js | Person A |
| stockup | sections/stockup.js | Person A |
| whatif | sections/whatif.js | Person A |
| alternatives | sections/alternatives.js | Person B |
| weather | sections/weather.js | Person B |
| news | sections/news.js | Person B |

### How the sections share warnings
weather.js and news.js each add their findings to a shared list,
window.GS_SIGNALS (create it with `window.GS_SIGNALS = window.GS_SIGNALS || []`).
Each finding has: supplier_id, kind ("weather" or "news"), headline, summary,
source_name, source_url, date (YYYY-MM-DD), confidence ("high", "medium" or "low"),
severity ("serious", "watch" or "info"). risk.js and alerts.js read that list after
the page has loaded.
