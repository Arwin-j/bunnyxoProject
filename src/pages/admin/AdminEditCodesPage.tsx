import React, { useState, useRef } from 'react';
import { useRedemptionCodes, RedemptionCode } from '../../hooks/useRedemptionCodes';
import { AdminEditTabs } from '../../components/admin/AdminEditTabs';
import { Toast, ToastMessage } from '../../components/admin/Toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

interface CodeFormData {
  title: string;
  code: string;
  expiry: string;
  rewards: string;
  isHistory: boolean;
}

const EMPTY_FORM: CodeFormData = {
  title: '',
  code: '',
  expiry: '',
  rewards: '',
  isHistory: false,
};

function parseExpiryToDateInput(expiryStr: string): string {
  if (!expiryStr || expiryStr.toLowerCase().includes('permanent')) return '';
  const d = new Date(expiryStr);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return '';
}

function formatDateToDisplay(dateInputVal: string): string {
  if (!dateInputVal) return '';
  const parts = dateInputVal.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateInputVal;
}

export const AdminEditCodesPage: React.FC = () => {
  const {
    codes,
    activeCodes,
    historyCodes,
    addCode,
    updateCode,
    deleteCode,
    toggleCodeHistory,
  } = useRedemptionCodes();

  const [form, setForm] = useState<CodeFormData>(EMPTY_FORM);
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [isPermanent, setIsPermanent] = useState<boolean>(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load a code into the form for editing
  const handleEditCode = (item: RedemptionCode) => {
    setEditingCodeId(item.id);
    const isPerm = Boolean(item.expiry.toLowerCase().includes('permanent'));
    setIsPermanent(isPerm);
    setForm({
      title: item.title,
      code: item.code,
      expiry: item.expiry,
      rewards: item.rewards || '',
      isHistory: Boolean(item.isHistory),
    });
    // Smooth scroll up to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const handleResetForm = () => {
    setForm(EMPTY_FORM);
    setEditingCodeId(null);
    setIsPermanent(false);
  };

  const handleTogglePermanent = () => {
    setIsPermanent((prev) => {
      const next = !prev;
      if (next) {
        setForm((f) => ({ ...f, expiry: 'Permanent (No Expiration)' }));
      } else {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        const y = defaultDate.getFullYear();
        const m = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const d = String(defaultDate.getDate()).padStart(2, '0');
        const formatted = formatDateToDisplay(`${y}-${m}-${d}`);
        setForm((f) => ({ ...f, expiry: formatted }));
      }
      return next;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    if (val) {
      const formatted = formatDateToDisplay(val);
      setForm((prev) => ({ ...prev, expiry: formatted }));
    } else {
      setForm((prev) => ({ ...prev, expiry: '' }));
    }
  };

  // Submit form (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.code.trim() || !form.expiry.trim()) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: 'Title, Code, and Expiry date are all required.',
      });
      return;
    }

    if (editingCodeId) {
      updateCode(editingCodeId, {
        title: form.title.trim(),
        code: form.code.trim(),
        expiry: form.expiry.trim(),
        rewards: form.rewards.trim(),
        isHistory: form.isHistory,
      });
      setToast({
        id: String(Date.now()),
        type: 'success',
        text: `Updated code "${form.code.trim().toUpperCase()}".`,
      });
    } else {
      addCode({
        title: form.title.trim(),
        code: form.code.trim(),
        expiry: form.expiry.trim(),
        rewards: form.rewards.trim(),
        isHistory: form.isHistory,
      });
      setToast({
        id: String(Date.now()),
        type: 'success',
        text: `Created code "${form.code.trim().toUpperCase()}".`,
      });
    }

    handleResetForm();
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteCode(confirmDeleteId);
    if (editingCodeId === confirmDeleteId) {
      handleResetForm();
    }
    setToast({
      id: String(Date.now()),
      type: 'success',
      text: 'Code was permanently deleted.',
    });
    setConfirmDeleteId(null);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Clickable Admin Tabs: Events, Codes */}
      <AdminEditTabs currentTab="codes" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
            <span>Edit Redemption Codes</span>
            <span className="text-2xl" title="Gift Codes">🎁</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground font-sans">
            Paste in codes, edit feeds, and manage active & expired history codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editingCodeId ? (
            <button
              type="button"
              onClick={handleResetForm}
              className="rounded-full border-2 border-foreground bg-primary hover:bg-accent px-4 py-1.5 font-sans font-bold text-xs sm:text-sm text-foreground shadow-ink active:translate-y-0.5 transition-all cursor-pointer"
            >
              + Create New Code
            </button>
          ) : (
            <span className="rounded-full border-2 border-foreground bg-[#bbf7d0] px-3.5 py-1 text-xs sm:text-sm font-bold text-foreground shadow-xs">
              📊 {codes.length} Total Codes
            </span>
          )}
        </div>
      </div>

      {/* 1. Form to Paste in Title, Code, and Expiry Date */}
      <section className="rounded-[28px] border-[3px] border-foreground bg-card p-6 sm:p-7 shadow-ink space-y-5">
        <div className="border-b-2 border-dashed border-foreground/30 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground font-sans">
              {editingCodeId ? 'Edit Redemption Code' : 'Add Redemption Code'}
            </h2>
          </div>
          {editingCodeId && (
            <span className="rounded-full border border-foreground bg-amber-200 px-3 py-0.5 text-xs font-bold text-amber-950">
              Editing mode
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title Input */}
            <div>
              <label
                htmlFor="code-title-input"
                className="block font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="code-title-input"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                required
                maxLength={80}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Heartopia Launch Celebration"
                className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-4 py-2 font-sans font-bold text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all"
              />
            </div>

            {/* Code Input */}
            <div>
              <label
                htmlFor="code-code-input"
                className="block font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Code (paste code here) <span className="text-rose-500">*</span>
              </label>
              <input
                id="code-code-input"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                required
                maxLength={40}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. HEARTOPIA2026"
                className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-4 py-2 font-mono font-bold text-sm text-foreground uppercase placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expiry Date Input with Calendar Pop-up & Permanent Button on the side */}
            <div>
              <label
                htmlFor="code-expiry-date-input"
                className="block font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Expiry Date <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2">
                {/* Calendar Date Picker Input */}
                {isPermanent ? (
                  <div
                    onClick={handleTogglePermanent}
                    className="flex-1 h-[42px] flex items-center justify-between rounded-full border-2 border-[#166534] bg-[#dcfce7] px-4 text-sm font-bold text-[#14532d] shadow-xs cursor-pointer select-none"
                    title="Currently permanent. Click to choose a date."
                  >
                    <span>♾️ Permanent (No Expiration)</span>
                    <span className="text-xs text-[#166534]/70 hover:underline">
                      ✕
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      try {
                        dateInputRef.current?.showPicker();
                      } catch {}
                      dateInputRef.current?.focus();
                    }}
                    className="flex-1 h-[42px] relative flex items-center rounded-full border-2 border-foreground bg-[#fdf2f6] px-4 focus-within:ring-2 focus-within:ring-[#f472b6] cursor-pointer transition-all"
                  >
                    <input
                      ref={dateInputRef}
                      id="code-expiry-date-input"
                      type="date"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      data-lpignore="true"
                      data-form-type="other"
                      required={!isPermanent}
                      value={parseExpiryToDateInput(form.expiry)}
                      onChange={handleDateChange}
                      onClick={(e) => {
                        try {
                          (e.target as HTMLInputElement).showPicker();
                        } catch {}
                      }}
                      className="w-full bg-transparent font-sans font-bold text-sm text-foreground focus:outline-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Button on the side to make it permanent */}
                <button
                  type="button"
                  onClick={handleTogglePermanent}
                  title={
                    isPermanent
                      ? 'Switch back to calendar date picker'
                      : 'Make code permanent with no expiration date'
                  }
                  className={`h-[42px] shrink-0 rounded-full border-2 px-3.5 sm:px-4 font-sans text-xs sm:text-sm font-bold transition-all active:translate-y-0.5 cursor-pointer flex items-center gap-1.5 select-none ${
                    isPermanent
                      ? 'border-[#166534] bg-[#bbf7d0] text-[#14532d] shadow-ink'
                      : 'border-foreground/30 bg-card hover:bg-accent hover:border-foreground text-foreground shadow-xs'
                  }`}
                >
                  <span>{isPermanent ? '✓' : '♾️'}</span>
                  <span>Permanent</span>
                </button>
              </div>

              {!isPermanent && form.expiry && (
                <p className="mt-1 text-[11px] font-bold text-[#166534] px-2">
                  📅 Set to expire on: {form.expiry}
                </p>
              )}
            </div>

            {/* Status: Active vs History */}
            <div>
              <label
                htmlFor="code-status-select"
                className="block font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Category / Status
              </label>
              <select
                id="code-status-select"
                value={form.isHistory ? 'history' : 'active'}
                onChange={(e) =>
                  setForm({ ...form, isHistory: e.target.value === 'history' })
                }
                className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-4 py-2 font-sans font-bold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all cursor-pointer"
              >
                <option value="active">Active Code (Public Feed)</option>
                <option value="history">History Code (Expired List)</option>
              </select>
            </div>
          </div>

          {/* Rewards (Optional) */}
          <div>
            <label
              htmlFor="code-rewards-input"
              className="block font-sans font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Rewards Summary (Optional)
            </label>
            <input
              id="code-rewards-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              maxLength={120}
              value={form.rewards}
              onChange={(e) => setForm({ ...form, rewards: e.target.value })}
              placeholder="e.g. 150x Wishing Stars & Exclusive Tulip Apron"
              className="w-full rounded-full border-2 border-foreground bg-[#fdf2f6] px-4 py-2 font-sans font-bold text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#f472b6] transition-all"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t-2 border-dashed border-foreground/20 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-xl border-2 border-foreground bg-[#f48fb1] hover:bg-[#f06292] py-2.5 px-6 font-sans font-bold text-sm text-foreground shadow-ink active:translate-y-0.5 transition-all cursor-pointer"
            >
              {editingCodeId ? '💾 Save Changes' : '✨ Publish Code'}
            </button>
            {editingCodeId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="rounded-xl border-2 border-foreground/40 bg-card hover:bg-muted py-2.5 px-4 font-sans font-semibold text-sm text-foreground transition-all cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* 2. Active Codes Table / Card List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">✨</span>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
              Active Codes Feed ({activeCodes.length})
            </h2>
          </div>
        </div>

        {activeCodes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-foreground/30 bg-card p-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground font-sans">
              No active codes right now. Use the form above to add one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeCodes.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-foreground bg-[#f0fdf4] p-4 shadow-xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm bg-white px-2.5 py-0.5 rounded-full border border-foreground/30 text-foreground">
                      {item.code}
                    </span>
                    <span className="text-[11px] font-bold text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-foreground/20">
                      Active
                    </span>
                  </div>
                  <h3 className="mt-2 font-sans font-bold text-sm text-foreground">
                    {item.title}
                  </h3>
                  {item.rewards && (
                    <p className="mt-0.5 text-xs text-muted-foreground font-sans truncate">
                      🎁 {item.rewards}
                    </p>
                  )}
                  <span className="block mt-1 text-[11px] font-bold text-[#166534]">
                    ⏳ Expires: {item.expiry}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-dashed border-foreground/20">
                  <button
                    type="button"
                    onClick={() => handleEditCode(item)}
                    className="flex-1 rounded-lg border border-foreground bg-white hover:bg-muted py-1 px-2.5 text-xs font-bold text-foreground transition-all cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCodeHistory(item.id)}
                    title="Mark as expired and move to history"
                    className="flex-1 rounded-lg border border-[#dc2626]/40 bg-[#fef2f2] hover:bg-[#fee2e2] py-1 px-2.5 text-xs font-bold text-[#dc2626] transition-all cursor-pointer"
                  >
                    Move to History →
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 p-1.5 text-xs text-rose-700 transition-all cursor-pointer"
                    title="Delete code"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. List of History of Codes under the form (pill shaped, red bordered cards) */}
      <section className="space-y-4 pt-4 border-t-3 border-dashed border-foreground/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">📜</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
                <span>History Codes</span>
                <span className="rounded-full border-2 border-[#dc2626] bg-[#fef2f2] px-2.5 py-0.5 text-xs font-bold text-[#dc2626]">
                  Expired ({historyCodes.length})
                </span>
              </h2>
              <p className="text-xs font-medium text-muted-foreground font-sans">
                Expired codes stored in history feed.
              </p>
            </div>
          </div>
        </div>

        {historyCodes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#dc2626]/30 bg-[#fef2f2]/60 p-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground font-sans">
              No expired codes in history.
            </p>
          </div>
        ) : (
          <div className="history-codes-grid">
            {historyCodes.map((item) => (
              <div
                key={item.id}
                onClick={() => handleEditCode(item)}
                title={`Click to edit: ${item.title}`}
                className="history-code-square cursor-pointer group relative"
              >
                <h3 className="font-sans font-bold text-xs sm:text-sm text-foreground text-center line-clamp-2 leading-snug pr-4">
                  {item.title}
                </h3>
                <span className="rounded-full bg-[#fef2f2] border border-[#dc2626]/40 px-3 py-0.5 history-code-strike text-xs font-mono font-bold text-[#b91c1c] text-center tracking-wider">
                  {item.code}
                </span>

                {/* Quick actions on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCodeHistory(item.id);
                    }}
                    title="Reactivate code"
                    className="size-5 rounded-full bg-[#bbf7d0] border border-foreground text-[10px] flex items-center justify-center text-[#14532d] shadow-xs hover:bg-[#86efac]"
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(item.id);
                    }}
                    title="Delete code"
                    className="size-5 rounded-full bg-rose-100 border border-rose-400 text-[10px] flex items-center justify-center text-rose-700 shadow-xs hover:bg-rose-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Delete Redemption Code"
        message="Are you sure you want to permanently delete this code? This action cannot be undone."
        confirmLabel="Yes, Delete Code"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
};

export default AdminEditCodesPage;
