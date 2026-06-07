'use client';

import { Formik, Form, Field } from 'formik';
import { MapPin, ImageIcon, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { useEditJobMutation } from '../services/jobs.service';
import type { Job } from '../types';

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  formWrapper: "space-y-5",
  label: "text-[11px] font-bold text-foreground/50 px-1 uppercase mb-2 flex items-center gap-1.5",
  lockIcon: "text-foreground/20",
  // Disabled (read-only) fields
  disabledInput: "w-full px-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-foreground/30 text-sm font-medium cursor-not-allowed select-none",
  disabledTextarea: "w-full px-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-foreground/30 text-sm font-medium cursor-not-allowed select-none h-20 resize-none",
  disabledBadge: "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-foreground/20 bg-white/3 border border-white/5 px-2 py-0.5 rounded-full ml-auto",
  // Active editable field
  input: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
  textarea: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium resize-none h-32",
  // Image read-only preview
  imageWrapper: "relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-white/5 cursor-not-allowed",
  imagePreview: "w-full h-full object-cover opacity-40",
  imageOverlay: "absolute inset-0 flex items-center justify-center gap-2 text-foreground/30 text-xs font-bold uppercase tracking-wide",
  submitButton: "w-full py-4 bg-primary text-black rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase",
  sectionDivider: "text-[10px] font-black text-primary/60 uppercase tracking-widest pb-1 border-b border-white/5",
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface EditJobModalProps {
  job: Job | null;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function EditJobModal({ job, onClose }: EditJobModalProps) {
  const t = useTranslations('Jobs');
  const editMutation = useEditJobMutation();

  if (!job) return null;

  return (
    <Modal isOpen={!!job} onClose={onClose} title={t('editPostTitle')}>
      <Formik
        initialValues={{ content: job?.content || '' }}
        enableReinitialize
        onSubmit={async (values) => {
          try {
            await editMutation.mutateAsync({
              jobId: job.id,
              content: values.content,
            });
            toast.success(t('editSuccess'));
            onClose();
          } catch {
            toast.error(t('editFailed'));
          }
        }}
      >
        {() => (
          <Form className={styles.formWrapper}>

            {/* ── Read-only section ── */}
            <p className={styles.sectionDivider}>{t('editReadOnly')}</p>

            {/* Title — disabled */}
            <div>
              <label className={styles.label}>
                {t('postTitle')}
                <Lock size={10} className={styles.lockIcon} />
                <span className={styles.disabledBadge}>
                  <Lock size={8} /> {t('readOnly')}
                </span>
              </label>
              <div className={styles.disabledInput}>{job.title}</div>
            </div>

            {/* Location — disabled */}
            <div>
              <label className={styles.label}>
                <MapPin size={11} />
                {t('postLocation')}
                <Lock size={10} className={styles.lockIcon} />
              </label>
              <div className={styles.disabledInput}>{job.location}</div>
            </div>
            {/* ── Editable section ── */}
            <p className={styles.sectionDivider}>{t('editEditable')}</p>

            {/* Content — editable */}
            <div>
              <label className={styles.label}>{t('postContent')}</label>
              <Field
                as="textarea"
                name="content"
                className={styles.textarea}
              />
            </div>
            {/* Current image — read-only preview */}
            <div>
              <label className={styles.label}>
                {t('currentImage')}
                <Lock size={10} className={styles.lockIcon} />
              </label>
              <div className={styles.imageWrapper}>
                {job.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.image} alt={job.title} className={styles.imagePreview} />
                ) : null}
                <div className={styles.imageOverlay}>
                  <ImageIcon size={16} />
                  {t('readOnly')}
                </div>
              </div>
            </div>



            <button
              type="submit"
              className={styles.submitButton}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? t('saving') : t('saveChanges')}
            </button>

          </Form>
        )}
      </Formik>
    </Modal>
  );
}
