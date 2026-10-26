import { HeartopiaEvent } from '../types/event';

export function getInitialSampleEvents(): HeartopiaEvent[] {
  const now = Date.now();
  const ONE_HOUR = 3600 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  const toIso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

  return [
    {
      id: '1e8a937a-49cf-4ef8-a5f1-01b3ad852e01',
      title: 'Cozy Friday Picnic',
      platform: 'heartopia',
      location: 'Blossom Meadow',
      starts_at: toIso(-2 * ONE_HOUR), // Started 2 hours ago -> Currently Live
      ends_at: toIso(4 * ONE_HOUR),    // Ends in 4 hours
      details: 'Bring snacks, wear your comfiest outfit and hang out by the lake.',
      prize: 'Strawberry Basket Decor',
      image_url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=600&auto=format&fit=crop&q=80',
      visibility: 'published',
      source: 'manual',
      updated_at: new Date(now - ONE_DAY).toISOString(),
    },
    {
      id: '1f9b848b-59df-4fa2-b6f2-02c4be963f02',
      title: 'Lofi Voice & Sketch Hangout',
      platform: 'discord',
      location: 'Voice lounge',
      starts_at: toIso(-1.5 * ONE_HOUR), // Started 1.5 hours ago -> Currently Live
      ends_at: toIso(3.5 * ONE_HOUR),
      details: 'Chilling in the voice lounge listening to relaxing lofi beats, sketching cozy art, and hanging out with the community.',
      prize: 'Artist Bunny Role',
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      visibility: 'published',
      source: 'manual',
      updated_at: new Date(now - ONE_DAY).toISOString(),
    },
    {
      id: '1d7a737c-68ef-4eb3-c7e3-03d5cf854e03',
      title: 'Floating Garden Bloom Fest',
      platform: 'petit_planet',
      location: 'Floating Observatory',
      starts_at: toIso(-45 * 60 * 1000), // Started 45 mins ago -> Currently Live
      ends_at: toIso(2.5 * ONE_HOUR),
      details: 'Special flower bloom festival on the floating observatory! Harvest glowing petals with fellow planet keepers.',
      prize: 'Celestial Petal Crown',
      image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80',
      visibility: 'published',
      source: 'manual',
      updated_at: new Date(now - ONE_DAY).toISOString(),
    },
    {
      id: '2d7c826b-38be-4de7-94e0-f0a2bc741d02',
      title: 'Discord Movie Night',
      platform: 'discord',
      location: '#cozy-cinema',
      starts_at: toIso(27 * ONE_HOUR), // Tomorrow evening
      ends_at: toIso(30 * ONE_HOUR),
      details: 'Watching a Ghibli classic together with voice chat.',
      prize: null,
      image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
      visibility: 'published',
      source: 'manual',
      updated_at: new Date(now - ONE_DAY).toISOString(),
    },
    {
      id: '3c6b715a-27ad-4cd6-83df-e091ab630c03',
      title: 'Planet Garden Contest',
      platform: 'petit_planet',
      location: 'Moonpetal Plaza',
      starts_at: toIso(3 * ONE_DAY), // In 3 days
      ends_at: toIso(4 * ONE_DAY),
      details: 'Show off your prettiest little planet garden and vote on entries.',
      prize: 'Star Seed Pack',
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
      visibility: 'published',
      source: 'manual',
      updated_at: new Date(now - ONE_DAY).toISOString(),
    },
    {
      id: '4b5a6049-169c-4bc5-72ce-d0809a52fb04',
      title: 'Loftia Room Tour',
      platform: 'loftia',
      location: 'Community Loft #3',
      starts_at: toIso(6 * ONE_DAY), // In 6 days
      ends_at: toIso(6 * ONE_DAY + 2.5 * ONE_HOUR),
      details: "Visit each other's rooms and vote for the coziest atmosphere.",
      prize: 'Golden Teacup',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
      visibility: 'published',
      source: 'manual',
      updated_at: new Date(now - ONE_DAY).toISOString(),
    },
    {
      id: '5a495f38-058b-4ab4-61bd-c07f8941ea05',
      title: 'Berry Picking Party',
      platform: 'heartopia',
      location: 'Blueberry Hills',
      starts_at: toIso(-3 * ONE_DAY), // 3 days ago -> Ended
      ends_at: toIso(-2.5 * ONE_DAY),
      details: 'Finished — thanks for coming and harvesting with us!',
      prize: null,
      image_url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&auto=format&fit=crop&q=80',
      visibility: 'published',
      source: 'manual',
      updated_at: new Date(now - 3 * ONE_DAY).toISOString(),
    },
    {
      id: '6f384e27-f47a-49a3-50ac-b06e7830d906',
      title: 'Secret Tea Party (Draft)',
      platform: 'heartopia',
      location: 'Forest',
      starts_at: toIso(5 * ONE_DAY),
      ends_at: toIso(5 * ONE_DAY + 3 * ONE_HOUR),
      details: 'Upcoming private tea tasting and secret recipe crafting.',
      prize: 'Matcha Teapot',
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      visibility: 'draft',
      source: 'manual',
      updated_at: new Date(now).toISOString(),
    },
  ];
}
