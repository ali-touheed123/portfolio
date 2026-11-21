# Ali Touheed — Full-Stack Developer Portfolio

A personal portfolio built for **Ali Touheed**, Full-Stack Developer from Karachi, Pakistan, specializing in **React.js, Supabase, Tailwind CSS, Vercel, and enterprise ERP/POS systems**.

Showcases **17+ live production websites**, including flagship client platforms (**Pyntflow ERP** and **Tawakkal Paint House**), detailed case studies, an interactive project directory with industry filters, and a mobile-first responsive layout.

---

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed.

```bash
# 1. Navigate to the project directory
cd portfolio-site

# 2. Install dependencies
pnpm install

# 3. Start local development server
pnpm dev
```

Visit `http://localhost:5173` in your browser.

To create an optimized production build:
```bash
pnpm build
```

---

## ✏️ How to Edit Content & Personal Info

All text, projects, links, skills, and personal information are centralized in **one single file**:

📁 [`src/data/portfolioData.ts`](./src/data/portfolioData.ts)

### 1. Update Contact Information
Inside `PERSONAL_INFO.contact`, update:
```ts
contact: {
  email: "your.real.email@gmail.com",
  whatsapp: "+923001234567",
  whatsappDisplay: "+92 300 1234567",
  linkedin: "https://linkedin.com/in/your-profile",
  github: "https://github.com/your-username",
}
```

### 2. Add or Edit Projects
All 17 live projects are listed inside the `PROJECTS` array. To change a description, add a new project, or update tech stack pills, simply edit the corresponding entry in `src/data/portfolioData.ts`.

---

## 🖼️ Replacing Screenshot Placeholders

Currently, the project uses placeholder labels so no fake imagery is shown. To add real screenshots:

1. Capture your desktop and mobile screenshots (recommended size: `1280x720` for desktop, `390x844` for mobile).
2. Save them into `public/screenshots/` (e.g., `public/screenshots/pyntflow-desktop.png`).
3. In `src/data/portfolioData.ts`, update the project's screenshot path:
```ts
placeholderScreenshotDesktop: "/screenshots/pyntflow-desktop.png",
placeholderScreenshotMobile: "/screenshots/pyntflow-mobile.png",
```

---

## 🌐 Deploying to Vercel

### Method 1: Deploy via Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally if you haven't already
npm install -g vercel

# From the portfolio-site folder, run:
vercel
```
Follow the simple terminal prompts (Accept defaults: framework is `Vite`, root directory is `./`).

For production deployment:
```bash
vercel --prod
```

### Method 2: Deploy via GitHub & Vercel Dashboard

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Ali Touheed portfolio"
   git remote add origin https://github.com/your-username/portfolio.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Set Framework Preset to **Vite** and Build Command to `pnpm build` (or `npm run build`).
5. Click **Deploy**!

---

## ⚡ Performance & SEO Features

* **Sub-second Initial Load**: Zero heavy dependencies, pure Vite + React 19 + Tailwind CSS.
* **Full Open Graph & Social Cards**: Pre-configured in `index.html`.
* **Sitemap & Robots**: Pre-configured in `public/sitemap.xml` and `public/robots.txt`.
* **Safe Live Preview**: Sandboxed opt-in iframe loading that prevents third-party scripts from hurting initial page speed or Lighthouse score.
* **Accessible & Mobile-Tested**: Tested across mobile (375px/390px), tablet (768px), and desktop (1280px+).
