'use client';

import { useEffect, useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { useEditPostMutation } from '../services/community.service';
import type { CommunityPost, PostMedia } from '../types';

const fetchMediaAsFile = async (m: PostMedia): Promise<File> => {
  const response = await fetch(m.file);
  const blob = await response.blob();
  let filename: string;
  try {
    filename = new URL(m.file).pathname.split('/').pop() || `media-${m.id}`;
  } catch {
    filename = `media-${m.id}`;
  }
  return new File([blob], filename, { type: blob.type });
};

interface EditPostModalProps {
  isOpen: boolean;
  post: CommunityPost;
  onClose: () => void;
}

const styles = {
  form: 'space-y-5',
  fieldWrapper: 'space-y-1.5',
  label: 'text-[11px] font-bold text-foreground/50 px-1 uppercase block',
  textarea:
    'w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium resize-none h-40 placeholder:text-foreground/20',
  mediaNote:
    'text-[11px] text-foreground/40 italic px-1',
  errBox: 'p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg',
  footer: 'flex items-center justify-end gap-3 pt-2',
  cancelBtn:
    'px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold text-sm transition-all disabled:opacity-50',
  submit:
    'px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 active:scale-[0.99] transition-all text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed',
};

export function EditPostModal({ isOpen, post, onClose }: EditPostModalProps) {
  const t = useTranslations('Community');
  const { mutateAsync, isPending, error, reset } = useEditPostMutation();
  const [content, setContent] = useState(post.content);
  const [isPreparingMedia, setIsPreparingMedia] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setContent(post.content);
    reset();
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    });
  }, [isOpen, post.content, post.id, reset]);

  const isDirty = content !== post.content;
  const isBusy = isPending || isPreparingMedia;

  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || isBusy) return;
    try {
      setIsPreparingMedia(true);
      const mediaFiles = post.media.length
        ? await Promise.all(post.media.map(fetchMediaAsFile))
        : [];
      setIsPreparingMedia(false);

      await mutateAsync({
        postId: post.id,
        content: content.trim(),
        media: mediaFiles,
      });
      toast.success(t('editPostSuccess'));
      onClose();
    } catch {
      setIsPreparingMedia(false);
      // Error surfaces in the box; modal stays open for retry.
    }
  };

  const errMessage =
    (error as { response?: { data?: { message?: string } }; message?: string } | null)
      ?.response?.data?.message ||
    (error as Error | null)?.message;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('editPostTitle')}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>{t('contentLabel')}</label>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('contentPlaceholder')}
            className={styles.textarea}
          />
        </div>

        {post.media.length > 0 && (
          <p className={styles.mediaNote}>{t('mediaCannotBeEdited')}</p>
        )}

        {error && <p className={styles.errBox}>{errMessage || t('editPostFailed')}</p>}

        <div className={styles.footer}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelBtn}
            disabled={isBusy}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className={styles.submit}
            disabled={!isDirty || isBusy}
          >
            <Save size={16} />
            {isBusy ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
