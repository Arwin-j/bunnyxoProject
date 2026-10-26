import React from 'react';
import { EventPlatform, PLATFORM_CONFIG } from '../../types/event';

interface PlatformChipProps {
  platform: EventPlatform;
  className?: string;
}

export const PlatformChip: React.FC<PlatformChipProps> = ({ platform, className = '' }) => {
  const config = PLATFORM_CONFIG[platform] || {
    emoji: '🎮',
    label: platform,
    bgClass: 'bg-accent',
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border-2 px-2.5 text-sm font-semibold ${config.bgClass} ${className}`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
};
