import React from 'react';
import { MyWorkPage } from '../watchStrap/pages/MyWorkPage';

interface AllProjectsPageProps {
  onBack?: () => void;
}

export const AllProjectsPage: React.FC<AllProjectsPageProps> = ({ onBack }) => {
  return (
    <div className="relative w-full min-h-dvh">
      <MyWorkPage onBack={onBack} />
    </div>
  );
};
