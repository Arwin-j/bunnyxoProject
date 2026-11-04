import React, { useState } from 'react';
import { AdminEditTabs } from '../../components/admin/AdminEditTabs';
import { useHomeUpdates } from '../../hooks/useHomeUpdates';
import { useCommunitySpotlights, CommunitySpotlight } from '../../hooks/useCommunitySpotlights';
import { Toast, ToastMessage } from '../../components/admin/Toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { SubmitSpotlightModal } from '../../components/home/SubmitSpotlightModal';

export const AdminEditHomePage: React.FC = () => {
  const {
    versions,
    activeVersionId,
    activeUpdate,
    addVersion,
    deleteVersion,
    setActiveVersionId,
  } = useHomeUpdates();

  const {
    spotlights,
    featuredSpotlight,
    setFeaturedSpotlight,
    unfeatureSpotlight,
    deleteSpotlight,
    submitSpotlight,
  } = useCommunitySpotlights();

  const [versionNum, setVersionNum] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmDeleteSpotlightId, setConfirmDeleteSpotlightId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAddSpotlightOpen, setIsAddSpotlightOpen] = useState(false);

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

  const handlePutUpSpotlight = (item: CommunitySpotlight) => {
    setFeaturedSpotlight(item.id);
    setToast({
      id: String(Date.now()),
      type: 'success',
      text: `🌟 "${item.title}" by @${item.username} is now featured on the Home page!`,
    });
  };

  const handleRemoveSpotlight = (item: CommunitySpotlight) => {
    unfeatureSpotlight(item.id);
    setToast({
      id: String(Date.now()),
      type: 'info',
      text: `Removed "${item.title}" from Home spotlight.`,
    });
  };

  const handleDeleteSpotlightConfirm = () => {
    if (!confirmDeleteSpotlightId) return;
    deleteSpotlight(confirmDeleteSpotlightId);
    setConfirmDeleteSpotlightId(null);
    setToast({
      id: String(Date.now()),
      type: 'success',
      text: 'Spotlight submission was deleted.',
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
              Manage update version and review/feature Community Spotlight submissions.
            </p>
          </div>
        </div>
      </div>

      {/* Responsive Layout: Version Edit & Community Spotlight Submissions (matching compact widths) */}
      <div className="flex flex-wrap gap-8 items-start">
        {/* Version Edit */}
        <div style={{ maxWidth: '380px', width: '100%' }}>
        <div
          className="card"
          style={{
            background: '#f3ecda',
            borderRadius: '24px',
            padding: '20px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
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
              <button
                type="button"
                onClick={() => {
                  if (versions.length <= 1) {
                    setToast({
                      id: String(Date.now()),
                      type: 'error',
                      text: 'Cannot delete the only saved version. Add another version first.',
                    });
                    return;
                  }
                  setShowConfirmDelete(true);
                }}
                title="Delete selected version"
                aria-label="Delete selected version"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#fff0f2',
                  color: '#b23a6b',
                  border: '1.5px solid #e9b3ad',
                  fontSize: '16px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(178, 58, 107, 0.12)',
                  transition: 'transform 0.1s ease',
                }}
              >
                🗑️
              </button>
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

        {/* Right Column: Community Spotlight Submissions (matching Version Edit compact width) */}
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <div
            className="card"
            style={{
              background: '#f3ecda',
              borderRadius: '24px',
              padding: '20px',
              border: '1.5px solid rgba(233, 179, 173, 0.4)',
            }}
          >
            {/* Spotlight Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '14px',
                paddingBottom: '12px',
                borderBottom: '1.5px dashed rgba(233, 179, 173, 0.6)',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: '0 0 2px',
                    fontFamily: 'Lora, serif',
                    fontSize: '18px',
                    color: '#7a5638',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🌸</span>
                  <span>Community Spotlight</span>
                </h2>
                <p style={{ margin: 0, fontSize: '11px', color: '#8c6f55' }}>
                  Review & pick best work for Home
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddSpotlightOpen(true)}
                style={{
                  background: '#fbd5e1',
                  color: '#b23a6b',
                  border: '1.5px solid #e9b3ad',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <span>+</span>
                <span>Add</span>
              </button>
            </div>

            {/* Active Live Banner */}
            {featuredSpotlight ? (
              <div
                style={{
                  marginBottom: '14px',
                  padding: '8px 12px',
                  borderRadius: '14px',
                  background: '#dcfce7',
                  border: '1.5px solid #22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>🌟</span>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#15803d', display: 'block' }}>
                      Live on Home
                    </span>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#14532d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {featuredSpotlight.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      @{featuredSpotlight.username}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSpotlight(featuredSpotlight)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #166534',
                    borderRadius: '999px',
                    padding: '3px 9px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#15803d',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Unfeature
                </button>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: '14px',
                  padding: '8px 10px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  border: '1px dashed #f59e0b',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>ℹ️</span>
                <span>No work currently featured on Home.</span>
              </div>
            )}

            {/* List of Submissions */}
            {spotlights.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  borderRadius: '16px',
                  background: '#fcf8ee',
                  border: '2px dashed #e9b3ad',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>📸</div>
                <h3 style={{ margin: '0 0 4px', fontSize: '14px', color: '#7a5638', fontWeight: 700 }}>
                  No submissions yet
                </h3>
                <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#8c6f55' }}>
                  Submissions from visitors on the Home page will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddSpotlightOpen(true)}
                  style={{
                    background: '#b23a6b',
                    color: '#ffffff',
                    border: '1.5px solid #6b4f35',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ✨ Add First Submission
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {spotlights.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: item.isFeatured ? '#fff5f7' : '#ffffff',
                      border: item.isFeatured ? '2px solid #b23a6b' : '1.5px solid #e9b3ad',
                      borderRadius: '16px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: item.isFeatured ? '0 4px 12px rgba(178, 58, 107, 0.15)' : '0 2px 5px rgba(107, 79, 53, 0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* Thumbnail Image with Lightbox preview on click */}
                      <div
                        onClick={() => setPreviewImage(item.imageUrl)}
                        title="Click to preview full picture"
                        style={{
                          width: '70px',
                          height: '60px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          cursor: 'pointer',
                          border: '1.5px solid #6b4f35',
                          position: 'relative',
                          background: '#fbd5e1',
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            fontSize: '8px',
                            fontWeight: 700,
                            padding: '1px 3px',
                            borderRadius: '4px',
                          }}
                        >
                          🔍
                        </span>
                      </div>

                      {/* Content: Title, Name, Discord/In-game Username */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '4px',
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#7a5638',
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title}
                          </h3>
                          {item.isFeatured && (
                            <span
                              style={{
                                background: '#bbf7d0',
                                border: '1px solid #166534',
                                color: '#14532d',
                                padding: '1px 6px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              Live
                            </span>
                          )}
                        </div>

                        {/* Username & Name */}
                        <div style={{ fontSize: '12px', color: '#6b4f35', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#b23a6b' }}>@{item.username}</strong>
                          {item.name && (
                            <span style={{ color: '#8c6f55', marginLeft: '4px' }}>
                              ({item.name})
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '10px', color: '#8c6f55', marginTop: '2px' }}>
                          📅 {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Controls: Put Up / Remove / Delete */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        paddingTop: '8px',
                        borderTop: '1px dashed rgba(233, 179, 173, 0.4)',
                      }}
                    >
                      {item.isFeatured ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpotlight(item)}
                          style={{
                            background: '#fff0f2',
                            border: '1.5px solid #e9b3ad',
                            color: '#b23a6b',
                            borderRadius: '999px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✕ Remove Live
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePutUpSpotlight(item)}
                          style={{
                            background: '#b23a6b',
                            border: '1.5px solid #6b4f35',
                            color: '#ffffff',
                            borderRadius: '999px',
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 1.5px 0 #6b4f35',
                          }}
                        >
                          🌟 Put Up
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteSpotlightId(item.id)}
                        title="Delete submission"
                        aria-label="Delete submission"
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #ef4444',
                          color: '#991b1b',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Spotlight Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteSpotlightId)}
        title="Delete Spotlight Submission?"
        message="Are you sure you want to permanently delete this community spotlight submission? This cannot be undone."
        confirmLabel="Delete Submission"
        isDestructive={true}
        onConfirm={handleDeleteSpotlightConfirm}
        onCancel={() => setConfirmDeleteSpotlightId(null)}
      />

      {/* Lightbox Modal for Full Image Preview */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '3px solid #ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              background: '#000000',
            }}
          >
            <img
              src={previewImage}
              alt="Community Spotlight High-Res Preview"
              style={{
                width: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                border: '1.5px solid #ffffff',
                color: '#ffffff',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal for Admin to Manually Add a Spotlight Submission */}
      <SubmitSpotlightModal
        isOpen={isAddSpotlightOpen}
        onClose={() => setIsAddSpotlightOpen(false)}
        onSubmit={async (data) => {
          await submitSpotlight(data);
          setToast({
            id: String(Date.now()),
            type: 'success',
            text: `Added spotlight submission "${data.title}" by @${data.username}!`,
          });
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Delete Version Update?"
        message={`Are you sure you want to delete v.${activeUpdate.version} (${activeUpdate.name}) from saved versions?`}
        confirmLabel="Delete Version"
        isDestructive={true}
        onConfirm={() => {
          const target = versions.find((v) => v.id === activeVersionId) || activeUpdate;
          deleteVersion(activeVersionId);
          setShowConfirmDelete(false);
          setToast({
            id: String(Date.now()),
            type: 'success',
            text: `Version v.${target.version} (${target.name}) deleted.`,
          });
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />

      {/* Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminEditHomePage;
