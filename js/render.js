/* render.js
   - Contains static definitions for 1★ and 5★ meanings (no extra fetch)
   - Card + expansion renderers shared across domain pages
*/
const EMR = window.EMR || (window.EMR = {});

(() => {
  // Static meanings for categories (1★ and 5★). Academic names preserved.
  const MEANINGS = {
    part_one_informal: {
      expressive_mathematics_rating: {
        name: "Expressive Mathematics Rating",
        one: "Little to no intuitive mathematical play; math is incidental.",
        five: "Rich, intuitive mathematical play is core to the experience.",
      },
      mathematical_intuition_development: {
        name: "Mathematical Intuition Development",
        one: "No growth in intuitive math skills.",
        five: "Strong growth through practice and feedback.",
      },
      noticeable_math: {
        name: "Noticeable Math",
        one: "Math is largely invisible.",
        five: "Math is obvious and discussed openly.",
      },
      accessibility: {
        name: "Accessibility",
        one: "Barriers for many learners.",
        five: "Highly accessible across abilities.",
      },
    },
    part_two_formal: {
      formal_mathematics_exposure: {
        name: "Formal Mathematics Exposure",
        one: "No explicit math concepts or terminology.",
        five: "Frequent, explicit engagement with formal math ideas.",
      },
      rigor_rating: {
        name: "Rigor Rating",
        one: "Informal, imprecise references.",
        five: "Precise, well-defined structures.",
      },
      mathematical_systems: {
        name: "Mathematical Systems",
        one: "No consistent system.",
        five: "Clear, coherent systems in play.",
      },
    },
    part_three_transferability: {
      breadth_of_application: {
        name: "Breadth of Application",
        one: "Narrow, context-bound.",
        five: "Broad cross-domain relevance.",
      },
      ease_of_transfer: {
        name: "Ease of Transfer",
        one: "Hard to apply elsewhere.",
        five: "Concepts transfer naturally.",
      },
      math_depth: {
        name: "Math Depth",
        one: "Surface-only.",
        five: "Layered depth and insight.",
      },
    },
  };

  // Boolean field labels for Required / Shows Up
  const BOOL_LABELS = {
    counting: "Counting",
    arithmetic: "Arithmetic",
    algebra: "Algebra",
    geometry: "Geometry",
    statistics_probability: "Statistics / Probability",
    proofs: "Proofs",
    trigonometry: "Trigonometry",
    calculus: "Calculus",
    data_representation: "Data Representation",
    measurement_units: "Measurement & Units",
    specialized_math: "Specialized Math",
    advanced_concepts: "Advanced Concepts",
  };

  // ============= Shared render helpers =============
  const starNumLabel = (n) =>
    `<span class="stars" aria-hidden="true">${EMR.renderStars(n)}</span>
     <span class="num" aria-hidden="true">(${n}/5)</span>
     <span class="label"> ${EMR.labelFor(n)} </span>
     <span class="sr-only">Rated ${n} out of 5 — ${EMR.labelFor(n)}</span>`;

  const categoryRow = (sideLeft, value, sideRight) => `
    <div class="cat" role="group" aria-label="${EMR.escape(sideLeft.name)}">
      <div class="side">[1★] ${EMR.escape(sideLeft.one)}</div>
      <div class="value"><strong>${starNumLabel(value)}</strong></div>
      <div class="side">[5★] ${EMR.escape(sideRight.five)}</div>
    </div>
  `;

  function boolGrid(obj, label) {
    const pairs = Object.entries(obj);
    const items = pairs
      .map(([key, v]) => {
        const txt = BOOL_LABELS[key] || key;
        const cls = v ? "bool-yes" : "bool-no";
        return `<div class="bool-item ${cls}"><span>${EMR.escape(
          txt
        )}</span></div>`;
      })
      .join("");
    return `
      <section aria-label="${label}">
        <h4>${label}</h4>
        <div class="bool-grid">${items}</div>
      </section>
    `;
  }

  // Mini metrics (Part overalls) in compact list
  function miniMetrics(review) {
    const p1 = review.part_one_informal.overall;
    const p2 = review.part_two_formal.overall;
    const p3 = review.part_three_transferability.overall;
    const row = (name, n) => `
      <div class="metric">
        <span class="metric-name">${EMR.escape(name)}</span>
        <span>${EMR.renderStars(
          n
        )} <span class="num">(${n}/5)</span> <span class="label">${EMR.labelFor(
      n
    )}</span></span>
      </div>
    `;
    return `
      <div class="metrics" aria-label="Mini metrics">
        ${row("Expressive Mathematics", p1)}
        ${row("Formal Exposure", p2)}
        ${row("Transferability", p3)}
      </div>
    `;
  }

  // Expanded section for each Part, rendering all categories with 1★/5★ meanings
  function partSection(partKey, partData) {
    const defs = MEANINGS[partKey];
    const entries = Object.entries(partData)
      .filter(([k]) => k !== "overall")
      .map(([k, v]) => categoryRow(defs[k], v, defs[k]))
      .join("");

    return `
      <section>
        <h4>${titleForPart(partKey)}</h4>
        ${entries}
        <p><strong>Overall for ${titleForPart(
          partKey
        )}:</strong> ${starNumLabel(partData.overall)}</p>
      </section>
    `;
  }

  function titleForPart(key) {
    if (key === "part_one_informal") return "Part One — Informal Mathematics";
    if (key === "part_two_formal") return "Part Two — Formal Mathematics";
    if (key === "part_three_transferability")
      return "Part Three — Transferability";
    return key;
  }

  // Single card renderer (summary + expansion)
  EMR.renderCard = (review) => {
    const overall = review.overall_rating;
    const id = "exp-" + Math.random().toString(36).slice(2, 8); // for aria-controls (no routing)
    return `
      <article class="card" aria-labelledby="${id}-title">
        <div class="meta">${EMR.escape(capitalize(review.domain))}</div>
        <h3 id="${id}-title">${EMR.escape(review.title)}</h3>

        <div class="rating" aria-label="Overall rating">
          <div class="stars" aria-hidden="true">${EMR.renderStars(
            overall
          )}</div>
          <div class="num" aria-hidden="true">(${overall}/5)</div>
          <div class="label"> ${EMR.labelFor(overall)} </div>
          <span class="sr-only">Overall rating: ${overall} out of 5 — ${EMR.labelFor(
      overall
    )}</span>
        </div>

        ${miniMetrics(review)}

        <button class="expand-btn" aria-expanded="false" aria-controls="${id}">
          View full review
        </button>

        <div id="${id}" class="expand" data-open="false" role="region" aria-labelledby="${id}-title">
          ${partSection("part_one_informal", review.part_one_informal)}
          ${partSection("part_two_formal", review.part_two_formal)}
          ${partSection(
            "part_three_transferability",
            review.part_three_transferability
          )}

          ${boolGrid(
            review.required_math_background,
            "Required Math Background"
          )}
          ${boolGrid(
            review.concepts_that_show_up,
            "Math Concepts That Show Up"
          )}

          ${
            review.notes
              ? `<section><h4>Notes</h4><p>${EMR.escape(
                  review.notes
                )}</p></section>`
              : ""
          }

          ${
            review.link
              ? `<p class="external-link">Find it here: <a target="_blank" rel="noopener" href="${EMR.escape(
                  review.link
                )}">${EMR.escape(review.link)}</a></p>`
              : ""
          }

          <p><button class="expand-btn" data-collapse>Collapse review</button></p>
        </div>
      </article>
    `;
  };

  function capitalize(s) {
    return (s || "").slice(0, 1).toUpperCase() + (s || "").slice(1);
  }
})();
