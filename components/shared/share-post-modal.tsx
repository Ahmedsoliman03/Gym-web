'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

// ─── Platform data ────────────────────────────────────────────────────────────

export const SHARE_PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    bg: 'rgba(37,211,102,0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    color: '#229ED9',
    bg: 'rgba(34,158,217,0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    // Instagram doesn't support direct URL sharing — opens the app
    getUrl: (_url: string, _title: string) => `https://www.instagram.com/`,
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.08)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
];

// ─── Styles object ─────────────────────────────────────────────────────────────

const styles = {
  overlay: "fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm",
  modal: "w-full max-w-sm bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4",
  header: "flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5",
  headerTitle: "font-black text-foreground text-base uppercase tracking-wider",
  closeBtn: "p-1.5 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-lg transition-all",
  platformGrid: "grid grid-cols-4 gap-3 p-6",
  platformBtn: "flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 active:scale-95",
  platformLabel: "text-[10px] font-bold text-foreground/60",
  divider: "h-[1px] bg-white/5 mx-6",
  nativeRow: "flex items-center gap-3 px-6 pt-6",
  nativeBtn: "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 text-foreground rounded-lg font-bold text-xs uppercase transition-all active:scale-95",
  copyRow: "flex items-center gap-3 p-6",
  copyUrl: "flex-1 px-3 py-2.5 bg-white/5 border border-white/5 rounded-lg text-xs text-foreground/50 font-mono overflow-hidden text-ellipsis whitespace-nowrap",
  copyBtn: "flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold text-xs uppercase transition-all hover:opacity-90 active:scale-95 whitespace-nowrap",
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  onShared?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SharePostModal({ isOpen, onClose, url, title, onShared }: SharePostModalProps) {
  const t = useTranslations('Share');
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const sharedFiredRef = useRef(false);

  // Detect the Web Share API client-side only (it's undefined during SSR).
  useEffect(() => {
    setHasNativeShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    );
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset the one-shot "shared" guard whenever the modal reopens.
  useEffect(() => {
    if (isOpen) sharedFiredRef.current = false;
  }, [isOpen]);

  const fireShared = () => {
    if (sharedFiredRef.current) return;
    sharedFiredRef.current = true;
    onShared?.();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {

      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
      }
    }
    setCopied(true);
    fireShared();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlatform = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    fireShared();
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: title, url });
      fireShared();
    } catch (err) {
      void err;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>{t('shareTitle')}</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Native share — only when the device supports the Web Share API. */}
        {hasNativeShare && (
          <div className={styles.nativeRow}>
            <button className={styles.nativeBtn} onClick={handleNativeShare}>
              <Share2 size={14} />
              {t('shareViaDevice')}
            </button>
          </div>
        )}

        {/* Platform grid */}
        <div className={styles.platformGrid}>
          {SHARE_PLATFORMS.map(platform => (
            <button
              key={platform.id}
              className={styles.platformBtn}
              style={{ background: platform.bg }}
              onClick={() => handlePlatform(platform.getUrl(url, title))}
              title={platform.label}
            >
              <span style={{ color: platform.color }}>{platform.icon}</span>
              <span className={styles.platformLabel}>{platform.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        {/* Copy row */}
        <div className={styles.copyRow}>
          <div className={styles.copyUrl}>{url}</div>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? (
              <><Check size={14} />{t('shareCopied')}</>
            ) : (
              <><Copy size={14} />{t('shareCopy')}</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
