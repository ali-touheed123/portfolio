import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { MyWorkPage } from '../watchStrap/pages/MyWorkPage';

interface AllProjectsPageProps {
  onBack?: () => void;
}

export const AllProjectsPage: React.FC<AllProjectsPageProps> = ({ onBack }) => {
  return (
    <div className="relative w-full h-full">
      {onBack && (
        <button
          onClick={onBack}
          type="button"
          aria-label="Back to portfolio"
          className="fixed top-3 left-4 md:top-4 md:left-6 z-50 group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1.5 text-xs font-mono font-semibold tracking-wider text-zinc-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-lg backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:-translate-x-1 group-hover:text-white transition-transform" />
          <span>BACK</span>
        </button>
      )}
      <MyWorkPage />
    </div>
  );
};
