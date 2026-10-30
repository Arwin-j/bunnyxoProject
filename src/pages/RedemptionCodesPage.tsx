import React, { useState } from 'react';
import { useRedemptionCodes } from '../hooks/useRedemptionCodes';

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
    <main className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-6 antialiased selection:bg-[#b23a6b] selection:text-white">
      {/* Hero Banner (V2 Warm Gradient) */}
      <section className="codes-page-hero">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl select-none" aria-hidden="true">🎁</span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#b23a6b] font-heading">
                Redemption Codes
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-[#6b4f35] font-sans">
              Copy and redeem these free gift codes in Heartopia for stars, outfits, and special items!
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f3ecda] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#6b4f35] shadow-xs">
              ✨ {activeCodes.length} Active Codes
            </span>
            {historyCodes.length > 0 && (
              <span className="rounded-full bg-[#f9f4e6] px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#8c6f55] shadow-xs">
                📜 {historyCodes.length} Expired
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 pt-4 border-t border-[#e9b3ad]/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or reward..."
              className="w-full rounded-full border border-[#e9b3ad] bg-[#f9f4e6] px-4 py-2 pl-9 font-sans font-medium text-xs sm:text-sm text-[#6b4f35] placeholder:text-[#8c6f55]/70 focus:outline-none focus:ring-2 focus:ring-[#b23a6b] shadow-xs"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">
              🔍
            </span>
          </div>

          <span className="text-xs font-bold text-[#6e7a3c] font-sans">
            Tip: Click any code box or copy button to copy directly!
          </span>
        </div>
      </section>

      {/* 1. Active Codes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">✨</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#7a5638] font-serif">
              Active Codes
            </h2>
            <span className="tag-v2 shrink-0">
              {filteredActive.length}
            </span>
          </div>
        </div>

        {filteredActive.length === 0 ? (
          <div className="rounded-[24px] bg-[#f3ecda] p-8 text-center space-y-2">
            <p className="text-base font-bold text-[#6b4f35] font-sans">
              No matching active codes found for "{searchQuery}"
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-v2 btn-v2-olive text-xs"
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
                      <div className="code-badge-gift" title="Gift Box">
                        <span>🎁</span>
                      </div>

                      <span className="tag-v2" style={{ background: '#d9e0b4', color: '#6e7a3c' }}>
                        ● Active
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="mt-3 text-lg font-bold text-[#7a5638] font-heading tracking-tight">
                      {item.title}
                    </h3>

                    {/* Rewards Summary */}
                    {item.rewards && (
                      <p className="mt-1 text-xs font-medium text-[#6b4f35] font-sans line-clamp-2">
                        🎁 {item.rewards}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Code Pill (Copyable) + Expiry Date */}
                  <div className="space-y-2 pt-3 border-t border-[#e9b3ad]/40">
                    {/* The Code Pill Box */}
                    <div
                      onClick={() => handleCopyCode(item.id, item.code)}
                      title="Click to copy code"
                      className="code-pill-box group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-[#8c6f55] select-none font-bold uppercase tracking-wider font-mono">
                          CODE:
                        </span>
                        <code className="font-mono font-bold text-sm sm:text-base text-[#6b4f35] tracking-wider truncate">
                          {item.code}
                        </code>
                      </div>

                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(item.id, item.code);
                        }}
                        aria-label={`Copy ${item.code}`}
                        className={`btn-v2 text-xs py-1 px-3 min-h-[32px] shrink-0 ${
                          isCopied ? 'btn-v2-olive' : ''
                        }`}
                      >
                        <span>{isCopied ? '✨' : '📋'}</span>
                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Expiry Date under the code */}
                    <div className="flex items-center justify-between text-[11px] font-bold font-sans text-[#6e7a3c] px-1">
                      <span className="flex items-center gap-1">
                        <span>⏳</span>
                        <span>Expires: {item.expiry}</span>
                      </span>
                      {isCopied && (
                        <span className="text-[#b23a6b] font-bold">
                          Ready to paste! ✨
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

      {/* 2. History Codes Section */}
      <section className="space-y-4 pt-4 border-t border-[#e9b3ad]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">📜</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#7a5638] font-serif flex items-center gap-2">
                <span>History Codes</span>
                <span className="tag-v2">
                  Expired ({filteredHistory.length})
                </span>
              </h2>
              <p className="text-xs font-medium text-[#8c6f55] font-sans">
                Past redemption codes that have reached their expiration date.
              </p>
            </div>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="rounded-[24px] bg-[#f3ecda] p-6 text-center">
            <p className="text-sm font-bold text-[#8c6f55] font-sans">
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
                <h3 className="font-heading font-semibold text-xs sm:text-sm text-[#7a5638] text-center line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <span className="rounded-full bg-[#f9f4e6] px-3 py-0.5 line-through text-xs font-mono font-bold text-[#8c6f55] text-center tracking-wider">
                  {item.code}
                </span>
                <span className="text-[10px] text-[#8c6f55]/80 font-mono">
                  Expired: {item.expiry}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default RedemptionCodesPage;
