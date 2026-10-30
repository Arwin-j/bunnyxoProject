import { useState, useEffect } from 'react';

// Bunny Squad Official Guild ID: 1481145928311115840 (linked to invite 9CNHMrX6A)
const DISCORD_WIDGET_API = 'https://discord.com/api/guilds/1481145928311115840/widget.json';

export function useDiscordPresence() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [serverName, setServerName] = useState<string>('Bunny xo');

  useEffect(() => {
    let isMounted = true;

    const fetchOnline = async () => {
      try {
        const res = await fetch(DISCORD_WIDGET_API);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (typeof data.presence_count === 'number') {
              setOnlineCount(data.presence_count);
            }
            if (data.name) {
              setServerName(data.name);
            }
          }
        }
      } catch {
        // Ignore network / CORS errors gracefully
      }
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 60_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { onlineCount, serverName };
}
