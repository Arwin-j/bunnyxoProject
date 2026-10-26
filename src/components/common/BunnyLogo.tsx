import React from 'react';

interface BunnyLogoProps {
  className?: string;
}

export const BunnyLogo: React.FC<BunnyLogoProps> = ({
  className = 'bob h-5 sm:h-6 w-auto shrink-0 select-none object-contain',
}) => {
  return (
    <img
      src="/bunny-logo.webp"
      alt="Bunny Squad Logo"
      aria-hidden="true"
      className={className}
    />
  );
};
