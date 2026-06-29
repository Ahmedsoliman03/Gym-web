import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SpecializationSelect } from '@/features/jobs/components/specialization-select';
import { PostImageUpload } from '@/components/shared/post-image-upload';
import { LiveValidate } from '@/components/shared/live-validate';

interface JobOpeningFormProps {
  onSubmit: (values: {
    title: string;
    specialization: string;
    desc: string;
    image: File | null;
  }) => void;
}

const styles = {
  form: "space-y-6",
  fieldWrapper: "space-y-1.5",
  label: "text-[11px] font-bold text-foreground/50 px-1 uppercase block",
  input: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium placeholder:text-foreground/20",
  textarea: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium resize-none h-36 placeholder:text-foreground/20",
  error: "text-red-500 text-[10px] mt-1 px-1 font-medium",
  submitBtn: "w-full py-4 bg-primary text-primary-foreground rounded-xl font-black hover:opacity-90 active:scale-[0.99] transition-all text-sm uppercase flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(34,197,94,0.2)] border-0 cursor-pointer outline-none",
};

const buildJobSchema = (t: (k: string) => string) =>
  Yup.object({
    title: Yup.string().required(t('fieldRequired')),
    specialization: Yup.string().required(t('fieldRequired')),
    desc: Yup.string().required(t('fieldRequired')),
    image: Yup.mixed().nullable(),
  });

export function JobOpeningForm({ onSubmit }: JobOpeningFormProps) {
  const t = useTranslations('Jobs');

  return (
    <Formik
      initialValues={{
        title: '',
        specialization: '',
        desc: '',
        image: null as File | null,
      }}
      validationSchema={buildJobSchema(t)}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className={styles.form}>
          <LiveValidate />
          {/* Title */}
          <div className={styles.fieldWrapper}>
            <label className={styles.label}>{t('postTitle')}</label>
            <Field name="title" className={styles.input} placeholder={t('postTitlePlaceholder')} />
            <ErrorMessage name="title" component="p" className={styles.error} />
          </div>

          {/* Specialization */}
          <div className={styles.fieldWrapper}>
            <label className={styles.label}>{t('postSpecialization')}</label>
            <SpecializationSelect
              value={values.specialization}
              onChange={(val) => setFieldValue('specialization', val)}
              placeholder={t('postSpecializationPlaceholder')}
            />
            <ErrorMessage name="specialization" component="p" className={styles.error} />
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
          <PostImageUpload
            value={values.image}
            onChange={(file) => setFieldValue('image', file)}
          />

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            <Zap size={18} fill="currentColor" />
            {t('publishPost')}
          </button>
        </Form>
      )}
    </Formik>
  );
}
