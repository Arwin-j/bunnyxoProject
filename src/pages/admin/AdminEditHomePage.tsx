import React, { useState } from 'react';
import { AdminEditTabs } from '../../components/admin/AdminEditTabs';
import { useHomeUpdates } from '../../hooks/useHomeUpdates';
import { Toast, ToastMessage } from '../../components/admin/Toast';

export const AdminEditHomePage: React.FC = () => {
  const { versions, activeVersionId, activeUpdate, addVersion, setActiveVersionId } =
    useHomeUpdates();

  const [versionNum, setVersionNum] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleCreateVersion = () => {
    const trimmedNum = versionNum.trim();
    const trimmedName = updateName.trim();

    if (!trimmedNum) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: 'Please enter a version number (numbers only).',
      });
      return;
    }

    if (!trimmedName) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        text: 'Please enter an update name.',
      });
      return;
    }

    const created = addVersion(trimmedNum, trimmedName);
    setVersionNum('');
    setUpdateName('');
    setToast({
      id: String(Date.now()),
      type: 'success',
      text: `Version v.${created.version} (${created.name}) saved and set to active!`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Edit Mode Tabs Navigation */}
      <AdminEditTabs currentTab="home" />

      {/* Page Title Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fbd5e1] flex items-center justify-center text-xl shadow-xs select-none">
            🏠
          </div>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#6b4f35]">
              Home Edit
            </h1>
            <p className="text-xs sm:text-sm text-[#8c6f55] font-sans">
              Manage the game update version and title displayed on the Home page.
            </p>
          </div>
        </div>
      </div>

      {/* Compact Box on Left Side (does not cover full page) */}
      <div style={{ maxWidth: '380px', width: '100%' }}>
        <div
          className="card"
          style={{
            background: '#f3ecda',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(107, 79, 53, 0.08)',
            border: '1.5px solid rgba(233, 179, 173, 0.4)',
          }}
        >
          {/* Card Title */}
          <h2
            style={{
              margin: '0 0 14px',
              fontFamily: 'Lora, serif',
              fontSize: '18px',
              color: '#7a5638',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✨</span>
            <span>Version Edit</span>
          </h2>

          {/* 1. Version Input with preset v. (numbers only) */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 600,
                color: '#7a5638',
                marginBottom: '6px',
              }}
            >
              Version
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '14px',
                background: '#ffffff',
                border: '1.5px solid #e9b3ad',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  background: '#fbd5e1',
                  color: '#b23a6b',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRight: '1.5px solid #e9b3ad',
                  userSelect: 'none',
                }}
              >
                v.
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="1.2"
                value={versionNum}
                onChange={(e) => {
                  // Only accept numbers and dots (e.g., 1.2 or 1.2.0)
                  const clean = e.target.value.replace(/[^0-9.]/g, '');
                  setVersionNum(clean);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#6b4f35',
                  border: 0,
                  outline: 'none',
                  background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* 2. Update Name Input + Plus Button on Right */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 600,
                color: '#7a5638',
                marginBottom: '6px',
              }}
            >
              Update name
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. Phantom Glow Patch"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateVersion();
                  }
                }}
                style={{
                  flex: 1,
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1.5px solid #e9b3ad',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#6b4f35',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={handleCreateVersion}
                title="Save Version"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#b23a6b',
                  color: '#ffffff',
                  border: 0,
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(178, 58, 107, 0.25)',
                  transition: 'transform 0.1s ease',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* 3. Dropdown with all saved versions */}
          <div>
            <label
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 600,
                color: '#7a5638',
                marginBottom: '6px',
              }}
            >
              <span>Saved Versions</span>
              <span style={{ fontSize: '11px', color: '#8c6f55', fontWeight: 500 }}>
                Active on Home
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={activeVersionId}
                onChange={(e) => {
                  setActiveVersionId(e.target.value);
                  const selected = versions.find((v) => v.id === e.target.value);
                  if (selected) {
                    setToast({
                      id: String(Date.now()),
                      type: 'success',
                      text: `Switched active version to v.${selected.version} (${selected.name})`,
                    });
                  }
                }}
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1.5px solid #e9b3ad',
                  padding: '10px 32px 10px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#6b4f35',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  appearance: 'none',
                }}
              >
                {versions.map((ver) => (
                  <option key={ver.id} value={ver.id}>
                    v.{ver.version} — {ver.name}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  fontSize: '11px',
                  color: '#b23a6b',
                }}
              >
                ▼
              </span>
            </div>

            {/* Currently Active Live Indicator */}
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                borderRadius: '12px',
                background: '#fff3f0',
                border: '1px solid #fbd5e1',
                fontSize: '12px',
                color: '#6b4f35',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                  flexShrink: 0,
                  boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong style={{ color: '#b23a6b' }}>Live:</strong> v.{activeUpdate.version} · {activeUpdate.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminEditHomePage;
