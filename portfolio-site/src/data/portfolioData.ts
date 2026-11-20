export interface Project {
  id: string;
  title: string;
  client?: string;
  category: 
    | 'Client Work'
    | 'Business & Finance'
    | 'Healthcare'
    | 'Hospitality & Travel'
    | 'Real Estate & Construction'
    | 'Furniture & Retail'
    | 'Fitness'
    | 'Media'
    | 'E-commerce';
  tagline: string;
  description: string;
  url: string;
  isFeatured?: boolean;
  featuredRank?: number;
  isClientWork: boolean;
  techStack: string[];
  features: string[];
  caseStudy?: {
    problem: string;
    solution: string;
    impact: string;
  };
  placeholderScreenshotDesktop?: string;
  placeholderScreenshotMobile?: string;
}

export interface SkillCategory {
  title: string;
  iconName: string;
  skills: { name: string; level: string; icon?: string }[];
}

export const PERSONAL_INFO = {
  name: "Ali Touheed",
  role: "Full-Stack Developer & Product Builder",
  location: "Karachi, Pakistan",
  availableForHire: true,
  statusMessage: "Available for Full-Time Roles & High-Impact Contracts",
  bio: "Early-career full-stack developer who bridges the gap between commercial business operations and modern web engineering. Specialist in React.js, Supabase, Tailwind CSS, and scalable web architectures.",
  tagline: "I don't just build websites — I build revenue-generating web systems, high-speed POS interfaces, and digital products.",
  contact: {
    email: "alitouheed.dev@gmail.com", // [TODO: Update with Ali's exact email if different]
    whatsapp: "+923000000000", // [TODO: Update with Ali's real WhatsApp number]
    whatsappDisplay: "+92 300 0000000",
    linkedin: "https://linkedin.com/in/alitouheed", // [TODO: Update with Ali's exact LinkedIn URL]
    github: "https://github.com/alitouheed", // [TODO: Update with Ali's exact GitHub URL]
  },
  stats: [
    { value: "17+", label: "Live Websites Shipped" },
    { value: "2", label: "Real Client Platforms" },
    { value: "100%", label: "Real Production Code" },
    { value: "<5s", label: "Instant Value Delivery" },
  ]
};

export const GENESIS_STORY = {
  title: "The Genesis Story: From Karachi Streets to Industrial ERP",
  subtitle: "How pitching a local paint retailer sparked my entire software engineering journey",
  content: [
    "Most developers start by copying tutorials on YouTube. My journey started on the busy streets of my neighborhood in Karachi.",
    "I walked directly into Tawakkal Paint House—a local paint shop retailer—introduced myself, and asked the owner a straightforward question: 'Do you want a modern digital presence for your shop?' The owner said yes. That day, I landed my very first commercial web client.",
    "Tawakkal Paint House wasn't my most complex architectural achievement, but it was my most transformative. It taught me how real business owners think, what retail pain points feel like, and why reliable software is worth its weight in gold.",
    "Watching paint retailers struggle daily with paint tinting formulations, multi-can inventory reconciliation, and manual POS calculations directly sparked my current flagship product: Pyntflow, an end-to-end cloud ERP / POS platform for paint enterprises."
  ],
  quote: "It wasn't my finest code yet, but it was my first real client. That grit taught me more than any classroom ever could.",
  badgeText: "Real Commercial Genesis"
};

