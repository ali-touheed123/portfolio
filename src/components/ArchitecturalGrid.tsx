import React from 'react';

/**
 * Full-page Swiss architectural column grid inspired by Evermark Global.
 * Renders hairline structural rhythm across desktop viewports.
 */
export const ArchitecturalGrid: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 max-w-7xl mx-auto px-4 sm:px-8 lg:px-14"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 h-full border-x border-slate-900/4.5 dark:border-white/4">
        <div className="border-r border-slate-900/4.5 dark:border-white/4" />
        <div className="hidden md:block border-r border-slate-900/4.5 dark:border-white/4" />
        <div className="hidden md:block border-r border-slate-900/4.5 dark:border-white/4" />
        <div />
      </div>
    </div>
  );
};
