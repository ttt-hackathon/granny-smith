/**
 * EMAIL ALERT FOR HIGH-RISK SUPPLIERS (optional extra)
 * ----------------------------------------------------
 * What it does, in plain English: every 15 minutes this little program looks at a
 * "feed" file published by our dashboard. If a supplier shows up as HIGH risk and we
 * have not already emailed about it, it emails the purchasing team. It never sends
 * the same alert twice.
 *
 * SETUP (about 5 minutes)
 *  1. Go to https://script.google.com and click "New project".
 *  2. Delete whatever is in the editor and paste in this whole file.
 *  3. At the top, replace FEED_URL with our live link to the feed (the address of the
 *     published JSON or JS file, for example the live dashboard address followed by the
 *     feed file name). Replace ALERT_EMAIL with the purchasing team's address.
 *  4. Click the disk icon to save. In the drop-down at the top choose "checkForHighRisk"
 *     and click "Run". Google will ask you to allow it to send email: approve it.
 *  5. To make it run by itself, click the clock icon ("Triggers") on the left, then
 *     "Add Trigger": function = checkForHighRisk, event source = "Time-driven",
 *     type = "Minutes timer", every 15 minutes. Save.
 *  6. To start over (so past alerts can be emailed again), run "forgetSentAlerts".
 *
 * THE FEED: a file containing a list of suppliers, each with at least
 *   supplier_name, level ("High", "Medium" or "Low") and reasons (a list of sentences).
 *   Plain JSON works, and so does a .js file that starts with "window.SOMETHING = ".
 *
 * NOTES: no passwords or keys are needed or stored here. Keep it that way, because
 * our repository is public. Real alerts only: do not point this at made-up data.
 */

// ---- SETTINGS (change these two lines) ----
var FEED_URL = 'PASTE-YOUR-LIVE-LINK-HERE';          // where the published feed lives
var ALERT_EMAIL = 'purchasing@laurelridge.example';  // who gets the email (placeholder)

/** Main function: the timer runs this every 15 minutes. */
function checkForHighRisk() {
  if (FEED_URL.indexOf('PASTE-YOUR') === 0) {
    throw new Error('Please set FEED_URL at the top of the script first.');
  }
  var suppliers = readFeed_();
  var memory = PropertiesService.getScriptProperties();   // Google's built-in notepad for this script
  var sent = JSON.parse(memory.getProperty('sentAlerts') || '{}');
  var newOnes = [];

  suppliers.forEach(function (s) {
    if (s.level !== 'High') return;
    // A "fingerprint" of the alert: same supplier + same reasons = same alert.
    var fingerprint = s.supplier_name + '|' + (s.reasons || []).join(' ');
    if (!sent[fingerprint]) {
      newOnes.push(s);
      sent[fingerprint] = new Date().toISOString();
    }
  });

  if (newOnes.length === 0) return;   // nothing new, so no email

  var lines = ['Hello purchasing team,', '',
    'Our early-warning dashboard shows ' + newOnes.length + ' new High-risk supplier alert(s):', ''];
  newOnes.forEach(function (s) {
    lines.push(s.supplier_name + ' (High risk)');
    (s.reasons || []).forEach(function (r) { lines.push('  - ' + r); });
    lines.push('');
  });
  lines.push('Please check the dashboard for the sources, dates and recommended actions.', '',
    'Supplier Early Warning Dashboard (Team Granny Smith)');

  MailApp.sendEmail(ALERT_EMAIL, 'Supply alert: ' + newOnes.length + ' High-risk supplier(s)', lines.join('\n'));
  memory.setProperty('sentAlerts', JSON.stringify(sent));  // remember, so we do not email again
}

/** Downloads the feed and turns it into a list of suppliers. */
function readFeed_() {
  var text = UrlFetchApp.fetch(FEED_URL, { muteHttpExceptions: true }).getContentText();
  // If it is a .js file ("window.X = [...];"), keep only the part from the first [ or { onwards.
  var start = text.search(/[\[{]/);
  var json = text.substring(start).replace(/;\s*$/, '');
  var data = JSON.parse(json);
  return Array.isArray(data) ? data : (data.suppliers || data.risk || []);
}

/** Run this by hand to clear the "already emailed" memory. */
function forgetSentAlerts() {
  PropertiesService.getScriptProperties().deleteProperty('sentAlerts');
}
