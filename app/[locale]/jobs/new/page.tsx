'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  ImageIcon, ArrowLeft, Zap, X,
} from 'lucide-react';
import { useLocationDetect } from '@/hooks/use-location-detect';
import { LocationDetectButton } from '@/components/ui/location-detect-button';

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page:          "pt-24 pb-16 px-6 md:px-12 min-h-screen",
  inner:         "max-w-3xl mx-auto",
  backLink:      "inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors mb-8 group cursor-pointer",
  backIcon:      "group-hover:-translate-x-0.5 transition-transform",
  heading:       "text-4xl md:text-5xl font-headline font-black text-foreground mb-2",
  subheading:    "text-foreground/50 mb-10",
  form:          "space-y-6",
  fieldWrapper:  "space-y-1.5",
  label:         "text-[11px] font-bold text-foreground/50 px-1 uppercase block",
  optionalBadge: "text-[9px] font-bold text-foreground/30 normal-case tracking-normal ml-1",
  input:         "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium placeholder:text-foreground/20",
  textarea:      "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium resize-none h-36 placeholder:text-foreground/20",
  error:         "text-red-500 text-[10px] mt-1 px-1 font-medium",
  locationRow:   "flex gap-3",
  locationInput: "flex-1 px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl outline-none text-foreground text-sm font-medium placeholder:text-foreground/20",
  // Upload area
  uploadArea:    "relative w-full aspect-video bg-[#0D121F] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group overflow-hidden",
  uploadIcon:    "text-foreground/20 group-hover:text-primary/40 transition-colors",
  uploadLabel:   "text-sm text-foreground/40 font-medium group-hover:text-primary/60 transition-colors",
  uploadPreview: "absolute inset-0 w-full h-full object-cover",
  uploadOverlay: "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
  uploadChange:  "text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-lg backdrop-blur",
  removeBtn:     "absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-all backdrop-blur-sm",
  submitBtn:     "w-full py-4 bg-primary text-primary-foreground rounded-xl font-black hover:opacity-90 active:scale-[0.99] transition-all text-sm uppercase flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(34,197,94,0.2)]",
};

// ─── Validation — image is now optional ────────────────────────────────────────

const buildSchema = (t: (k: string) => string) =>
  Yup.object({
    title:    Yup.string().required(t('fieldRequired')),
    location: Yup.string().required(t('fieldRequired')),
    desc:     Yup.string().required(t('fieldRequired')),
    image:    Yup.mixed().nullable(), // optional
  });

// ─── Page component ────────────────────────────────────────────────────────────

export default function NewJobPage() {
  const t = useTranslations('Jobs');
  const router = useRouter();
  const locale = useLocale();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Controlled location state
  const [locationValue, setLocationValue] = useState('');

  // Ref so the detect callback can always reach the latest setFieldValue
  const setFieldValueRef = useRef<((field: string, value: any) => void) | null>(null);

  const { status: locStatus, error: locError, detect } = useLocationDetect(
    useCallback((result) => {
      const parts = [result.area, result.city, result.governorate].filter(Boolean);
      const loc = parts.join(', ');
      setLocationValue(loc);
      // Sync into Formik so validation clears immediately
      setFieldValueRef.current?.('location', loc);
    }, [])
  );



  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Back */}
        <button className={styles.backLink} onClick={() => router.push(`/${locale}/jobs`)}>
          <ArrowLeft size={16} className={styles.backIcon} />
          {t('backToJobs')}
        </button>

        {/* Heading */}
        <h1 className={styles.heading}>{t('addPost')}</h1>
        <p className={styles.subheading}>{t('addPostDesc')}</p>

        {/* Form */}
        <Formik
          initialValues={{ title: '', location: '', desc: '', image: null as File | null }}
          validationSchema={buildSchema(t)}
          onSubmit={(values) => {
            console.log('New post:', { ...values, location: locationValue });
            router.push(`/${locale}/jobs`);
          }}
        >
          {({ setFieldValue, isSubmitting }) => {
            // Keep the ref up-to-date every render
            setFieldValueRef.current = setFieldValue;

            return (
              <Form className={styles.form}>

                {/* Title */}
                <div className={styles.fieldWrapper}>
                  <label className={styles.label}>{t('postTitle')}</label>
                  <Field name="title" className={styles.input} placeholder={t('postTitlePlaceholder')} />
                  <ErrorMessage name="title" component="p" className={styles.error} />
                </div>

                {/* Location */}
                <div className={styles.fieldWrapper}>
                  <label className={styles.label}>{t('postLocation')}</label>
                  <div className={styles.locationRow}>
                    <Field
                      name="location"
                      className={styles.locationInput}
                      placeholder={t('postLocationPlaceholder')}
                      value={locationValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setLocationValue(e.target.value);
                        setFieldValue('location', e.target.value);
                      }}
                    />
                    <LocationDetectButton 
                      status={locStatus}
                      error={locError}
                      onClick={detect}
                      className="w-auto" // Optional: to prevent it from growing too wide if not needed
                    />
                  </div>
                  <ErrorMessage name="location" component="p" className={styles.error} />
                </div>

                {/* Description */}
                <div className={styles.fieldWrapper}>
                  <label className={styles.label}>{t('postContent')}</label>
                  <Field
                    as="textarea"
                    name="desc"
                    className={styles.textarea}
                    placeholder={t('postDescPlaceholder')}
                  />
                  <ErrorMessage name="desc" component="p" className={styles.error} />
                </div>

                {/* Photo upload — optional */}
                <div className={styles.fieldWrapper}>
                  <label className={styles.label}>
                    {t('postImage')}
                    <span className={styles.optionalBadge}>({t('optional')})</span>
                  </label>

                  <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                    {preview ? (
                      <>
                        <img src={preview} alt="preview" className={styles.uploadPreview} />
                        <div className={styles.uploadOverlay}>
                          <span className={styles.uploadChange}>{t('changeImage')}</span>
                        </div>
                        {/* Remove button */}
                        <button
                          type="button"
                          className={styles.removeBtn}
                          title={t('removeImage')}
                          onClick={(e) => {
                            e.stopPropagation(); // don't open file picker
                            setPreview(null);
                            setFieldValue('image', null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
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
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] ?? null;
                        setFieldValue('image', file);
                        if (file) setPreview(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  <Zap size={18} fill="currentColor" />
                  {t('publishPost')}
                </button>

              </Form>
            );
          }}
        </Formik>

      </div>
    </div>
  );
}
