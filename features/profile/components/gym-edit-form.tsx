"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Save } from "lucide-react";
import toast from "react-hot-toast";

import { useRouter } from "@/i18n/routing";
import {
  useUnsavedChangesWarning,
  serializeFormState,
} from "@/hooks/use-unsaved-changes-warning";
import { GalleryEditor } from "./gallery-editor";
import {
  PlansEditor,
  validatePlans,
  type PlanErrors,
} from "@/components/shared/plans-editor";
import { SocialMediaEditor, hasIncompleteSocialLinks } from "./social-media-editor";
import { CustomMultiSelect } from "@/components/shared/custom-multi-select";
import { SPECIALIZATIONS } from "@/constants/specializations";
import { formStyles as styles } from "@/components/shared/form-styles";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toastApiError } from "@/utils/toast-api-error";
import { useProfileSaveGuard } from "../hooks/use-profile-save-guard";
import type {
  EditableImage,
  GymEditFormProps,
  ProfilePlan,
} from "../types";
import {
  buildEditProfileFormData,
  useUpdateProfileMutation,
} from "../services/profile.service";
import { useR2Upload } from "@/hooks/use-r2-upload";

export const GymEditForm = ({ profile }: GymEditFormProps) => {
  const t = useTranslations("Profile");
  const t_root = useTranslations();
  const router = useRouter();
  const updateMutation = useUpdateProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, uploadProgress } = useR2Upload();

  const inner = profile.profile;
  const initialPhoto = inner?.mainPhoto ?? inner?.photo ?? null;

  const [formData, setFormData] = useState({
    name: inner?.gymName ?? profile.fullName ?? '',
    description: inner?.description ?? '',
    specializations: inner?.specializations ?? [],
    gymImages: (inner?.images ?? []).map<EditableImage>((g) => ({
      id: g.id,
      url: g.image,
    })),
    socialMedia: inner?.socialMedia ?? [],
    plans: (inner?.plans ?? []) as ProfilePlan[],
  });
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState<string | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialPhoto);
  const [planErrors, setPlanErrors] = useState<PlanErrors>({});

  // Warn before leaving with unsaved edits.
  const initialSnapshotRef = useRef(serializeFormState(formData));
  const isDirty =
    uploadedPhotoPath !== null ||
    serializeFormState(formData) !== initialSnapshotRef.current;
  useUnsavedChangesWarning(isDirty);

  const newlyAdding = {
    profile_images: formData.gymImages.filter((g) => g.file && !g.id).length,
  };
  const saveGuard = useProfileSaveGuard(true, newlyAdding);
  const [showLastEditWarn, setShowLastEditWarn] = useState(false);
  const pendingPlansRef = useRef<ProfilePlan[] | null>(null);

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';

    try {
      const path = await uploadFile(file, 'gym_photo');
      setUploadedPhotoPath(path);
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const performSave = async (sanitized: ProfilePlan[]) => {
    try {
      // All uploads (photo, gallery images) were handled at selection time.
      const existingGymImageIds = formData.gymImages.filter(g => !!g.id).map(g => g.id!);
      const newGymImagePaths = formData.gymImages.filter(g => !g.id && !!g.url).map(g => g.url!);

      const payloadValues: Record<string, any> = {
        name: formData.name,
        description: formData.description,
        specializations: formData.specializations,
        socialMedia: formData.socialMedia,
        plans: sanitized,
      };

      if (uploadedPhotoPath) payloadValues.image = uploadedPhotoPath;
      
      const combinedGymImages = [
        ...existingGymImageIds.map(id => ({ id })),
        ...newGymImagePaths.map(file => ({ file }))
      ];
      payloadValues.gymImages = combinedGymImages;

      const payload = buildEditProfileFormData({
        role: 'gym',
        values: payloadValues,
      });

      await updateMutation.mutateAsync(payload);
      toast.success(t('saveSuccess'));
      router.push('/profile');
    } catch (err: unknown) {
      // feature_limit_exceeded → friendly localized toast (see toastApiError).
      toastApiError(err, t('saveFailed'));
    }
  };

  const handleSave = () => {
    if (updateMutation.isPending || isUploading || galleryUploading) return;
    const { sanitized, errors, hasErrors } = validatePlans(formData.plans);
    if (hasErrors) {
      setPlanErrors(errors);
      return;
    }
    if (hasIncompleteSocialLinks(formData.socialMedia)) {
      toast.error(t('completeSocialLinks'));
      return;
    }
    setPlanErrors({});
    // Last edit + unused gallery slots → confirm before spending it.
    if (saveGuard.shouldWarn) {
      pendingPlansRef.current = sanitized;
      setShowLastEditWarn(true);
      return;
    }
    void performSave(sanitized);
  };

  const confirmLastEditSave = () => {
    setShowLastEditWarn(false);
    void performSave(pendingPlansRef.current ?? []);
  };

  const slotSummary = saveGuard.unusedSlots
    .map((s) => {
      const key = `slotCount_${s.code}`;
      return t.has(key) ? t(key, { count: s.remaining }) : `${s.remaining} ${s.name}`;
    })
    .join(', ');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.titleLabel}>{t('editProfile')}</h1>
          <p className={styles.subtitle}>{t('editSubtitle')}</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.imageUpload}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <div className={styles.avatarCircle} onClick={triggerFileInput}>
            <div className={styles.avatarInner}>
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Profile" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>{t('noImage')}</div>
              )}
              {isUploading ? (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs rounded-full z-10">
                  {uploadProgress}%
                </div>
              ) : (
                <div className={styles.avatarOverlay}>
                  <Camera className="text-white" size={24} />
                </div>
              )}
            </div>
          </div>
          <div className={styles.photoTextContent}>
            <h3 className={styles.photoTitle}>{t('profilePhoto')}</h3>
            <p className={styles.photoSubtitle}>{t('clickChangeAvatar')}</p>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className={styles.sectionTitle}>{t('basicInfo')}</h2>
          <div className={styles.fieldGroup}>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('gymName')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('detailedDescription')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={`${styles.inputWrapper} md:col-span-2`}>
              <label className={styles.label}>{t('specializations')}</label>
              <CustomMultiSelect
                value={formData.specializations}
                onChange={(vals) =>
                  setFormData((prev) => ({ ...prev, specializations: vals }))
                }
                options={SPECIALIZATIONS.map((spec) => ({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label: t_root(spec.label as any) || spec.fallback,
                  value: spec.value,
                }))}
                placeholder={t_root('Auth.primarySpecialization')}
              />
            </div>
          </div>
        </div>

        <GalleryEditor
          images={formData.gymImages}
          onChange={(next) => setFormData((prev) => ({ ...prev, gymImages: next }))}
          onUploadingChange={setGalleryUploading}
        />

        <SocialMediaEditor
          links={formData.socialMedia}
          onChange={(next) => setFormData((prev) => ({ ...prev, socialMedia: next }))}
        />

        <PlansEditor
          plans={formData.plans}
          errors={planErrors}
          onChange={(next) => {
            setFormData((prev) => ({ ...prev, plans: next as ProfilePlan[] }));
            if (Object.keys(planErrors).length > 0) setPlanErrors({});
          }}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || isUploading || galleryUploading}
          className={styles.saveBtn}
        >
          <Save size={18} />
          {updateMutation.isPending
            ? t('saving')
            : isUploading
              ? `Uploading ${uploadProgress}%`
              : galleryUploading
                ? 'Uploading...'
                : t('saveProfile')}
        </button>
        <button onClick={() => router.back()} className={styles.cancelBtn}>
          {t('cancelChanges')}
        </button>
      </div>

      <ConfirmDialog
        isOpen={showLastEditWarn}
        tone="primary"
        title={t('lastEditTitle')}
        body={t('lastEditBody', { slots: slotSummary })}
        cancelLabel={t('lastEditCancel')}
        confirmLabel={t('lastEditConfirm')}
        submittingLabel={t('saving')}
        isSubmitting={updateMutation.isPending}
        onCancel={() => setShowLastEditWarn(false)}
        onConfirm={confirmLastEditSave}
      />
    </div>
  );
};
