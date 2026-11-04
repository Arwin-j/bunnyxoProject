import React, { useState, useRef } from 'react';

interface SubmitSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    username: string;
    title: string;
    imageFile: File;
  }) => Promise<void>;
}

export const SubmitSpotlightModal: React.FC<SubmitSpotlightModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      // Check file size (e.g. max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size must be under 10MB.');
        return;
      }
      setErrorMsg(null);
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedTitle = title.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!trimmedUsername) {
      setErrorMsg('Please enter your Discord username or in-game username.');
      return;
    }
    if (!trimmedTitle) {
      setErrorMsg('Please give your work a title (e.g. Cozy Bakery Garden Build).');
      return;
    }
    if (!imageFile) {
      setErrorMsg('Please upload a screenshot or picture of your work.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        username: trimmedUsername,
        title: trimmedTitle,
        imageFile,
      });
      // Reset form
      setName('');
      setUsername('');
      setTitle('');
      handleRemoveImage();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit spotlight. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(74, 40, 53, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fcf8ee',
          borderRadius: '28px',
          border: '2.5px solid #6b4f35',
          boxShadow: '0 20px 40px rgba(74, 40, 53, 0.2)',
          padding: '24px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#f3ecda',
            border: '1.5px solid #6b4f35',
            color: '#6b4f35',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '18px', paddingRight: '30px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#fbd5e1',
              color: '#b23a6b',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <span>✨</span>
            <span>Community Spotlight</span>
          </div>
          <h2
            style={{
              margin: '0 0 6px',
              fontFamily: 'Lora, serif',
              fontSize: '22px',
              color: '#7a5638',
              lineHeight: 1.25,
            }}
          >
            Submit Your Work
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#8c6f55',
              lineHeight: 1.4,
            }}
          >
            Showcase your cozy island builds, room designs, outfits, or game photos! The best works will be featured on the Home page.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              borderRadius: '14px',
              background: '#fee2e2',
              border: '1.5px solid #ef4444',
              color: '#991b1b',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. Work Title */}
          <div>
            <label
              htmlFor="spotlight-title"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#7a5638',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Work Title / Build Name <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              id="spotlight-title"
              type="text"
              required
              maxLength={70}
              placeholder="e.g. Cozy Bakery Garden Build"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '14px',
                border: '1.5px solid #e9b3ad',
                background: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6b4f35',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 2. User Name */}
          <div>
            <label
              htmlFor="spotlight-name"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#7a5638',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Your Name <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              id="spotlight-name"
              type="text"
              required
              maxLength={50}
              placeholder="e.g. Lily"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '14px',
                border: '1.5px solid #e9b3ad',
                background: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6b4f35',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 3. Discord or In-Game Username */}
          <div>
            <label
              htmlFor="spotlight-username"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#7a5638',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Discord or In-Game Username <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              id="spotlight-username"
              type="text"
              required
              maxLength={50}
              placeholder="e.g. cozycottage or lily#1234"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '14px',
                border: '1.5px solid #e9b3ad',
                background: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6b4f35',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 4. Upload Image */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#7a5638',
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Upload Picture / Screenshot <span style={{ color: '#e11d48' }}>*</span>
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="spotlight-file-input"
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #e9b3ad',
                  borderRadius: '18px',
                  background: '#fef7f6',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '30px', marginBottom: '6px' }}>📸</div>
                <strong style={{ display: 'block', color: '#b23a6b', fontSize: '13px' }}>
                  Click to select photo or screenshot
                </strong>
                <span style={{ fontSize: '12px', color: '#8c6f55' }}>
                  PNG, JPG, WEBP (Max 10MB)
                </span>
              </div>
            ) : (
              <div
                style={{
                  position: 'relative',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '2px solid #6b4f35',
                  boxShadow: '0 4px 12px rgba(107, 79, 53, 0.1)',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Spotlight Preview"
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '6px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #6b4f35',
                      borderRadius: '999px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#6b4f35',
                      cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #ef4444',
                      borderRadius: '999px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#991b1b',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '8px',
              paddingTop: '14px',
              borderTop: '1.5px dashed rgba(233, 179, 173, 0.6)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: '#f3ecda',
                border: '1.5px solid rgba(107, 79, 53, 0.4)',
                borderRadius: '999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#6b4f35',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: '#b23a6b',
                border: '1.5px solid #6b4f35',
                borderRadius: '999px',
                padding: '8px 22px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                boxShadow: '0 3px 0 #6b4f35',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSubmitting ? 'Submitting...' : '✨ Submit to Spotlight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

