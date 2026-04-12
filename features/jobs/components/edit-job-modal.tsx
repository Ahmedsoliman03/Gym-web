'use client';

import { Formik, Form, Field } from 'formik';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/modal';

interface EditJobModalProps {
    job: any;
    onClose: () => void;
}

const styles = {
    formWrapper: "space-y-6",
    input: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
    label: "text-[11px] font-bold text-foreground/50 px-1 uppercase mb-2 block",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase",
    uploadContainer: "relative w-full py-6 px-4 bg-[#0D121F] border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group"
};

export function EditJobModal({ job, onClose }: EditJobModalProps) {
    const t = useTranslations('Jobs');

    if (!job) return null;

    return (
        <Modal 
            isOpen={!!job} 
            onClose={onClose} 
            title={t('editPostTitle')}
        >
            <Formik
                initialValues={{
                    description: job?.description || '',
                    image: null
                }}
                enableReinitialize
                onSubmit={(values) => {
                    console.log('Update post:', job.id, values);
                    onClose();
                }}
            >
                {({ setFieldValue, values }) => (
                    <Form className={styles.formWrapper}>
                        <div>
                            <label className={styles.label}>{t('postContent')}</label>
                            <Field 
                                as="textarea" 
                                name="description" 
                                className={`${styles.input} h-32 resize-none`} 
                            />
                        </div>
                        <div>
                            <label className={styles.label}>{t('postImage')}</label>
                            <div 
                                className={styles.uploadContainer}
                                onClick={() => {
                                    const input = document.getElementById('edit-image-upload') as HTMLInputElement;
                                    input?.click();
                                }}
                            >
                                <input 
                                    id="edit-image-upload"
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => setFieldValue('image', e.currentTarget.files?.[0])}
                                />
                                <Upload className="text-foreground/20" />
                                <span className="text-xs text-foreground/40 font-medium">
                                    {values.image ? (values.image as File).name : t('postImage')}
                                </span>
                            </div>
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            {t('saveChanges')}
                        </button>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
