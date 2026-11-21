import { GENESIS_STORY, PERSONAL_INFO, PROJECTS, SKILL_CATEGORIES } from '../data/portfolioData';

/**
 * Generates and downloads a clean, print-ready standalone CV document for Ali Touheed
 * directly from verified portfolio data.
 */
export function downloadAliCv(): void {
  const featured = PROJECTS.filter((p) => p.isFeatured);
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Ali Touheed — Curriculum Vitae</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; max-width: 820px; margin: 40px auto; padding: 0 24px; line-height: 1.55; }
    h1 { margin: 0 0 4px; font-size: 28px; letter-spacing: -0.02em; }
    .meta { color: #475569; font-size: 14px; margin-bottom: 24px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #6d28d9; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; }
    .item { margin-bottom: 14px; }
    .item-title { font-weight: 600; font-size: 15px; }
    .item-sub { color: #64748b; font-size: 13px; margin-bottom: 4px; }
    ul { margin: 6px 0 0 18px; padding: 0; font-size: 14px; color: #334155; }
  </style>
</head>
<body>
  <h1>${PERSONAL_INFO.name}</h1>
  <div class="meta">${PERSONAL_INFO.role} &middot; ${PERSONAL_INFO.location} &middot; ${PERSONAL_INFO.contact.email} &middot; ${PERSONAL_INFO.contact.github}</div>
  <p>${PERSONAL_INFO.bio}</p>

  <h2>Commercial & Flagship Engineering</h2>
  ${featured
    .map(
      (p) => `<div class="item">
      <div class="item-title">${p.title} &mdash; <span style="font-weight:400;color:#475569">${p.url}</span></div>
      <div class="item-sub">${p.tagline} (${p.techStack.join(', ')})</div>
      <p style="margin:4px 0;font-size:14px">${p.description}</p>
      <ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>
    </div>`
    )
    .join('')}

  <h2>Origin & Engineering Philosophy</h2>
  <p style="font-size:14px">${GENESIS_STORY.content.join(' ')}</p>

  <h2>Core Technical Capabilities</h2>
  ${SKILL_CATEGORIES.map(
    (cat) => `<div class="item">
      <div class="item-title">${cat.title}</div>
      <div class="item-sub">${cat.skills.map((s) => `${s.name} (${s.detail})`).join(' · ')}</div>
    </div>`
  ).join('')}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Ali-Touheed-CV.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
