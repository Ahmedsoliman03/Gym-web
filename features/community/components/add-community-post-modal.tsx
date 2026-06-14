'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Image as ImageIcon, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { LiveValidate } from '@/components/shared/live-validate';
import { useCreatePostMutation } from '../services/community.service';

interface AddCommunityPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = {
  form: 'space-y-5',
  fieldWrapper: 'space-y-1.5',
  label: 'text-[11px] font-bold text-foreground/50 px-1 uppercase block',
  textarea:
    'w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium resize-none h-40 placeholder:text-foreground/20',
  error: 'text-red-500 text-[10px] mt-1 px-1 font-medium',
  uploadArea:
    'relative w-full py-8 px-4 bg-[#0D121F] border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group',
  uploadIcon: 'text-foreground/20 group-hover:text-primary/40 transition-colors',
  uploadLabel:
    'text-sm text-foreground/40 font-medium group-hover:text-primary/60 transition-colors',
  thumbsGrid: 'grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3',
  thumb:
    'relative aspect-square rounded-lg overflow-hidden bg-[#0D121F] border border-white/5',
  thumbImg: 'absolute inset-0 w-full h-full object-cover',
  thumbRemove:
    'absolute top-1.5 right-1.5 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-all',
  submit:
    'w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-black hover:opacity-90 active:scale-[0.99] transition-all text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed',
  errBox:
    'p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg',
};

export function AddCommunityPostModal({ isOpen, onClose }: AddCommunityPostModalProps) {
  const t = useTranslations('Community');
  const { mutateAsync, isPending, error, reset } = useCreatePostMutation();
  const [previews, setPreviews] = useState<string[]>([]);

  // Neither content nor media is required on its own — but the post must have
  // at least one of them, otherwise the publish button stays disabled.
  const buildSchema = () =>
    Yup.object({
      content: Yup.string().trim(),
      media: Yup.array().of(Yup.mixed()).nullable(),
    });

  const close = () => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews([]);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={t('createPostTitle')}>
      <Formik
        initialValues={{ content: '', media: [] as File[] }}
        validationSchema={buildSchema()}
        onSubmit={async (values) => {
          await mutateAsync({ content: values.content.trim(), media: values.media });
          toast.success(t('createPostSuccess'));
          close();
        }}
      >
        {({ setFieldValue, values }) => {
          const handleFiles = (files: FileList | null) => {
            if (!files) return;
            const incoming = Array.from(files);
            previews.forEach((u) => URL.revokeObjectURL(u));
            const next = [...values.media, ...incoming];
            setFieldValue('media', next);
            setPreviews(next.map((f) => URL.createObjectURL(f)));
          };

          const removeAt = (index: number) => {
            const nextFiles = values.media.filter((_, i) => i !== index);
            URL.revokeObjectURL(previews[index]);
            setFieldValue('media', nextFiles);
            setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
          };

          return (
            <Form className={styles.form}>
              <LiveValidate />
              <div className={styles.fieldWrapper}>
                <label className={styles.label}>{t('contentLabel')}</label>
                <Field
                  as="textarea"
                  name="content"
                  placeholder={t('contentPlaceholder')}
                  className={styles.textarea}
                />
                <ErrorMessage name="content" component="p" className={styles.error} />
              </div>

              <div className={styles.fieldWrapper}>
                <label className={styles.label}>{t('mediaLabel')}</label>
                <label className={styles.uploadArea}>
                  <ImageIcon size={28} className={styles.uploadIcon} />
                  <span className={styles.uploadLabel}>{t('mediaHint')}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.currentTarget.files)}
                  />
                </label>

                {previews.length > 0 && (
                  <div className={styles.thumbsGrid}>
                    {previews.map((url, i) => {
                      const isVideo = values.media[i]?.type.startsWith('video/');
                      return (
                        <div key={url} className={styles.thumb}>
                          {isVideo ? (
                            <video
                              src={url}
                              className={styles.thumbImg}
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt="" className={styles.thumbImg} />
                          )}
                          <button
                            type="button"
                            className={styles.thumbRemove}
                            onClick={() => removeAt(i)}
                            aria-label={t('removeMedia')}
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {error && (
                <p className={styles.errBox}>
                  {(error as { response?: { data?: { message?: string } }; message?: string })
                    ?.response?.data?.message ||
                    (error as Error).message ||
                    t('createPostFailed')}
                </p>
              )}

              <button
                type="submit"
                className={styles.submit}
                disabled={isPending || (!values.content.trim() && values.media.length === 0)}
              >
                <Send size={16} />
                {isPending ? t('publishing') : t('publish')}
              </button>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
