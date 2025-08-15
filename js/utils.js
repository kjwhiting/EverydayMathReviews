/* utils.js
   - Single fetch for reviews.json with in-memory cache
   - Helpers: rating → label; stars renderer; year stamp
*/
const EMR = window.EMR || (window.EMR = {});

(() => {
  const cache = new Map();

  EMR.fetchJSON = async (url) => {
    if (cache.has(url)) return cache.get(url);
    const resp = await fetch(url, { credentials: "same-origin" });
    if (!resp.ok) throw new Error(`Failed to load ${url}`);
    const data = await resp.json();
    cache.set(url, data);
    return data;
  };

  // Map 0–5 to Low/Medium/High (global rule)
  EMR.labelFor = (n) => (n <= 1 ? "Low" : n <= 3 ? "Medium" : "High");

  // Render solid accent stars (bold theme), 0–5
  EMR.renderStars = (n) => {
    const full = "★".repeat(n);
    const empty = "☆".repeat(5 - n);
    return full + empty;
  };

  // Safe text
  EMR.escape = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );

  // Stamp year in footer
  document.addEventListener("DOMContentLoaded", () => {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
