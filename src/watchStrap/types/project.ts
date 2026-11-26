export type TechId =
  | 'react'
  | 'typescript'
  | 'tailwind'
  | 'nextjs'
  | 'supabase'
  | 'postgres'
  | 'motion'
  | 'nodejs'
  | 'vite';

export interface TechItem {
  id: TechId;
  label: string;
}

export interface ProjectCaseStudy {
  role: string;
  timeline: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  outcome: string;
}

export interface Project {
  id: string;
  /** Primary white portion of the display title */
  titleLead: string;
  /** Highlighted orange accent portion of the display title */
  titleAccent: string;
  /** Full plain-text title for accessibility and metadata */
  title: string;
  category: string;
  clientType: string;
  description: string;
  /** Path to screenshot in /public/assets/... or external URL */
  image: string;
  imageAlt: string;
  techStack: TechItem[];
  liveUrl: string;
  caseStudy: ProjectCaseStudy;
}
