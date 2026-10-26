import React, { useState } from 'react';
import { useRedemptionCodes, RedemptionCode } from '../hooks/useRedemptionCodes';

export const RedemptionCodesPage: React.FC = () => {
  const { activeCodes, historyCodes } = useRedemptionCodes();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopyCode = async (id: string, code: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredActive = activeCodes.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rewards.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = historyCodes.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rewards.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
      {/* Hero Banner (Comfy Light Green Theme) */}
      <section className="codes-page-hero">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl select-none" aria-hidden="true">🎁</span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
                Redemption Codes
              </h1>
              <span className="text-2xl select-none" title="Comfy Tulip Theme">🌷</span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#166534] font-sans">
              Copy and redeem these free gift codes in Heartopia for stars, outfits, and special items!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-foreground bg-[#bbf7d0] px-4 py-1.5 text-xs sm:text-sm font-bold text-foreground shadow-xs">
              ✨ {activeCodes.length} Active Codes
            </span>
            {historyCodes.length > 0 && (
              <span className="rounded-full border-2 border-[#dc2626] bg-[#fef2f2] px-3 py-1.5 text-xs sm:text-sm font-bold text-[#dc2626] shadow-xs">
                📜 {historyCodes.length} Expired
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-[#15803d]/30 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or reward..."
              className="w-full rounded-full border-2 border-foreground bg-white px-4 py-1.5 pl-9 font-sans font-bold text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#15803d] shadow-xs"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">
              🔍
            </span>
          </div>

          <span className="text-xs font-bold text-[#166534] font-sans">
            Tip: Click any code box or copy button to copy directly!
          </span>
        </div>
      </section>

      {/* 1. Active Codes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">✨</span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Active Codes
            </h2>
            <span className="rounded-full border-2 border-foreground bg-[#bbf7d0] px-2.5 py-0.5 text-xs font-bold text-foreground">
              {filteredActive.length}
            </span>
          </div>
        </div>

        {filteredActive.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-foreground/30 bg-[#f0fdf4] p-8 text-center space-y-2">
            <p className="text-base font-bold text-foreground font-sans">
              No matching active codes found for "{searchQuery}"
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-full border-2 border-foreground bg-[#bbf7d0] px-4 py-1 text-xs font-bold text-foreground shadow-xs hover:bg-[#86efac] transition-all cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="codes-grid">
            {filteredActive.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div key={item.id} className="code-card">
                  {/* Top Header: Gift Icon + Status Pill */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      {/* Small Gift Icon inside the box */}
                      <div className="code-badge-gift" title="Gift Box">
                        <span>🎁</span>
                      </div>

                      <span className="rounded-full border border-foreground/30 bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-bold font-sans text-[#166534]">
                        ● Active
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="mt-3 text-lg font-bold text-foreground font-sans tracking-tight">
                      {item.title}
                    </h3>

                    {/* Rewards Summary */}
                    {item.rewards && (
                      <p className="mt-1 text-xs font-medium text-foreground/80 font-sans line-clamp-2">
                        🎁 {item.rewards}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Code Pill (Copyable) + Expiry Date */}
                  <div className="space-y-2 pt-3 border-t-2 border-dashed border-foreground/15">
                    {/* The Code Pill Box */}
                    <div
                      onClick={() => handleCopyCode(item.id, item.code)}
                      title="Click to copy code"
                      className="code-pill-box group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground select-none font-bold uppercase tracking-wider font-mono">
                          CODE:
                        </span>
                        <code className="font-mono font-bold text-sm sm:text-base text-foreground tracking-wider truncate">
                          {item.code}
                        </code>
                      </div>

                      {/* Small Copy Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(item.id, item.code);
                        }}
                        aria-label={`Copy ${item.code}`}
                        className={`shrink-0 flex items-center gap-1 rounded-full border-1.5 border-foreground px-2.5 py-1 text-xs font-bold font-sans transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-[#15803d] text-white shadow-xs'
                            : 'bg-[#bbf7d0] text-foreground hover:bg-[#86efac] active:translate-y-0.5'
                        }`}
                      >
                        <span>{isCopied ? '✅' : '📋'}</span>
                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Expiry Date under the code */}
                    <div className="flex items-center justify-between text-[11px] font-bold font-sans text-[#166534] px-1">
                      <span className="flex items-center gap-1">
                        <span>⏳</span>
                        <span>Expires: {item.expiry}</span>
                      </span>
                      {isCopied && (
                        <span className="text-[#15803d] animate-pulse">
                          Ready to paste in-game!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. History Codes Section (Under the codes: pill shaped, red bordered cards, strike on the code in red) */}
      <section className="space-y-4 pt-4 border-t-3 border-dashed border-foreground/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">📜</span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                <span>History Codes</span>
                <span className="rounded-full border-2 border-[#dc2626] bg-[#fef2f2] px-2.5 py-0.5 text-xs font-bold text-[#dc2626]">
                  Expired ({filteredHistory.length})
                </span>
              </h2>
              <p className="text-xs font-medium text-muted-foreground font-sans">
                Past redemption codes that have reached their expiration date.
              </p>
            </div>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-[#dc2626]/40 bg-[#fef2f2]/60 p-6 text-center">
            <p className="text-sm font-bold text-muted-foreground font-sans">
              No expired codes in history.
            </p>
          </div>
        ) : (
          <div className="history-codes-grid">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="history-code-square"
                title={`${item.title} - ${item.code}`}
              >
                <h3 className="font-sans font-bold text-xs sm:text-sm text-foreground text-center line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <span className="rounded-full bg-[#fef2f2] border border-[#dc2626]/40 px-3 py-0.5 history-code-strike text-xs font-mono font-bold text-[#b91c1c] text-center tracking-wider">
                  {item.code}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. How to Redeem Guide */}
      <section className="rounded-[24px] border-[3px] border-foreground bg-[#dcfce7] p-5 sm:p-6 shadow-[4px_4px_0_0_#15803d] space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h2 className="text-lg font-bold text-foreground font-sans">
            How to Redeem Codes in Heartopia
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="rounded-2xl border-2 border-foreground/40 bg-white/80 p-3 shadow-xs">
            <span className="block font-mono text-xs font-bold text-[#15803d]">STEP 1</span>
            <p className="mt-0.5 text-xs font-bold text-foreground font-sans">
              Open Heartopia and tap your <strong>Avatar / Settings ⚙️</strong> in the corner.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-foreground/40 bg-white/80 p-3 shadow-xs">
            <span className="block font-mono text-xs font-bold text-[#15803d]">STEP 2</span>
            <p className="mt-0.5 text-xs font-bold text-foreground font-sans">
              Navigate to the <strong>Account</strong> or <strong>System</strong> tab.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-foreground/40 bg-white/80 p-3 shadow-xs">
            <span className="block font-mono text-xs font-bold text-[#15803d]">STEP 3</span>
            <p className="mt-0.5 text-xs font-bold text-foreground font-sans">
              Tap <strong>Redeem Code</strong> and paste your copied gift code.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-foreground/40 bg-white/80 p-3 shadow-xs">
            <span className="block font-mono text-xs font-bold text-[#15803d]">STEP 4</span>
            <p className="mt-0.5 text-xs font-bold text-foreground font-sans">
              Check your in-game <strong>Mailbox 📬</strong> to claim your rewards!
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RedemptionCodesPage;
