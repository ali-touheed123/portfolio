export type ProjectCategory =
  | 'Client Work'
  | 'Business & Finance'
  | 'Healthcare'
  | 'Hospitality & Travel'
  | 'Real Estate & Construction'
  | 'Furniture & Retail'
  | 'Fitness'
  | 'Media'
  | 'E-commerce';

export interface Project {
  id: string;
  title: string;
  client?: string;
  category: ProjectCategory;
  tagline: string;
  description: string;
  url: string;
  isFeatured?: boolean;
  featuredRank?: number;
  isClientWork: boolean;
  techStack: string[];
  features: string[];
  accentHue?: string;
  metricBadge?: string;
  caseStudy?: {
    problem: string;
    solution: string;
    impact: string;
  };
}

export interface SkillCategory {
  title: string;
  description: string;
  skills: { name: string; detail: string }[];
}

export const PERSONAL_INFO = {
  name: "Ali Touheed",
  role: "Web & App Developer · AI Automation",
  subtitle: "Full-Stack Developer & Product Builder",
  location: "Karachi, Pakistan",
  availableForHire: true,
  bio: "I bridge real commercial operations and modern web engineering—turning manual business bottlenecks into fast, revenue-generating software products.",
  tagline: "Not just websites. Revenue-generating systems, high-speed POS interfaces, and interactive digital products.",
  contact: {
    email: "alitouheed.2005@gmail.com",
    github: "https://github.com/ali-touheed123",
  },
  stats: [
    { value: "17+", label: "Live Websites Shipped", context: "Deployed in production" },
    { value: "2", label: "Commercial Client Systems", context: "Karachi retail & ERP" },
    { value: "60%", label: "Faster POS Checkout", context: "Pyntflow retail workflow" },
    { value: "100%", label: "Interactive Previews", context: "Test every build on-site" },
  ],
};

export const GENESIS_STORY = {
  kicker: "Origin Story",
  title: "From Karachi Streets to Industrial Cloud ERP",
  subtitle: "How pitching a neighborhood paint retailer sparked a full-stack product engineering journey.",
  content: [
    "Most developers start by cloning tutorials on YouTube. My journey started by walking directly into a neighborhood shop in Karachi.",
    "I stepped into Tawakkal Paint House, introduced myself to the owner, and asked a straightforward question: 'Do you want a modern digital presence for your shop?' He said yes—and I landed my very first commercial web client.",
    "Watching paint retailers wrestle every day with tinting formulations, multi-can inventory reconciliation, customer credit ledgers, and slow manual billing revealed a far bigger software gap.",
    "That real-world insight directly sparked Pyntflow: an end-to-end cloud ERP, formulation calculator, and high-speed POS platform built specifically for paint wholesalers and multi-branch retailers."
  ],
  quote: "It wasn't my finest code yet, but it was my first real client. That grit taught me how real businesses buy, operate, and scale.",
};

