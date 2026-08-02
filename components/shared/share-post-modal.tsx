'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  buildWhatsAppShareUrl,
  getDefaultWhatsAppShareMessage,
  type ShareContentType,
} from '@/features/share-preview/whatsapp-share';
import { WhatsAppIcon } from '@/components/shared/whatsapp-icon';

// ─── Platform data ────────────────────────────────────────────────────────────

export const SHARE_PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    bg: 'rgba(37,211,102,0.1)',
    icon: <WhatsAppIcon size={20} />,
    getUrl: (url: string, title: string) =>
      buildWhatsAppShareUrl({ url, message: title }),
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
  profileShareRow: "px-6 pt-6",
  profileShareBtn: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-bold text-xs uppercase transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
  spinner: "animate-spin",
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
  contentType?: ShareContentType;
  onShared?: () => Promise<void> | void;
  onShareToProfile?: () => Promise<void> | void;
  shareToProfilePending?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SharePostModal({
  isOpen,
  onClose,
  url,
  title,
  contentType = 'post',
  onShared,
  onShareToProfile,
  shareToProfilePending = false,
}: SharePostModalProps) {
  const t = useTranslations('Share');
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const hasNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const defaultWhatsAppMessage = getDefaultWhatsAppShareMessage(contentType, locale);
  const whatsappMessage = title.trim()
    ? `${defaultWhatsAppMessage}\n${title.trim()}`
    : defaultWhatsAppMessage;
  const shareTitleKey = `${contentType}ShareTitle`;
  const shareTitle = t.has(shareTitleKey) ? t(shareTitleKey) : t('shareTitle');

  const notifyShared = () => {
    void onShared?.();
  };

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
    notifyShared();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlatform = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    notifyShared();
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: title, url });
      notifyShared();
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
          <span className={styles.headerTitle}>{shareTitle}</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Native share — only when the device supports the Web Share API. */}
        {onShareToProfile && (
          <div className={styles.profileShareRow}>
            <button
              type="button"
              className={styles.profileShareBtn}
              onClick={async () => {
                await onShareToProfile();
              }}
              disabled={shareToProfilePending}
            >
              {shareToProfilePending ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <Share2 size={16} />
              )}
              {t('shareToProfile')}
            </button>
          </div>
        )}

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
              onClick={() => handlePlatform(platform.getUrl(url, platform.id === 'whatsapp' ? whatsappMessage : title))}
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
