# EverydayMathReviews.com (static prototype)

## Run locally
Just open any HTML file in a browser, or serve the folder:
- Python: python3 -m http.server 8080
- Or use VS Code "Live Server"

## Deploy to GitHub Pages
- Push this folder to a repo.
- In repo settings → Pages → serve from branch (e.g., main / root).

## Data
- Edit `data/reviews.json` to add more reviews.
- Ratings must be integers 0–5.
- `overall_rating` should be the rounded mean of the three part overalls.
- `notes` must be a single string ≤ 270 chars.

## Pages
- `about.html` (home + methodology)
- `games.html`, `movies.html`, `sewing.html`, `music.html`, `art.html`

## A11y (quick)
- Keyboard: Tab to “View full review” toggles; visible focus states.
- Contrast: Bold theme, solid accent; verify with a checker if you change colors.
- Motion: Minimal; respects reduced-motion preferences.