export const PROJECTS: Project[] = [
  {
    id: "pyntflow",
    title: "Pyntflow ERP & POS",
    client: "Commercial Paint Wholesale & Retail",
    category: "Client Work",
    isClientWork: true,
    isFeatured: true,
    featuredRank: 1,
    metricBadge: "60% faster checkout billing",
    accentHue: "#8b5cf6",
    tagline: "Industrial Cloud ERP, MRP & POS Suite for Paint Enterprises",
    description: "An end-to-end multi-branch enterprise resource planning and point-of-sale system engineered for paint retail and manufacturing—combining real-time branch reconciliation, barcode checkout, tinting formulas, and an executive cockpit.",
    url: "https://pyntflow.com/",
    techStack: ["React.js", "Supabase", "PostgreSQL", "Tailwind CSS", "TypeScript", "Node.js"],
    features: [
      "Executive CEO Intelligence Dashboard with live gross margin metrics",
      "High-speed Point of Sale (POS) tuned for rapid walk-in barcode billing",
      "Specialized Paint Tinting & Formulation recipe calculator",
      "Multi-branch inventory synchronizer with warehouse transfer audit logs",
      "Customer credit ledger and automated supplier purchase orders",
    ],
    caseStudy: {
      problem: "Paint retail chains juggle thousands of SKUs across can sizes, bases, colorants, and credit ledgers—causing stock leakage and slow billing queues.",
      solution: "Engineered a custom React + Supabase relational cloud ERP with a dedicated cashier POS mode, CEO cockpit, and live multi-branch inventory sync.",
      impact: "Cut checkout billing time by over 60% and gave shop owners real-time stock visibility across every branch.",
    },
  },
  {
    id: "tawakkal-paint-house",
    title: "Tawakkal Paint House",
    client: "Tawakkal Paint House · Karachi",
    category: "Client Work",
    isClientWork: true,
    isFeatured: true,
    featuredRank: 2,
    metricBadge: "First commercial client launch",
    accentHue: "#0ea5e9",
    tagline: "Neighborhood Paint Retailer Storefront & Contractor Portal",
    description: "The project that started everything. Built after pitching a local Karachi paint retailer in person—delivering a digital catalog, brand credibility, and frictionless contractor inquiry routing.",
    url: "https://www.tawakkalpainthouse.com/",
    techStack: ["React.js", "Tailwind CSS", "Vercel", "JavaScript"],
    features: [
      "Digital retail catalog showcasing paint brands, primers, and finishes",
      "One-click contractor order and color consultation routing",
      "Local search optimization for Karachi paint buyers and contractors",
      "Thumb-friendly mobile catalog built for on-site job estimation",
    ],
    caseStudy: {
      problem: "A traditional brick-and-mortar paint shop had zero digital visibility and lost contractor orders to competitors with searchable catalogs.",
      solution: "Built a clean, fast web storefront focused on instant product discovery, finish comparison, and direct mobile ordering.",
      impact: "Established digital authority for the store, streamlined contractor inquiries from mobile, and inspired Pyntflow ERP.",
    },
  },
  {
    id: "titan-build-group",
    title: "Titan Build Group",
    category: "Real Estate & Construction",
    isClientWork: false,
    isFeatured: true,
    featuredRank: 3,
    metricBadge: "Enterprise tender showcase",
    accentHue: "#f59e0b",
    tagline: "Heavy Civil & Commercial Engineering Corporate Platform",
    description: "Enterprise web platform for commercial construction conglomerates featuring large-scale project portfolios, safety milestones, and institutional tender bid intake.",
    url: "https://titan-build-group.vercel.app/",
    techStack: ["React", "TypeScript", "Tailwind CSS", "Vercel"],
    features: [
      "Interactive mega-project gallery with construction phase filters",
      "Enterprise RFP and project bid submission workflow",
      "Safety compliance metrics and structural engineering highlights",
      "High-contrast industrial typography and responsive blueprint grids",
    ],
    caseStudy: {
      problem: "Construction conglomerates struggle to communicate engineering scale and safety rigor through generic corporate templates.",
      solution: "Crafted an architectural design system pairing structural metrics, phased project showcases, and streamlined bid intake.",
      impact: "Delivers institutional credibility tailored for high-value commercial infrastructure tenders.",
    },
  },
  {
    id: "halden-e-comerce",
    title: "Halden Apparel & Goods",
    category: "E-commerce",
    isClientWork: false,
    isFeatured: true,
    featuredRank: 4,
    metricBadge: "Sub-100ms cart interactions",
    accentHue: "#10b981",
    tagline: "Headless Minimalist Fashion & Lifestyle Storefront",
    description: "High-speed digital boutique built around tactile micro-interactions, an instantaneous slide-over cart drawer, live variant swatches, and frictionless mobile checkout.",
    url: "https://halden-e-comerce.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Context API", "Vercel"],
    features: [
      "Sub-100ms slide-over shopping bag with live order subtotaling",
      "Color swatch and size selector with real-time stock states",
      "Curated editorial lookbook layouts with subtle hover reveals",
      "Thumb-first mobile navigation engineered for fast checkout",
    ],
    caseStudy: {
      problem: "Bloated e-commerce templates suffer from layout shift, sluggish cart drawers, and high mobile checkout drop-off.",
      solution: "Architected a minimalist headless storefront with optimistic state updates and zero-lag drawer transitions.",
      impact: "Delivers boutique editorial polish with native-app responsiveness across mobile and desktop.",
    },
  },
  {
    id: "northridge-advisors",
    title: "Northridge Financial Advisors",
    category: "Business & Finance",
    isClientWork: false,
    tagline: "Private Wealth Advisory & Investment Management",
    description: "Corporate advisory platform featuring capital management strategies, executive board credentials, and confidential wealth consultations.",
    url: "https://northridge-advisors.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Asset management strategy breakdown",
      "Executive leadership profiles",
      "Private consultation booking workflow",
    ],
  },
  {
    id: "law-firm-mu-umber",
    title: "Apex Legal Partners",
    category: "Business & Finance",
    isClientWork: false,
    tagline: "Corporate Litigation & Dispute Resolution Practice",
    description: "Authoritative legal practice portal with practice area directories, representative case outcomes, attorney profiles, and confidential intake.",
    url: "https://law-firm-mu-umber.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Structured practice area directory",
      "Attorney biographies & bar admissions",
      "Confidential client consultation intake",
    ],
  },
  {
    id: "solara-retreat",
    title: "Solara Retreat Sanctuary",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Holistic Wellness Sanctuary & Eco-Resort",
    description: "Immersive hospitality web experience featuring wellness itineraries, luxury cabin showcases, and seasonal reservation requests.",
    url: "https://solara-retreat.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Curated wellness package selector",
      "Interactive retreat visual gallery",
      "Seasonal booking request flow",
    ],
  },
  {
    id: "luxora-dental",
    title: "Luxora Cosmetic Dental Clinic",
    category: "Healthcare",
    isClientWork: false,
    tagline: "Modern Dental Aesthetics & Oral Care",
    description: "Patient-first dental clinic portal offering treatment walkthroughs, practitioner profiles, pricing transparency, and appointment scheduling.",
    url: "https://luxora-dental.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Interactive treatment showcase",
      "Transparent procedure pricing guide",
      "Patient intake & appointment booking",
    ],
  },
  {
    id: "nomadly-travels",
    title: "Nomadly Travels",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Remote Exploration & Guided Group Expeditions",
    description: "Adventure travel platform featuring route itineraries, gear checklists, transparent pricing breakdowns, and live group slot availability.",
    url: "https://nomadly-travels.vercel.app/",
    techStack: ["React", "Tailwind CSS", "TypeScript", "Vercel"],
    features: [
      "Expedition route & itinerary views",
      "Cost & gear transparency breakdown",
      "Live group expedition slot counters",
    ],
  },
  {
    id: "azure-cove-resort",
    title: "Azure Cove Oceanfront Resort",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Luxury Coastal Escape & Marina Club",
    description: "Boutique coastal destination site showcasing oceanfront villas, dining menus, yacht charters, and private event concierge bookings.",
    url: "https://azure-cove-resort.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Oceanfront villa suite showcase",
      "Gastronomic dining menu preview",
      "Concierge event reservation intake",
    ],
  },
  {
    id: "resturant-five-gamma",
    title: "L'Aura Gastronomy & Bar",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Artisanal Fine Dining & Wine Experience",
    description: "Sleek culinary showcase featuring chef tasting courses, seasonal ingredient highlights, sommelier pairings, and table reservations.",
    url: "https://resturant-five-gamma.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Multi-course tasting menu viewer",
      "Sommelier wine cellar pairings",
      "Interactive table reservation modal",
    ],
  },
  {
    id: "furniture-showcase-brown",
    title: "Artisan Woodcraft & Furnishings",
    category: "Furniture & Retail",
    isClientWork: false,
    tagline: "Handcrafted Hardwood Furniture & Living Spaces",
    description: "Boutique interior showroom highlighting handcrafted dining tables, timber finish swatches, spatial lookbooks, and custom commissions.",
    url: "https://furniture-showcase-brown.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Woodgrain & material swatch guide",
      "Living space collection showcase",
      "Custom commission inquiry form",
    ],
  },
  {
    id: "real-state-peach-beta",
    title: "Haven Luxury Real Estate",
    category: "Real Estate & Construction",
    isClientWork: false,
    tagline: "Modern Property Portfolio & Architectural Residences",
    description: "Residential real estate portal with filterable property listings, layout metrics, neighborhood context, and private showing scheduling.",
    url: "https://real-state-peach-beta.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Filterable architectural listings",
      "Floor area and layout metrics",
      "Direct private showing scheduler",
    ],
  },
  {
    id: "furniture-new-ten",
    title: "Studio Nordic Furnishings",
    category: "Furniture & Retail",
    isClientWork: false,
    tagline: "Contemporary Scandinavian Living & Workspace Design",
    description: "Minimalist home and workspace catalog featuring modular furniture configurations, upholstery options, and dimension specifications.",
    url: "https://furniture-new-ten.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Modular seating configuration preview",
      "Fabric & finish selector",
      "Detailed specification sheets",
    ],
  },
  {
    id: "atlas-architects",
    title: "Atlas Architecture & Studio",
    category: "Real Estate & Construction",
    isClientWork: false,
    tagline: "Sustainable Urban Design & Master Planning",
    description: "Architectural practice showcase focused on ecological residential villas, commercial master plans, and client consultation intake.",
    url: "https://atlas-architects.vercel.app/contact",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Blueprint and concept gallery",
      "Urban sustainability metrics",
      "Interactive studio consultation form",
    ],
  },
  {
    id: "gym-eight-murex-73",
    title: "IronPulse Performance Gym",
    category: "Fitness",
    isClientWork: false,
    tagline: "Elite Strength Conditioning & Athletic Training",
    description: "High-energy fitness club portal featuring training programs, coach profiles, weekly class timetables, and complimentary day pass claims.",
    url: "https://gym-eight-murex-73.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: [
      "Membership tier comparison",
      "Weekly training schedule grid",
      "Complimentary day pass registration",
    ],
  },
  {
    id: "vector-cinematic-story",
    title: "Vector Cinematic Studios",
    category: "Media",
    isClientWork: false,
    tagline: "Visual Storytelling, Commercial Film & Post-Production",
    description: "Production studio showcase highlighting commercial reels, color grading breakdowns, directing credits, and client project intake.",
    url: "https://vector-cinematic-story.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Framer Motion", "Vercel"],
    features: [
      "Cinematic reel showcase layout",
      "Color grading breakdown views",
      "Production inquiry workflow",
    ],
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Frontend & Interactive Motion",
    description: "Interfaces engineered for 60fps tactile polish, zero layout shift, and immediate clarity.",
    skills: [
      { name: "React 19 & Next.js", detail: "App architecture & SSR/SPA" },
      { name: "TypeScript", detail: "Strict end-to-end type safety" },
      { name: "Motion & WebGL Shaders", detail: "Spring physics, Canvas & GLSL" },
      { name: "Tailwind CSS", detail: "Design systems & responsive UX" },
    ],
  },
  {
    title: "Backend, Auth & Business Systems",
    description: "Relational data models and automation built for real cash flows and multi-user operations.",
    skills: [
      { name: "Supabase & PostgreSQL", detail: "Schemas, RLS & real-time sync" },
      { name: "Node.js & Express", detail: "REST APIs & AI workflow hooks" },
      { name: "ERP & POS Architecture", detail: "Multi-branch inventory & billing" },
      { name: "Auth & Role Permissions", detail: "Secure multi-tenant access" },
    ],
  },
  {
    title: "Conversion, SEO & Production",
    description: "Fast global deployments engineered to convert visitors into paying clients.",
    skills: [
      { name: "Vercel & Cloud Pipelines", detail: "Zero-downtime CI/CD launches" },
      { name: "Technical SEO & Open Graph", detail: "Structured JSON-LD & speed" },
      { name: "Core Web Vitals", detail: "Asset optimization & lazy loading" },
      { name: "Product Discovery", detail: "Auditing business pain points first" },
    ],
  },
];

export const WORK_PROCESS = [
  {
    step: "01",
    title: "Real Business Audit",
    description: "I start with revenue bottlenecks, customer friction, and operational workflows—never a blank template. That is how Tawakkal and Pyntflow were born.",
  },
  {
    step: "02",
    title: "Architecture & Data Models",
    description: "Designing clean relational schemas, state flows, and interactive wireframes before writing production UI code.",
  },
  {
    step: "03",
    title: "High-Craft Interactive Build",
    description: "Engineering responsive components, smooth spring motion, and continuous live preview links for instant feedback.",
  },
  {
    step: "04",
    title: "Fast Launch & Conversion Polish",
    description: "Deploying globally with strict SEO metadata, compressed assets, and measurable performance.",
  },
];
