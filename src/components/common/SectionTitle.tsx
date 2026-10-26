import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, className = '' }) => {
  return (
    <h2
      className={`mb-4 inline-block -rotate-[1.5deg] rounded-full border-[3px] bg-butter px-5 py-0.5 text-2xl font-semibold ${className}`}
    >
      {children}
    </h2>
  );
};
