import React from 'react';

interface PlaceholderPageProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  emoji,
  title,
  subtitle = "Coming soon — we're stitching it together 🧵",
}) => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="sticker shadow-berry rounded-[32px_40px_28px_44px] p-10 text-center">
        <div className="text-6xl" aria-hidden="true">
          {emoji}
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>
    </main>
  );
};
