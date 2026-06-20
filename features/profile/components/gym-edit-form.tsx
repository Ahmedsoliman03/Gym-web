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
import type {
  EditableImage,
  GymEditFormProps,
  ProfilePlan,
} from "../types";
import {
  buildEditProfileFormData,
  useUpdateProfileMutation,
} from "../services/profile.service";

export const GymEditForm = ({ profile }: GymEditFormProps) => {
  const t = useTranslations("Profile");
  const t_root = useTranslations();
  const router = useRouter();
  const updateMutation = useUpdateProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialPhoto);
  // Plan-row validation errors, set after a failed save attempt and cleared
  // whenever the user touches the plans list again.
  const [planErrors, setPlanErrors] = useState<PlanErrors>({});

  // Warn before leaving with unsaved edits.
  const initialSnapshotRef = useRef(serializeFormState(formData));
  const isDirty =
    photoFile !== null ||
    serializeFormState(formData) !== initialSnapshotRef.current;
  useUnsavedChangesWarning(isDirty);

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSave = async () => {
    if (updateMutation.isPending) return;
    // Drop blank rows and enforce required fields on touched ones before
    // building the FormData — the API never sees half-finished plan cards.
    const { sanitized, errors, hasErrors } = validatePlans(formData.plans);
    if (hasErrors) {
      // No toast — the inline "Required" labels plus the shake animation
      // on the offending plan cards are the only feedback the user needs.
      setPlanErrors(errors);
      return;
    }
    if (hasIncompleteSocialLinks(formData.socialMedia)) {
      toast.error(t('completeSocialLinks'));
      return;
    }
    setPlanErrors({});
    const payload = buildEditProfileFormData({
      role: 'gym',
      values: {
        name: formData.name,
        image: photoFile,
        description: formData.description,
        specializations: formData.specializations,
        gymImages: formData.gymImages,
        socialMedia: formData.socialMedia,
        plans: sanitized,
      },
    });
    try {
      await updateMutation.mutateAsync(payload);
      toast.success(t('saveSuccess'));
      router.push('/profile');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } } | undefined)
          ?.response?.data?.message ?? t('saveFailed');
      toast.error(message);
    }
  };

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
              <div className={styles.avatarOverlay}>
                <Camera className="text-white" size={24} />
              </div>
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
            // Clear stale errors as soon as the user edits anything in the
            // plans list — re-validation runs again on the next Save click.
            if (Object.keys(planErrors).length > 0) setPlanErrors({});
          }}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className={styles.saveBtn}
        >
          <Save size={18} />
          {updateMutation.isPending ? t('saving') : t('saveProfile')}
        </button>
        <button onClick={() => router.back()} className={styles.cancelBtn}>
          {t('cancelChanges')}
        </button>
      </div>
    </div>
  );
};
