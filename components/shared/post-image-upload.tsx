import { useState, useRef, useEffect } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PostImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

const styles = {
  fieldWrapper: "space-y-1.5",
  label: "text-[11px] font-bold text-foreground/50 px-1 uppercase block",
  optionalBadge: "text-[9px] font-bold text-foreground/30 normal-case tracking-normal ml-1",
  uploadArea: "relative w-full aspect-video bg-[#0D121F] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group overflow-hidden",
  uploadIcon: "text-foreground/20 group-hover:text-primary/40 transition-colors",
  uploadLabel: "text-sm text-foreground/40 font-medium group-hover:text-primary/60 transition-colors",
  uploadPreview: "absolute inset-0 w-full h-full object-cover",
  uploadOverlay: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
  uploadChange: "text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-lg backdrop-blur",
  removeBtn: "absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-all backdrop-blur-sm border-0 cursor-pointer outline-none",
};

export function PostImageUpload({ value, onChange }: PostImageUploadProps) {
  const t = useTranslations('PostImage');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0] ?? null;
    onChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label}>
        {t('postImage')}
        <span className={styles.optionalBadge}>({t('optional')})</span>
      </label>

      <div className={styles.uploadArea} onClick={handleAreaClick}>
        {preview ? (
          <>
            <img src={preview} alt="preview" className={styles.uploadPreview} />
            <div className={styles.uploadOverlay}>
              <span className={styles.uploadChange}>{t('changeImage')}</span>
            </div>
            <button
              type="button"
              className={styles.removeBtn}
              title={t('removeImage')}
              onClick={handleRemove}
            >
              <X size={14} strokeWidth={3} />
            </button>
          </>
        ) : (
          <>
            <ImageIcon size={36} className={styles.uploadIcon} />
            <span className={styles.uploadLabel}>{t('uploadPhoto')}</span>
          </>
        )}
        <input
          ref={fileInputRef}
          id="new-post-image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
