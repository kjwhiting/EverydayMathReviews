/* EverydayMathReviews — reviews.js
   Fetches /data/reviews.json and renders the reviews page.
   - 2-space indent (Google style)
   - IIFE to avoid globals
*/
(function () {
  "use strict";

  var DATA_URL = "data/reviews.json";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var listEl = document.getElementById("review-list");
  if (!listEl) return;

  setStatus("Loading reviews…");

  fetch(DATA_URL, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("Network error: " + res.status);
      return res.json();
    })
    .then(function (json) {
      var items = json && Array.isArray(json.reviews) ? json.reviews : [];
      if (!items.length) {
        setStatus("No reviews available yet.");
        return;
      }
      renderList(items);
    })
    .catch(function (err) {
      setStatus("Sorry, something went wrong loading reviews.");
      console.error(err);
    });

  // -----------------------
  // Helpers
  // -----------------------
  function setStatus(msg) {
    listEl.innerHTML =
      '<p class="notes" role="status">' + escapeHtml(msg) + "</p>";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function clampNotes270(s) {
    if (!s) return "";
    return s.length > 270 ? s.slice(0, 267) + "…" : s;
  }

  // .5 should round up
  function roundHalfUp(n, digits) {
    var m = Math.pow(10, digits || 0);
    return Math.round((n + Number.EPSILON) * m) / m;
  }

  function band(n) {
    return n < 2.5 ? "Low" : n < 4 ? "Medium" : "High";
  }

  function avgOf(nums) {
    var acc = 0,
      count = 0;
    for (var i = 0; i < nums.length; i++) {
      var v = Number(nums[i]);
      if (!isNaN(v)) {
        acc += v;
        count++;
      }
    }
    return count ? acc / count : 0;
  }

  // If part.overall exists, use it; otherwise average its numeric subfields
  function partOverall(part) {
    if (!part || typeof part !== "object") return 0;
    if (isFinite(part.overall)) return Number(part.overall);
    var vals = [];
    for (var k in part) {
      if (!Object.prototype.hasOwnProperty.call(part, k)) continue;
      if (k === "overall") continue;
      var v = Number(part[k]);
      if (isFinite(v)) vals.push(v);
    }
    return avgOf(vals);
  }

  function computeOverall(item, p1o, p2o, p3o) {
    if (isFinite(item.overall_rating)) return Number(item.overall_rating);
    return avgOf([p1o, p2o, p3o]);
  }

  // Label maps for details
  var LABELS = {
    part_one_informal: {
      expressive_mathematics_rating: "Expressive Mathematics",
      mathematical_intuition_development: "Mathematical Intuition",
      noticeable_math: "Noticeable Math",
      accessibility: "Accessibility",
    },
    part_two_formal: {
      formal_mathematics_exposure: "Formal Math Exposure",
      rigor_rating: "Rigor",
      mathematical_systems: "Mathematical Systems",
    },
    part_three_transferability: {
      breadth_of_application: "Breadth of Application",
      ease_of_transfer: "Ease of Transfer",
      math_depth: "Math Depth",
    },
  };

  function starSvg(fill) {
    return (
      '<svg aria-hidden="true" class="star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.33 6.98 1.02-5.03 4.9 1.19 6.92L12 18.9 5.77 21.17l1.19-6.92L1.93 9.35l6.98-1.02L12 2z" fill="' +
      fill +
      '"/></svg>'
    );
  }

  function renderStars(scoreOutOf5) {
    var full = Math.min(5, Math.max(0, Math.floor(scoreOutOf5 + 0.5))); // .5 rounds up visually
    var html = "";
    for (var i = 0; i < 5; i++) {
      html += starSvg(i < full ? "currentColor" : "rgba(255,255,255,0.25)");
    }
    return html;
  }

  // Build labeled list of subscores for a part
  function formatSubscores(partKey, partObj) {
    if (!partObj) return "";
    var labels = LABELS[partKey] || {};
    var html = '<ul class="details-list">';
    for (var k in partObj) {
      if (!Object.prototype.hasOwnProperty.call(partObj, k)) continue;
      if (k === "overall") continue;
      var v = partObj[k];
      if (!isFinite(v)) continue;
      var label = labels[k] || k.replace(/_/g, " ");
      html +=
        "<li><strong>" +
        escapeHtml(label) +
        ":</strong> " +
        Number(v).toFixed(1) +
        "</li>";
    }
    html += "</ul>";
    return html;
  }

  // -----------------------
  // Render
  // -----------------------
  function renderList(items) {
    var frag = document.createDocumentFragment();

    items.forEach(function (r, idx) {
      var title = r.title || "Untitled";
      var domain = r.domain || "misc";
      var link = r.link || "#";
      var notesRaw = r.notes || "";

      var p1 = r.part_one_informal || {};
      var p2 = r.part_two_formal || {};
      var p3 = r.part_three_transferability || {};

      var p1o = partOverall(p1);
      var p2o = partOverall(p2);
      var p3o = partOverall(p3);

      var overall = computeOverall(r, p1o, p2o, p3o);
      var overallRounded1 = roundHalfUp(overall, 1);
      var overallBand = band(overall);
      var overallStars = renderStars(overall);

      var detailsId = "details-" + idx;

      var card = document.createElement("article");
      card.className = "review-card";
      card.innerHTML =
        '<header class="review-card-head">' +
        '<h3 class="review-title">' +
        escapeHtml(title) +
        "</h3>" +
        '<div class="meta-row">' +
        '<span class="domain-pill domain-pill--sm">' +
        escapeHtml(domain) +
        "</span>" +
        '<a class="review-link review-link--sm" href="' +
        escapeAttr(link) +
        '" target="_blank" rel="noopener">Open ↗</a>' +
        "</div>" +
        "</header>" +
        '<div class="review-card-body">' +
        '<div class="overall overall--block" aria-label="Overall rating">' +
        '<div class="overall-number">' +
        overallRounded1.toFixed(1) +
        "</div>" +
        '<div class="overall-stars" aria-hidden="true">' +
        overallStars +
        "</div>" +
        '<div class="overall-band">' +
        overallBand +
        "</div>" +
        "</div>" +
        '<dl class="sub-metrics-vert" aria-label="Part ratings">' +
        '<div class="metric-row"><dt>Informal</dt><dd>' +
        p1o.toFixed(1) +
        "</dd></div>" +
        '<div class="metric-row"><dt>Formal</dt><dd>' +
        p2o.toFixed(1) +
        "</dd></div>" +
        '<div class="metric-row"><dt>Transfer</dt><dd>' +
        p3o.toFixed(1) +
        "</dd></div>" +
        "</dl>" +
        '<button class="toggle-details" aria-expanded="false" aria-controls="' +
        detailsId +
        '">Expand details</button>' +
        '<div id="' +
        detailsId +
        '" class="card-details" hidden>' +
        '<div class="legend">' +
        "<div><strong>1★</strong> = minimal presence</div>" +
        "<div><strong>5★</strong> = rich, prominent, well-developed</div>" +
        "</div>" +
        '<div class="details-group">' +
        "<p><strong>Part I — Informal Mathematics</strong> (overall " +
        p1o.toFixed(1) +
        ")</p>" +
        formatSubscores("part_one_informal", p1) +
        "</div>" +
        '<div class="details-group">' +
        "<p><strong>Part II — Formal Mathematics</strong> (overall " +
        p2o.toFixed(1) +
        ")</p>" +
        formatSubscores("part_two_formal", p2) +
        "</div>" +
        '<div class="details-group">' +
        "<p><strong>Part III — Transferability</strong> (overall " +
        p3o.toFixed(1) +
        ")</p>" +
        formatSubscores("part_three_transferability", p3) +
        "</div>" +
        '<p class="notes-full"><strong>Notes:</strong> ' +
        escapeHtml(clampNotes270(notesRaw)) +
        "</p>" +
        "</div>" +
        "</div>";

      frag.appendChild(card);
    });

    listEl.innerHTML = "";
    listEl.appendChild(frag);
  }

  // Toggle details (event delegation)
  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".toggle-details");
    if (!btn) return;
    var id = btn.getAttribute("aria-controls");
    var panel = document.getElementById(id);
    var expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    btn.textContent = expanded ? "Expand details" : "Collapse details";
    if (panel) panel.toggleAttribute("hidden", expanded);
  });
})();
