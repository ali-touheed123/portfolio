import { Project } from '../types/project';
import { mediaUrl } from '../../config/media';

/**
 * Portfolio projects dataset.
 *
 * To customize or swap projects:
 * 1. Place new screenshot files inside `/public/assets/aistudio/` (or `/public/assets/projects/`).
 * 2. Update `image`, `titleLead`, `titleAccent`, `description`, `techStack`, and `liveUrl`.
 * 3. The 3D watch-strap showcase automatically adapts to any number of projects (>= 1).
 */
export const PROJECTS: Project[] = [
  {
    id: 'pyntflow-erp',
    titleLead: 'Pynt',
    titleAccent: 'Flow',
    title: 'PyntFlow ERP & POS',
    category: 'Commercial Paint Wholesale & Retail',
    clientType: 'Flagship Client Work',
    description:
      'A modern ERP + POS system engineered for commercial paint wholesalers and retail counters, built to unify fast keyboard-driven billing, shade inventory, and multi-branch ledger control.',
    image: mediaUrl('projects/showcase/pyntflowimage_d6302de2.png', '/assets/aistudio/pyntflowimage_d6302de2.png'),
    imageAlt: 'PyntFlow ERP and POS register billing interface screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'supabase', label: 'Supabase' },
      { id: 'typescript', label: 'TypeScript' },
    ],
    liveUrl: 'https://pyntflow.com',
    caseStudy: {
      role: 'Lead Product Designer & Full-Stack Engineer',
      timeline: 'Flagship Production System',
      challenge:
        'Paint retail counters struggled with slow legacy desktop billing software that could not handle shade codes, pack-unit conversions, customer credit ledgers, and live register holds cleanly.',
      solution:
        'Designed a keyboard-first POS register (F1–F9 shortcuts) backed by real-time stock synchronization, multi-tender split payments, and automated customer account tracking.',
      deliverables: [
        'Keyboard-first POS Register & Invoice Engine',
        'Shade & Pack-Unit Inventory Matrix',
        'Customer Credit Ledger & Return Workflows',
        'Role-based Branch & Register Telemetry',
      ],
      outcome:
        'Deployed as a flagship commercial ERP powering daily wholesale and retail counter billing with zero-lag barcode and shade lookup.',
    },
  },
  {
    id: 'tawakkal-paint-house',
    titleLead: 'Tawakkal ',
    titleAccent: 'Paint House',
    title: 'Tawakkal Paint House',
    category: 'B2B Retail Storefront',
    clientType: '1st Client Deployment',
    description:
      'A high-conversion B2B and retail paint storefront enabling contractors and homeowners to order at wholesale rates or book professional application services.',
    image: mediaUrl('projects/showcase/tawakkalimage_f923a218.png', '/assets/aistudio/tawakkalimage_f923a218.png'),
    imageAlt: 'Tawakkal Paint House B2B and retail storefront hero screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'supabase', label: 'Supabase' },
    ],
    liveUrl: 'https://tawakkalpainthouse.com',
    caseStudy: {
      role: 'Product Designer & Web Developer',
      timeline: 'Commercial Launch',
      challenge:
        'Bridging direct wholesale pricing for contractors with guided application packages for residential buyers without creating a cluttered catalog.',
      solution:
        'Structured a dual-mode storefront separating DIY wholesale discounts from full-service labour packages, paired with live branch coverage and order tracking.',
      deliverables: [
        'Dual-Mode DIY & Service Commerce Flow',
        'Live Rate Sheet & Bulk Estimate Calculator',
        'Branch Locator & Order Tracking Portal',
      ],
      outcome:
        'Established a flagship digital presence for Karachi’s trusted paint supplier, streamlining quote requests and direct storefront orders.',
    },
  },
  {
    id: 'titan-build-group',
    titleLead: 'Titan Build ',
    titleAccent: 'Group',
    title: 'Titan Build Group',
    category: 'Real Estate & Construction',
    clientType: 'Commercial Enterprise',
    description:
      'An industrial-grade digital flagship for a national heavy civil and commercial contractor executing landmark skyscrapers, transit corridors, and energy infrastructure.',
    image: mediaUrl('projects/showcase/titanimage_5ac946b7.png', '/assets/aistudio/titanimage_5ac946b7.png'),
    imageAlt: 'Titan Build Group commercial construction enterprise website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://titan-build-group.vercel.app',
    caseStudy: {
      role: 'UI Architect & Frontend Engineer',
      timeline: 'Enterprise Showcase',
      challenge:
        'Conveying 50+ years of heavy engineering authority and 500+ delivered mega-projects with precision rather than generic corporate templates.',
      solution:
        'Built an architectural blueprint aesthetic featuring structural safety metrics, CAD crosshair inspection overlays, and structured RFP proposal routing.',
      deliverables: [
        'Blueprint Grid & CAD Crosshair Overlay System',
        'Interactive Project & Safety Metrics Showcase',
        'Proposal & Pre-Qualification Intake Flow',
      ],
      outcome:
        'Delivered a commanding enterprise web experience tailored for institutional developers and municipal procurement teams.',
    },
  },
  {
    id: 'halden-apparel',
    titleLead: 'Halden ',
    titleAccent: 'Apparel',
    title: 'Halden Apparel & Goods',
    category: 'Minimalist E-Commerce Storefront',
    clientType: 'E-Commerce Boutique',
    description:
      'An editorial fashion commerce experience crafted around heavyweight essentials, clean split-screen merchandising, and tactile lookbook pacing.',
    image: mediaUrl('projects/showcase/haldenimage_630a0bc1.png', '/assets/aistudio/haldenimage_630a0bc1.png'),
    imageAlt: 'Halden Apparel and Goods minimalist e-commerce storefront screenshot',
    techStack: [
      { id: 'nextjs', label: 'Next.js' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://halden-e-commerce.vercel.app',
    caseStudy: {
      role: 'Frontend Engineer & Brand Designer',
      timeline: 'Boutique Storefront',
      challenge:
        'Balancing editorial restraint and high-fashion typography with effortless product discovery and fast cart interactions.',
      solution:
        'Created a crisp grid-ruled ivory and charcoal layout with seasonal collection framing, rapid category filtering, and streamlined bag drawer states.',
      deliverables: [
        'Editorial Split-Screen Storefront Layout',
        'Collection Filtering & Variant Selector',
        'Minimalist Shopping Bag & Wishlist UX',
      ],
      outcome:
        'Positioned the brand with refined European boutique sensibility and distraction-free product browsing.',
    },
  },
  {
    id: 'northridge-advisors',
    titleLead: 'Northridge ',
    titleAccent: 'Advisors',
    title: 'Northridge Advisors',
    category: 'Business & Finance',
    clientType: 'Advisory & Fractional CFO',
    description:
      'A high-trust financial advisory platform pairing executive typography with an interactive tax liability calculator and live client portal preview.',
    image: mediaUrl('projects/showcase/northbridgeimage_815c17d4.png', '/assets/aistudio/northbridgeimage_815c17d4.png'),
    imageAlt: 'Northridge Advisors financial advisory and tax planning website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'vite', label: 'Vite' },
    ],
    liveUrl: 'https://northridge-advisors.vercel.app',
    caseStudy: {
      role: 'Product Designer & Frontend Developer',
      timeline: 'Advisory Platform',
      challenge:
        'Transforming complex corporate tax planning and fractional CFO offerings into an authoritative, scannable digital client experience.',
      solution:
        'Paired classical editorial serifs with a dark obsidian Client Portal Quickview widget showcasing projected tax savings and compliance telemetry.',
      deliverables: [
        'Interactive Tax Liability Estimator',
        'Client Portal Quickview Interface',
        'Consultation Scheduling & Advisory Insights',
      ],
      outcome:
        'Elevated firm credibility with a bespoke executive aesthetic tailored to mid-market founders and CFOs.',
    },
  },
  {
    id: 'apex-legal-partners',
    titleLead: 'Apex Legal ',
    titleAccent: 'Partners',
    title: 'Apex Legal Partners',
    category: 'Legal & Corporate Law',
    clientType: 'Corporate Law Practice',
    description:
      'An authoritative corporate law and litigation platform spotlighting senior partners, cross-border practice areas, and landmark case results.',
    image: mediaUrl('projects/showcase/lawfirmimage_c2131f31.png', '/assets/aistudio/lawfirmimage_c2131f31.png'),
    imageAlt: 'Apex Legal Partners corporate law firm attorney spotlight screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://law-firm-mu-umber.vercel.app',
    caseStudy: {
      role: 'UI Designer & Frontend Engineer',
      timeline: 'Corporate Practice Site',
      challenge:
        'Presenting a 25-attorney roster and deep M&A litigation credentials in a refined editorial layout that feels personal yet institutional.',
      solution:
        'Engineered a deep navy and antique-gold editorial system with structured partner cards, jurisdictional tags, and practice area routing.',
      deliverables: [
        'Attorney Directory & Partner Spotlight Grid',
        'Practice Area & Case Result Architecture',
        'Confidential Consultation Booking Flow',
      ],
      outcome:
        'Delivered a calm, high-gravitas legal digital flagship built for enterprise counsel inquiries.',
    },
  },
  {
    id: 'solara-retreat',
    titleLead: 'Solara ',
    titleAccent: 'Retreat',
    title: 'Solara Retreat Sanctuary',
    category: 'Hospitality & Eco-Resort',
    clientType: 'Wellness & Spa Sanctuary',
    description:
      'A serene wellness and eco-resort booking experience crafted with organic earthy tones, botanical storytelling, and restorative suite reservations.',
    image: mediaUrl('projects/showcase/solaraimage_34c53c76.png', '/assets/aistudio/solaraimage_34c53c76.png'),
    imageAlt: 'Solara Retreat Sanctuary wellness resort website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
      { id: 'vite', label: 'Vite' },
    ],
    liveUrl: 'https://solara-retreat.vercel.app',
    caseStudy: {
      role: 'Creative Technologist & UI Designer',
      timeline: 'Hospitality Showcase',
      challenge:
        'Translating the quiet sensory calm of geothermal springs and forest suites into an interactive web experience without visual noise.',
      solution:
        'Composed warm alabaster surfaces, sage-olive accents, and gentle transition pacing around curated sanctuary highlights and retreat packages.',
      deliverables: [
        'Sanctuary Highlight Media Carousel',
        'Spa Treatment & Package Explorer',
        'Retreat Experience Reservation Modal',
      ],
      outcome:
        'Created a tranquil digital sanctuary that guides guests smoothly from inspiration to suite reservation.',
    },
  },
  {
    id: 'luxora-dental',
    titleLead: 'Luxora ',
    titleAccent: 'Dental',
    title: 'Luxora Cosmetic Dental Clinic',
    category: 'Healthcare & Dental Clinic',
    clientType: 'Luxury Cosmetic Dentistry',
    description:
      'A clinical-luxury healthcare platform for an international cosmetic dental practice spanning Dubai DIFC, London Harley Street, and NYC Park Avenue.',
    image: mediaUrl('projects/showcase/luxoraimage_f0683be1.png', '/assets/aistudio/luxoraimage_f0683be1.png'),
    imageAlt: 'Luxora Cosmetic Dental Clinic hero interface screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://luxora-dental.vercel.app',
    caseStudy: {
      role: 'Lead UI Designer & Frontend Developer',
      timeline: 'Multi-City Clinic Platform',
      challenge:
        'Reassuring high-net-worth patients seeking complex reconstructive care while keeping appointment booking effortless.',
      solution:
        'Paired refined serif headlines and verified clinical outcomes (15,000+ patients, 98% satisfaction) with immediate portal and booking CTAs.',
      deliverables: [
        'Multi-Location Clinic & Emergency Header',
        'Treatment & Clinical Excellence Showcase',
        'Patient Portal & Appointment Flow',
      ],
      outcome:
        'Established a quiet-luxury clinical identity balancing warmth, medical credibility, and fast booking conversion.',
    },
  },
  {
    id: 'nomadly-travels',
    titleLead: 'Nomadly ',
    titleAccent: 'Travels',
    title: 'Nomadly Travels',
    category: 'Hospitality & Adventure Travel',
    clientType: 'Travel Discovery Platform',
    description:
      'A vibrant destination marketplace empowering travelers to filter 100+ global escapes by travel vibe, daily budget, climate, and curated itineraries.',
    image: mediaUrl('projects/showcase/nomadlyimage_2c0800f2.png', '/assets/aistudio/nomadlyimage_2c0800f2.png'),
    imageAlt: 'Nomadly Travels destination marketplace screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'nodejs', label: 'Node.js' },
    ],
    liveUrl: 'https://nomadly-travels.vercel.app',
    caseStudy: {
      role: 'Full-Stack UI Engineer',
      timeline: 'Travel Marketplace',
      challenge:
        'Helping travelers narrow down 100+ destinations rapidly by mood, group size, and estimated daily spend without overwhelming search forms.',
      solution:
        'Built an instant vibe-filter bar, multi-field pill search header, and live daily-cost destination cards with saved-trip state.',
      deliverables: [
        'Multi-Faceted Destination Search & Vibe Filters',
        'Daily Budget Estimator & Saved Trips State',
        'Interactive Destination Detail Drawers',
      ],
      outcome:
        'Turned complex trip discovery into an engaging, fast-filtering marketplace experience.',
    },
  },
  {
    id: 'azure-cove-resort',
    titleLead: 'Azure ',
    titleAccent: 'Cove',
    title: 'Azure Cove Oceanfront Resort',
    category: 'Luxury Resort & Marina Club',
    clientType: 'Coastal Villa Sanctuary',
    description:
      'An oceanfront resort and private villa booking experience combining panoramic coastal storytelling with an integrated availability bar.',
    image: mediaUrl('projects/showcase/azureimage_f1145417.png', '/assets/aistudio/azureimage_f1145417.png'),
    imageAlt: 'Azure Cove Oceanfront Resort coastal sanctuary website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://azure-cove-resort.vercel.app',
    caseStudy: {
      role: 'Frontend Architect & Visual Designer',
      timeline: 'Resort Booking Experience',
      challenge:
        'Capturing the serenity of an overwater coral lagoon while keeping check-in dates, guest counts, and villa styles immediately actionable above the fold.',
      solution:
        'Anchored a full-bleed atmospheric ocean hero with an anchored floating availability bar and multi-currency header controls.',
      deliverables: [
        'Full-Bleed Coastal Hero & Availability Bar',
        'Overwater & Oceanfront Villa Explorer',
        'Multi-Currency & Concierge Stay Booking',
      ],
      outcome:
        'Delivered an inviting coastal resort showcase optimizing direct villa availability checks.',
    },
  },
  {
    id: 'laura-gastronomy',
    titleLead: "L'Aura ",
    titleAccent: 'Gastronomy',
    title: "L'Aura Gastronomy & Bar",
    category: 'Artisanal Dining & Restaurant',
    clientType: 'Wood-Fired Gastronomy',
    description:
      'An atmospheric culinary showcase for a London wood-fired hearth restaurant, celebrating seasonal provenance, chef’s table dining, and open-flame craft.',
    image: mediaUrl('projects/showcase/restrauntfiveimage_455f2ebd.png', '/assets/aistudio/restrauntfiveimage_455f2ebd.png'),
    imageAlt: "L'Aura Gastronomy and Bar wood-fired restaurant website screenshot",
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
      { id: 'vite', label: 'Vite' },
    ],
    liveUrl: 'https://resturant-five-gamma.vercel.app',
    caseStudy: {
      role: 'Creative Frontend Developer',
      timeline: 'Fine Dining Showcase',
      challenge:
        'Conveying the sensory warmth and artisanal ingredient focus of an open-flame kitchen in a dark editorial web format.',
      solution:
        'Balanced rich produce photography with crisp copper-gold accents, refined serif display typography, and seamless table reservation access.',
      deliverables: [
        'Atmospheric Scroll-Driven Culinary Story',
        'Seasonal Tasting Menu & Chef’s Table Pages',
        'Instant Table Reservation Integration',
      ],
      outcome:
        'Crafted an intimate dining presence highlighting culinary craft from first scroll to booking.',
    },
  },
  {
    id: 'artisan-woodcraft',
    titleLead: 'Artisan ',
    titleAccent: 'Woodcraft',
    title: 'Artisan Woodcraft & Furnishings',
    category: 'Furniture & Retail',
    clientType: 'Bespoke Timber Atelier',
    description:
      'A tactile furniture showroom built around architectural bedroom suites and solid-timber centerpieces designed for direct showroom consultation.',
    image: mediaUrl('projects/showcase/furnitureimage_13f5cffb.png', '/assets/aistudio/furnitureimage_13f5cffb.png'),
    imageAlt: 'Artisan Woodcraft and Furnishings showroom website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'vite', label: 'Vite' },
    ],
    liveUrl: 'https://furniture-showcase-brown.vercel.app',
    caseStudy: {
      role: 'UI Designer & Frontend Engineer',
      timeline: 'Bespoke Showroom',
      challenge:
        'Driving high-intent showroom visits and WhatsApp consultations for custom-carved bedroom and living collections.',
      solution:
        'Led with full-bleed warm interior photography, high-contrast serif headlines, and zero-friction WhatsApp concierge routing.',
      deliverables: [
        'Full-Bleed Showroom Hero & Craft Narrative',
        'Bespoke Timber Catalog & Material Specs',
        'Direct WhatsApp Concierge Inquiry Flow',
      ],
      outcome:
        'Bridged digital discovery with personal showroom appointments for custom furniture buyers.',
    },
  },
  {
    id: 'haven-luxury-real-estate',
    titleLead: 'Haven ',
    titleAccent: 'Estates',
    title: 'Haven Luxury Real Estate',
    category: 'Luxury Real Estate & Residences',
    clientType: 'Ultra-Prime Properties',
    description:
      'An ultra-prime real estate showcase presenting trophy penthouses, architectural villas, and bespoke estate search filters with understated dark elegance.',
    image: mediaUrl('projects/showcase/realstateimage_55be6a22.png', '/assets/aistudio/realstateimage_55be6a22.png'),
    imageAlt: 'Haven Luxury Real Estate ultra-prime residences website screenshot',
    techStack: [
      { id: 'nextjs', label: 'Next.js' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'postgres', label: 'PostgreSQL' },
    ],
    liveUrl: 'https://real-state-peach-beta.vercel.app',
    caseStudy: {
      role: 'Product Designer & Full-Stack Developer',
      timeline: 'Luxury Brokerage Platform',
      challenge:
        'Presenting multi-million-dollar architectural residences with gallery-grade restraint while offering granular estate filtering.',
      solution:
        'Combined obsidian-and-champagne gold visual framing with an anchored bespoke search filter bar for location, bedrooms, and valuation cap.',
      deliverables: [
        'Bespoke Estate Search & Valuation Filter',
        'Architectural Residence Portfolio Views',
        'Private Viewing & Agent Consultation Flow',
      ],
      outcome:
        'Delivered an elevated brokerage platform worthy of ultra-prime architectural listings.',
    },
  },
  {
    id: 'studio-nordic-furnishings',
    titleLead: 'Studio ',
    titleAccent: 'Nordic',
    title: 'Studio Nordic Furnishings',
    category: 'Scandinavian Furniture & Retail',
    clientType: 'Architectural Atelier',
    description:
      'An architectural furniture studio showcase highlighting sustainably aged solid timber, quiet geometry, and limited seasonal atelier releases.',
    image: mediaUrl('projects/showcase/furniturenewimage_ac7f5aa8.png', '/assets/aistudio/furniturenewimage_ac7f5aa8.png'),
    imageAlt: 'Studio Nordic Furnishings architectural furniture studio website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://furniture-new-ten.vercel.app',
    caseStudy: {
      role: 'Design Engineer',
      timeline: 'Atelier Collection Release',
      challenge:
        'Showcasing limited-run architectural timber pieces with calm editorial pacing and studio appointment booking.',
      solution:
        'Crafted warm cream headers, terracotta focal CTAs, and numbered studio release blocks reflecting physical joinery craftsmanship.',
      deliverables: [
        'Limited Atelier Release Presentation',
        'Material & Joinery Craft Storytelling',
        'Private Studio Visit Reservation',
      ],
      outcome:
        'Captured the quiet restorative aesthetic of modern solid-timber interiors across desktop and mobile.',
    },
  },
  {
    id: 'ironpulse-performance-gym',
    titleLead: 'IronPulse ',
    titleAccent: 'Athletic',
    title: 'IronPulse Performance Gym',
    category: 'Fitness & Athletic Center',
    clientType: 'High-Output Training Club',
    description:
      'A high-intensity athletic club platform featuring brutalist grid typography, live facility occupancy telemetry, and multi-location program scheduling.',
    image: mediaUrl('projects/showcase/gymmureximage_c36c0798.png', '/assets/aistudio/gymmureximage_c36c0798.png'),
    imageAlt: 'IronPulse Performance Gym athletic facility website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://gym-eight-murex-73.vercel.app',
    caseStudy: {
      role: 'Frontend Engineer & Motion Designer',
      timeline: 'Multi-Location Club Platform',
      challenge:
        'Injecting raw kinetic energy and industrial discipline into an athletic club website while keeping class timetables and membership clear.',
      solution:
        'Built an obsidian structural grid with condensed brutalist display type, high-visibility acid-lime accents, and a live network metrics module.',
      deliverables: [
        'Brutalist Typographic Hero & Grid System',
        'Live Facility & Session Metrics Module',
        'Programs, Coaches & Membership Timetable',
      ],
      outcome:
        'Created an unmistakable high-output athletic digital identity built to convert serious members.',
    },
  },
  {
    id: 'vector-cinematic-studios',
    titleLead: 'Vector ',
    titleAccent: 'Studios',
    title: 'Vector Cinematic Studios',
    category: 'Media & Film Production',
    clientType: 'Editorial Launch & Motion',
    description:
      'A bold, editorial product-storytelling showcase uniting kinetic oversized typography, sculptural product staging, and scroll-paced narrative beats.',
    image: mediaUrl('projects/showcase/vectorimage_565823d7.png', '/assets/aistudio/vectorimage_565823d7.png'),
    imageAlt: 'Vector Cinematic Studios editorial showcase website screenshot',
    techStack: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind' },
      { id: 'motion', label: 'Motion' },
    ],
    liveUrl: 'https://vector-cinematic-story.vercel.app',
    caseStudy: {
      role: 'Creative Developer',
      timeline: 'Interactive Launch Story',
      challenge:
        'Turning a signature footwear and motion launch into a museum-grade interactive lookbook with dramatic depth and restraint.',
      solution:
        'Layered monumental condensed typography behind and in front of hero studio photography with razor-sharp section progression.',
      deliverables: [
        'Layered Kinetic Typography Hero',
        'Scroll-Paced Lookbook & Craft Sections',
        'Direct Edition Ordering Experience',
      ],
      outcome:
        'Demonstrated flagship creative direction combining editorial discipline with fluid web animation.',
    },
  },
];