export const PROJECTS: Project[] = [
  // 1. PYNTFLOW (Featured #1)
  {
    id: "pyntflow",
    title: "Pyntflow ERP & POS",
    client: "Commercial Paint Wholesale & Retail Clients",
    category: "Client Work",
    isClientWork: true,
    isFeatured: true,
    featuredRank: 1,
    tagline: "Industrial Cloud ERP / MRP / POS Suite for Paint Enterprises",
    description: "An end-to-end multi-branch enterprise resource planning and point-of-sale system engineered specifically for paint retail and manufacturing. Includes real-time multi-branch inventory reconciliation, automated reordering, barcode checkout, and an executive CEO cockpit.",
    url: "https://pyntflow.com/",
    techStack: ["React.js", "Supabase", "PostgreSQL", "Tailwind CSS", "Vercel", "TypeScript", "Node.js"],
    features: [
      "Executive CEO Intelligence Dashboard with real-time gross margin metrics",
      "High-speed Point of Sale (POS) optimized for rapid walk-in barcode billing",
      "Specialized Paint Tinting & Formulation recipe calculator",
      "Multi-Branch inventory synchronizer with warehouse transfer audit logs",
      "Customer credit ledger and automated supplier purchase orders"
    ],
    caseStudy: {
      problem: "Paint retail chains juggle thousands of SKUs with varying can sizes, bases, tint colorants, and customer credit lines, leading to frequent inventory leakage and slow checkout lines.",
      solution: "Engineered a custom React + Supabase relational cloud ERP with dedicated cashier POS mode, CEO executive view, and automated multi-branch inventory reconciliation.",
      impact: "Reduced checkout billing time by over 60% and provided shop owners with 100% visibility over warehouse stock across branches."
    },
    placeholderScreenshotDesktop: "TODO: add real screenshot of Pyntflow CEO Panel",
    placeholderScreenshotMobile: "TODO: add real screenshot of Pyntflow POS Mobile"
  },

  // 2. TAWAKKAL PAINT HOUSE (Featured #2)
  {
    id: "tawakkal-paint-house",
    title: "Tawakkal Paint House",
    client: "Tawakkal Paint House (Karachi)",
    category: "Client Work",
    isClientWork: true,
    isFeatured: true,
    featuredRank: 2,
    tagline: "The First Commercial Client Project: Neighborhood Retail Storefront",
    description: "The project that started it all. Built for a local Karachi paint shop retailer after pitching the owner in-person. Delivered their first digital catalog, brand visibility, and direct customer WhatsApp inquiry channel.",
    url: "https://www.tawakkalpainthouse.com/",
    techStack: ["React.js", "Tailwind CSS", "Vercel", "JavaScript"],
    features: [
      "Digital retail catalog showcasing paint brands, primers, and finishes",
      "Direct one-click WhatsApp order and color consultation routing",
      "Local SEO optimization for Karachi paint buyers and contractors",
      "Responsive, mobile-optimized experience for on-site contractors"
    ],
    caseStudy: {
      problem: "A traditional brick-and-mortar paint retailer had zero online presence and lost contractor orders to competitors with digital catalogs.",
      solution: "Created a modern, clean web portal with fast product discovery, direct WhatsApp inquiry flow, and clear retail brand authority.",
      impact: "Established digital credibility for the business, enabled direct contractor orders from mobile, and catalyzed the creation of Pyntflow ERP."
    },
    placeholderScreenshotDesktop: "TODO: add real screenshot of Tawakkal Paint House homepage",
    placeholderScreenshotMobile: "TODO: add real screenshot of Tawakkal Paint House mobile catalog"
  },

  // 3. TITAN BUILD GROUP (Featured #3)
  {
    id: "titan-build-group",
    title: "Titan Build Group",
    category: "Real Estate & Construction",
    isClientWork: false,
    isFeatured: true,
    featuredRank: 3,
    tagline: "Heavy Civil & Commercial Engineering Corporate Platform",
    description: "Enterprise web experience built for modern construction and infrastructure conglomerates. Showcases large-scale commercial developments, safety standards, and tender bid request workflows.",
    url: "https://titan-build-group.vercel.app/",
    techStack: ["React", "TypeScript", "Tailwind CSS", "Vercel"],
    features: [
      "Interactive mega-project gallery with construction phase filters",
      "Enterprise RFP / Project Bid submission portal",
      "Safety milestone statistics and environmental compliance badges",
      "Heavy-duty industrial typography and responsive grid layout"
    ],
    caseStudy: {
      problem: "Construction enterprises struggle to communicate technical scale and project pedigree through standard commercial templates.",
      solution: "Developed an architectural design system highlighting project blueprints, engineering stats, and high-impact structural photography.",
      impact: "Delivered a high-conversion digital headquarters suitable for multi-million dollar institutional tenders."
    },
    placeholderScreenshotDesktop: "TODO: add real screenshot of Titan Build Group hero",
    placeholderScreenshotMobile: "TODO: add real screenshot of Titan Build Group project view"
  },

  // 4. HALDEN E-COMMERCE (Featured #4)
  {
    id: "halden-e-comerce",
    title: "Halden Apparel & Goods",
    category: "E-commerce",
    isClientWork: false,
    isFeatured: true,
    featuredRank: 4,
    tagline: "Headless Minimalist Fashion & Lifestyle Storefront",
    description: "High-performance digital boutique crafted with modern ecommerce UX patterns: micro-interactions, instantaneous slide-over cart drawer, dynamic variant swatches, and frictionless checkout flow.",
    url: "https://halden-e-comerce.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Context API", "Vercel"],
    features: [
      "Sub-100ms slide-over shopping bag with real-time order subtotaling",
      "Tactile color swatch & size selector with live inventory states",
      "Curated editorial collection layouts with hover lookbooks",
      "Optimized mobile layout built for thumbs-only one-handed navigation"
    ],
    caseStudy: {
      problem: "Heavy legacy ecommerce templates suffer from layout shifts, slow cart drawers, and cluttered checkout tunnels.",
      solution: "Designed a clean, minimalist headless storefront architecture with optimistic UI updates and instant feedback.",
      impact: "Demonstrated modern ecommerce speed and polished user experience on all viewport dimensions."
    },
    placeholderScreenshotDesktop: "TODO: add real screenshot of Halden store",
    placeholderScreenshotMobile: "TODO: add real screenshot of Halden cart drawer"
  },

  // 5. NORTHRIDGE ADVISORS
  {
    id: "northridge-advisors",
    title: "Northridge Advisors",
    category: "Business & Finance",
    isClientWork: false,
    tagline: "Private Wealth Advisory & Investment Management",
    description: "Corporate advisory website featuring capital management strategies, executive board profiles, and private wealth consultations.",
    url: "https://northridge-advisors.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Asset management breakdown", "Executive team credentials", "Secure consultation booking"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Northridge Advisors"
  },

  // 6. LAW FIRM MU-UMBER
  {
    id: "law-firm-mu-umber",
    title: "Apex Legal Partners",
    category: "Business & Finance",
    isClientWork: false,
    tagline: "Corporate Litigation & Dispute Resolution Practice",
    description: "Authoritative law firm website with practice area directories, case outcome records, attorney profiles, and confidential case intake.",
    url: "https://law-firm-mu-umber.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Comprehensive practice areas", "Attorney bios & admissions", "Client consultation scheduler"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Apex Legal Partners"
  },

  // 7. SOLARA RETREAT
  {
    id: "solara-retreat",
    title: "Solara Retreat Sanctuary",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Holistic Wellness Sanctuary & Eco-Resort",
    description: "Immersive hospitality web experience with serene nature imagery, wellness itinerary guides, luxury cabin tours, and reservation inquiry.",
    url: "https://solara-retreat.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Wellness package selector", "Interactive retreat gallery", "Seasonal booking request flow"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Solara Retreat"
  },

  // 8. LUXORA DENTAL
  {
    id: "luxora-dental",
    title: "Luxora Cosmetic Dental Clinic",
    category: "Healthcare",
    isClientWork: false,
    tagline: "Modern Dental Aesthetics & Advanced Oral Care",
    description: "Patient-first dental clinic portal offering procedure walkthroughs, before/after smile transformations, practitioner profiles, and appointment requests.",
    url: "https://luxora-dental.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Interactive smile gallery", "Treatment price guidelines", "Patient intake & booking form"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Luxora Dental"
  },

  // 9. NOMADLY TRAVELS
  {
    id: "nomadly-travels",
    title: "Nomadly Travels",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Remote Exploration & Guided Group Expeditions",
    description: "Adventure travel booking platform featuring exotic route itineraries, gear checklists, community reviews, and group expedition slots.",
    url: "https://nomadly-travels.vercel.app/",
    techStack: ["React", "Tailwind CSS", "TypeScript", "Vercel"],
    features: ["Expedition route maps", "Cost & gear transparency calculators", "Live group slot counters"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Nomadly Travels"
  },

  // 10. AZURE COVE RESORT
  {
    id: "azure-cove-resort",
    title: "Azure Cove Oceanfront Resort",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Luxury Coastal Escape & Marina Club",
    description: "Boutique ocean resort destination platform featuring ocean villa showcases, yacht charter bookings, and private beachfront event planning.",
    url: "https://azure-cove-resort.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Villa room suites preview", "Gastronomic dining menus", "Concierge event reservations"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Azure Cove"
  },

  // 11. RESTAURANT FIVE GAMMA
  {
    id: "resturant-five-gamma",
    title: "L'Aura Gastronomy & Bar",
    category: "Hospitality & Travel",
    isClientWork: false,
    tagline: "Artisanal Fine Dining & Wine Experience",
    description: "Sleek dining website featuring chef tasting courses, seasonal ingredient spotlights, sommelier wine pairing lists, and table reservations.",
    url: "https://resturant-five-gamma.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Multi-course menu viewer", "Sommelier wine cellar list", "Table reservation booking modal"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Restaurant Five"
  },

  // 12. FURNITURE SHOWCASE BROWN
  {
    id: "furniture-showcase-brown",
    title: "Artisan Woodcraft & Furnishings",
    category: "Furniture & Retail",
    isClientWork: false,
    tagline: "Handcrafted Hardwood Furniture & Living Spaces",
    description: "Boutique interior showroom showcasing handcrafted dining tables, artisanal credenzas, sustainably sourced timber, and custom design inquiries.",
    url: "https://furniture-showcase-brown.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Woodgrain & material swatch guide", "Living room space planner", "Custom commission inquiry"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Artisan Woodcraft"
  },

  // 13. REAL ESTATE PEACH BETA
  {
    id: "real-state-peach-beta",
    title: "Haven Luxury Real Estate",
    category: "Real Estate & Construction",
    isClientWork: false,
    tagline: "Modern Property Portfolio & Architectural Residences",
    description: "Residential real estate portal featuring high-resolution property tours, neighborhood demographic data, mortgage estimates, and agent contacts.",
    url: "https://real-state-peach-beta.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Filterable property listings", "Square footage and layout metrics", "Direct private showing scheduler"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Haven Real Estate"
  },

  // 14. FURNITURE NEW TEN
  {
    id: "furniture-new-ten",
    title: "Studio Nordic Furnishings",
    category: "Furniture & Retail",
    isClientWork: false,
    tagline: "Contemporary Scandinavian Living & Workspace Design",
    description: "Minimalist home and office furnishing catalog with clean grid layouts, modular furniture configurations, and dimension specs.",
    url: "https://furniture-new-ten.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Modular sofa builder concept", "Color & fabric selector", "Quick specifications sheet"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Studio Nordic"
  },

  // 15. ATLAS ARCHITECTS
  {
    id: "atlas-architects",
    title: "Atlas Architecture & Studio",
    category: "Real Estate & Construction",
    isClientWork: false,
    tagline: "Sustainable Urban Design & Master Planning",
    description: "Architectural firm showcase focusing on sustainable commercial master plans, ecological residential villas, and client consultation intake.",
    url: "https://atlas-architects.vercel.app/contact",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Blueprint and concept gallery", "Urban sustainability index", "Interactive consultation request"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Atlas Architects"
  },

  // 16. GYM EIGHT MUREX
  {
    id: "gym-eight-murex-73",
    title: "IronPulse Performance Gym",
    category: "Fitness",
    isClientWork: false,
    tagline: "Elite Strength Conditioning & Athletic Training Center",
    description: "High-octane fitness studio website with training program matrices, coach certifications, class schedule calendar, and free day pass booking.",
    url: "https://gym-eight-murex-73.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Vercel"],
    features: ["Membership tier comparison table", "Weekly coach timetable", "1-Day complimentary pass claim"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of IronPulse Gym"
  },

  // 17. VECTOR CINEMATIC STORY
  {
    id: "vector-cinematic-story",
    title: "Vector Cinematic Studios",
    category: "Media",
    isClientWork: false,
    tagline: "Visual Storytelling, Commercial Film & Post-Production",
    description: "Cinematic agency showcase highlighting commercial showreels, color grading breakdowns, narrative directing portfolios, and equipment rigs.",
    url: "https://vector-cinematic-story.vercel.app/",
    techStack: ["React", "Tailwind CSS", "Framer Motion", "Vercel"],
    features: ["Cinematic video player embed layout", "Case breakdown with before/after grades", "Client project inquiry flow"],
    placeholderScreenshotDesktop: "TODO: add real screenshot of Vector Cinematic"
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Frontend Development",
    iconName: "Layout",
    skills: [
      { name: "React.js", level: "Advanced" },
      { name: "Next.js", level: "Intermediate" },
      { name: "TypeScript", level: "Advanced" },
      { name: "Tailwind CSS", level: "Advanced" },
      { name: "Framer Motion", level: "Intermediate" },
      { name: "Responsive / Mobile-First UX", level: "Advanced" },
    ]
  },
  {
    title: "Backend & Database",
    iconName: "Database",
    skills: [
      { name: "Supabase", level: "Advanced" },
      { name: "PostgreSQL & RLS", level: "Advanced" },
      { name: "Node.js & Express", level: "Intermediate" },
      { name: "RESTful APIs", level: "Advanced" },
      { name: "ERP & POS Architecture", level: "Advanced" },
      { name: "Auth & RBAC Systems", level: "Advanced" },
    ]
  },
  {
    title: "DevOps & Production",
    iconName: "Cloud",
    skills: [
      { name: "Vercel Deployment", level: "Advanced" },
      { name: "Git & GitHub Workflows", level: "Advanced" },
      { name: "SEO & Core Web Vitals", level: "Advanced" },
      { name: "Performance Optimization", level: "Advanced" },
      { name: "Multi-tenant Architecture", level: "Intermediate" },
      { name: "Environment Management", level: "Advanced" },
    ]
  }
];

export const WORK_PROCESS = [
  {
    step: "01",
    title: "Real Business Audit",
    description: "I don't start with code; I start with cash flows, operational bottlenecks, and client requirements. Exactly how Tawakkal and Pyntflow were born."
  },
  {
    step: "02",
    title: "Architecture & Data Models",
    description: "Designing bulletproof relational schemas (PostgreSQL / Supabase), state flows, and modular React components before laying a single pixel."
  },
  {
    step: "03",
    title: "Rapid Agile Development",
    description: "Building production-grade UI with Tailwind CSS and responsive design patterns, continuously deploying live previews for instant stakeholder feedback."
  },
  {
    step: "04",
    title: "Zero-Downtime Deployment",
    description: "Deploying to Vercel with high-speed caching, strict SEO meta configuration, and automated Lighthouse 90+ performance standards."
  }
];
