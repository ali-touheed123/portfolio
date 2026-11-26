# My Work — Standalone 3D Watch-Strap Project Showcase

A standalone, export-ready React + TypeScript + Tailwind CSS **My Work** page featuring a scroll-driven 5-card 3D watch-strap arrangement, dynamic project metadata, and an integrated case study modal.

## Project Structure

```text
├── public/assets/aistudio/     # Project screenshots (16:10 landscape PNGs)
├── src/
│   ├── components/
│   │   ├── AmbientBackdrop.tsx # Obsidian canvas, purple lighting, curved linework
│   │   ├── CaseStudyModal.tsx  # Fullscreen/modal case study drawer
│   │   ├── ProjectInfoPanel.tsx# Left column project details, tech badges, counter
│   │   ├── TechIcon.tsx        # Minimal vector icons for tech badges
│   │   ├── WatchStrapCard.tsx  # Individual floating 3D screen card
│   │   └── WatchStrapShowcase.tsx # 3D perspective stage & cylindrical arc engine
│   ├── data/
│   │   └── projects.ts         # Structured project dataset (easy to edit/replace)
│   ├── hooks/
│   │   └── useReducedMotion.ts # Respects prefers-reduced-motion
│   ├── pages/
│   │   └── MyWorkPage.tsx      # Standalone responsive My Work page component
│   ├── types/
│   │   └── project.ts          # TypeScript interfaces
│   ├── App.tsx
│   └── index.css
├── index.html
└── package.json
```

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Customizing Projects & Screenshots

Edit `src/data/projects.ts` to update project titles, descriptions, categories, tech stacks, live URLs, case studies, or screenshot paths. The 3D watch-strap layout automatically wraps around any number of projects (`>= 1`) while always rendering the 5-card curved arrangement.

## Integrating Into an Existing Portfolio

Copy `src/pages/MyWorkPage.tsx`, `src/components/*`, `src/hooks/useReducedMotion.ts`, `src/types/project.ts`, `src/data/projects.ts`, and `public/assets/` into your portfolio project, then mount `<MyWorkPage />` on your `/work` or `/projects` route. Ensure `motion` and `lucide-react` are installed.
