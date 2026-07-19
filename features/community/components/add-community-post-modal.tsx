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
import { useR2Upload } from '@/hooks/use-r2-upload';

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
    'relative w-full min-h-[14rem] py-8 px-4 bg-[#0D121F] border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group',
  uploadIcon: 'text-foreground/20 group-hover:text-primary/40 transition-colors',
  uploadLabel:
    'text-sm text-foreground/40 font-medium group-hover:text-primary/60 transition-colors',
  // Selected media fills the input area itself (single image or video).
  mediaBox:
    'relative w-full min-h-[14rem] h-56 rounded-xl overflow-hidden bg-[#0D121F] border border-white/10',
  mediaFill: 'absolute inset-0 w-full h-full object-cover',
  uploadOverlay:
    'absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-10',
  mediaRemove:
    'absolute top-2 right-2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-all',
  submit:
    'w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-black hover:opacity-90 active:scale-[0.99] transition-all text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed',
  errBox:
    'p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg',
};

export function AddCommunityPostModal({ isOpen, onClose }: AddCommunityPostModalProps) {
  const t = useTranslations('Community');
  const { mutateAsync, isPending, error, reset } = useCreatePostMutation();
  const { uploadFile } = useR2Upload();
  // A post carries a single image OR video (or none — content-only is allowed).
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaPath, setMediaPath] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const buildSchema = () =>
    Yup.object({
      content: Yup.string().trim(),
    });

  const clearMedia = () => {
    setPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setMediaType(null);
    setMediaPath('');
    setUploadProgress(null);
  };

  const close = () => {
    clearMedia();
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={t('createPostTitle')}>
      <Formik
        initialValues={{ content: '' }}
        validationSchema={buildSchema()}
        onSubmit={async (values) => {
          try {
            await mutateAsync({
              content: values.content.trim(),
              media: mediaPath ? [mediaPath] : [],
            });
            toast.success(t('createPostSuccess'));
            close();
          } catch (err) {
            console.error(err);
          }
        }}
      >
        {({ values }) => {
          // Single media per post — a new selection replaces the previous one.
          const handleSelect = async (files: FileList | null) => {
            const file = files?.[0];
            if (!file) return;

            clearMedia();
            const blob = URL.createObjectURL(file);
            setPreview(blob);
            setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
            setUploadProgress(0);
            try {
              const path = await uploadFile(file, 'community_post', (percent) =>
                setUploadProgress(percent)
              );
              setMediaPath(path);
            } catch {
              toast.error('Upload failed');
              clearMedia();
            } finally {
              setUploadProgress(null);
            }
          };

          const isUploadingMedia = uploadProgress !== null;

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
                {preview ? (
                  <div className={styles.mediaBox}>
                    {mediaType === 'video' ? (
                      <video
                        src={preview}
                        className={styles.mediaFill}
                        muted
                        playsInline
                        controls
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" className={styles.mediaFill} />
                    )}
                    {isUploadingMedia ? (
                      <div className={styles.uploadOverlay}>
                        <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-white text-xs font-bold">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.mediaRemove}
                        onClick={clearMedia}
                        aria-label={t('removeMedia')}
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className={styles.uploadArea}>
                    <ImageIcon size={28} className={styles.uploadIcon} />
                    <span className={styles.uploadLabel}>{t('mediaHint')}</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleSelect(e.currentTarget.files)}
                    />
                  </label>
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
                disabled={isPending || isUploadingMedia || (!values.content.trim() && !mediaPath)}
              >
                <Send size={16} />
                {isPending ? t('publishing') : isUploadingMedia ? 'Uploading…' : t('publish')}
              </button>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
