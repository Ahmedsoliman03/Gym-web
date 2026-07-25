'use client';

import { useRef, useState } from 'react';
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

type SelectedMedia = {
  id: string;
  file: File;
  preview: string;
  mediaType: 'image' | 'video';
  progress: number;
  status: 'uploading' | 'uploaded' | 'failed';
  path?: string;
};

const MAX_MEDIA = 5;

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
  mediaRail: 'flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory',
  mediaBox:
    'relative min-w-[68%] sm:min-w-[48%] aspect-video snap-start rounded-xl overflow-hidden bg-[#0D121F] border border-white/10',
  mediaFill: 'absolute inset-0 w-full h-full object-cover',
  uploadOverlay:
    'absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-10',
  mediaRemove:
    'absolute top-2 right-2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-all',
  mediaRetry:
    'px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold',
  addMore:
    'min-w-[42%] sm:min-w-[30%] aspect-video snap-start rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-foreground/40 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer',
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
  const [media, setMedia] = useState<SelectedMedia[]>([]);
  const mediaRef = useRef<SelectedMedia[]>([]);

  const buildSchema = () =>
    Yup.object({
      content: Yup.string().trim(),
    });

  const clearMedia = () => {
    mediaRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    mediaRef.current = [];
    setMedia([]);
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
              media: mediaRef.current.flatMap((item) => item.path ? [item.path] : []),
            });
            toast.success(t('createPostSuccess'));
            close();
          } catch (err) {
            console.error(err);
          }
        }}
      >
        {({ values }) => {
          const uploadItem = async (id: string) => {
            const selected = mediaRef.current.find((item) => item.id === id);
            if (!selected) return;
            mediaRef.current = mediaRef.current.map((item) =>
              item.id === id ? { ...item, status: 'uploading', progress: 0 } : item
            );
            setMedia(mediaRef.current);
            try {
              const path = await uploadFile(selected.file, 'community_post', (progress) => {
                mediaRef.current = mediaRef.current.map((item) =>
                  item.id === id ? { ...item, progress } : item
                );
                setMedia(mediaRef.current);
              });
              mediaRef.current = mediaRef.current.map((item) =>
                item.id === id ? { ...item, path, status: 'uploaded', progress: 100 } : item
              );
              setMedia(mediaRef.current);
            } catch {
              mediaRef.current = mediaRef.current.map((item) =>
                item.id === id ? { ...item, status: 'failed', progress: 0 } : item
              );
              setMedia(mediaRef.current);
            }
          };

          const handleSelect = (files: FileList | null) => {
            if (!files?.length) return;
            const available = MAX_MEDIA - mediaRef.current.length;
            const accepted = Array.from(files)
              .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
              .slice(0, available);
            if (accepted.length < files.length) toast.error(t('mediaLimit'));
            const added: SelectedMedia[] = accepted.map((file, index) => ({
              id: `${Date.now()}-${index}-${file.name}`,
              file,
              preview: URL.createObjectURL(file),
              mediaType: file.type.startsWith('video/') ? 'video' : 'image',
              progress: 0,
              status: 'uploading',
            }));
            mediaRef.current = [...mediaRef.current, ...added];
            setMedia(mediaRef.current);
            void Promise.all(added.map((item) => uploadItem(item.id)));
          };

          const removeMedia = (id: string) => {
            const selected = mediaRef.current.find((item) => item.id === id);
            if (selected) URL.revokeObjectURL(selected.preview);
            mediaRef.current = mediaRef.current.filter((item) => item.id !== id);
            setMedia(mediaRef.current);
          };

          const isUploadingMedia = media.some((item) => item.status === 'uploading');
          const hasFailedMedia = media.some((item) => item.status === 'failed');

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
                {media.length > 0 ? (
                  <>
                    <span className="block px-1 pb-2 text-xs text-foreground/40">
                      {t('mediaCount', { count: media.length })}
                    </span>
                    <div className={styles.mediaRail}>
                      {media.map((item) => (
                        <div className={styles.mediaBox} key={item.id}>
                          {item.mediaType === 'video' ? (
                            <video src={item.preview} className={styles.mediaFill} muted playsInline controls preload="metadata" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.preview} alt="" className={styles.mediaFill} />
                          )}
                          {item.status === 'uploading' && (
                            <div className={styles.uploadOverlay}>
                              <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                              <span className="text-white text-xs font-bold">
                                {t('uploadingMedia', { progress: item.progress })}
                              </span>
                            </div>
                          )}
                          {item.status === 'failed' && (
                            <div className={styles.uploadOverlay}>
                              <span className="text-red-300 text-xs font-bold">{t('uploadFailed')}</span>
                              <button type="button" className={styles.mediaRetry} onClick={() => uploadItem(item.id)}>
                                {t('retryUpload')}
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            className={styles.mediaRemove}
                            onClick={() => removeMedia(item.id)}
                            aria-label={t('removeMedia')}
                          >
                            <X size={16} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      {media.length < MAX_MEDIA && (
                        <label className={styles.addMore}>
                          <ImageIcon size={24} />
                          <span className="text-xs font-bold">{t('addMoreMedia')}</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              handleSelect(e.currentTarget.files);
                              e.currentTarget.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </>
                ) : (
                  <label className={styles.uploadArea}>
                    <ImageIcon size={28} className={styles.uploadIcon} />
                    <span className={styles.uploadLabel}>{t('mediaHint')}</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleSelect(e.currentTarget.files);
                        e.currentTarget.value = '';
                      }}
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
                disabled={isPending || isUploadingMedia || hasFailedMedia || (!values.content.trim() && media.length === 0)}
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
