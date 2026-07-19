"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, Save, X, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { useRouter } from "@/i18n/routing";
import {
  useUnsavedChangesWarning,
  serializeFormState,
} from "@/hooks/use-unsaved-changes-warning";
import { SPECIALIZATIONS } from "@/constants/specializations";
import { formStyles as styles } from "@/components/shared/form-styles";
import { TransformationEditor } from "./transformation-editor";
import { GalleryEditor } from "./gallery-editor";
import {
  PlansEditor,
  validatePlans,
  type PlanErrors,
} from "@/components/shared/plans-editor";
import { SocialMediaEditor, hasIncompleteSocialLinks } from "./social-media-editor";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toastApiError } from "@/utils/toast-api-error";
import { useProfileSaveGuard } from "../hooks/use-profile-save-guard";
import type {
  CoachEditFormProps,
  EditableImage,
  ProfilePlan,
  TransformationItem,
} from "../types";
import {
  buildEditProfileFormData,
  useUpdateProfileMutation,
} from "../services/profile.service";
import { useR2Upload } from "@/hooks/use-r2-upload";

export const CoachEditForm = ({ profile }: CoachEditFormProps) => {
  const t = useTranslations("Profile");
  const t_root = useTranslations();
  const router = useRouter();
  const updateMutation = useUpdateProfileMutation();
  const { uploadFile, isUploading, uploadProgress } = useR2Upload();

  const [showAddTag, setShowAddTag] = useState<string | null>(null);
  const [pendingSpecs, setPendingSpecs] = useState<string[]>([]);
  const specMenuRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (specMenuRef.current && !specMenuRef.current.contains(event.target as Node)) {
        setShowAddTag(null);
        setPendingSpecs([]);
      }
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setShowAddTag(null);
      }
    };
    if (showAddTag) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddTag]);

  const togglePendingSpec = (spec: string) => {
    setPendingSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  const inner = profile.profile;
  const initialPhoto = inner?.photo ?? inner?.profileImage ?? null;
  const translateSpecializationLabel = (label: string) =>
    t_root(label as Parameters<typeof t_root>[0]);

  const initialFullName = (profile.fullName ?? inner?.name ?? '').trim();
  const firstSpace = initialFullName.indexOf(' ');
  const initialFirstName =
    firstSpace === -1 ? initialFullName : initialFullName.slice(0, firstSpace);
  const initialLastName =
    firstSpace === -1 ? '' : initialFullName.slice(firstSpace + 1).trim();

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    philosophyDesc: inner?.description ?? '',
    specializations: inner?.specializations ?? [],
    certifications: (inner?.certifications ?? []).map<EditableImage>((c) => ({
      id: c.id,
      url: c.file,
    })),
    socialMedia: inner?.socialMedia ?? [],
    plans: (inner?.plans ?? []) as ProfilePlan[],
    transformations: (inner?.transformations ?? []).map<TransformationItem>((tr) => ({
      id: tr.id,
      name: tr.clientName,
      duration: tr.duration ?? '',
      image: tr.image,
    })),
  });
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialPhoto);
  const [planErrors, setPlanErrors] = useState<PlanErrors>({});

  const initialSnapshotRef = useRef(serializeFormState(formData));
  const isDirty =
    uploadedPhotoPath !== null ||
    serializeFormState(formData) !== initialSnapshotRef.current;
  useUnsavedChangesWarning(isDirty);

  const newlyAdding = {
    certifications: formData.certifications.filter((c) => c.url && !c.id).length,
    transformation_photos: formData.transformations.filter(
      (tr) => typeof tr.image === 'string' && tr.image.startsWith('temp/'),
    ).length,
  };
  const saveGuard = useProfileSaveGuard(true, newlyAdding);
  const [showLastEditWarn, setShowLastEditWarn] = useState(false);
  const pendingPlansRef = useRef<ProfilePlan[] | null>(null);

  const handleInputChange = (
    field: 'firstName' | 'lastName' | 'philosophyDesc',
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';

    setPhotoUploading(true);
    try {
      const path = await uploadFile(file, 'profile_photo');
      setUploadedPhotoPath(path);
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleRemoveSpec = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((t) => t !== tag),
    }));
  };

  const performSave = async (sanitized: ProfilePlan[]) => {
    try {
      // All uploads (photo, certifications, transformations) were handled at selection time.
      const existingCertIds = formData.certifications.filter(c => !!c.id).map(c => c.id!);
      const newCertPaths = formData.certifications.filter(c => !c.id && !!c.url).map(c => c.url!);

      const name = [formData.firstName, formData.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' ');

      const payloadValues: Record<string, any> = {
        name,
        philosophyDesc: formData.philosophyDesc,
        specializations: formData.specializations,
        socialMedia: formData.socialMedia,
        plans: sanitized,
        transformations: formData.transformations.map((tr) => ({
          id: tr.id,
          clientName: tr.name,
          duration: tr.duration,
          image: tr.image,
        })),
      };

      if (uploadedPhotoPath) payloadValues.image = uploadedPhotoPath;
      
      const combinedCerts = [
        ...existingCertIds.map(id => ({ id })),
        ...newCertPaths.map(file => ({ file }))
      ];
      payloadValues.certifications = combinedCerts;

      const payload = buildEditProfileFormData({
        role: 'coach',
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
    if (updateMutation.isPending) return;

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
    // Last edit + unused profile slots → confirm before spending it.
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
              {photoUploading ? (
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
              <label className={styles.label}>{t('firstName')}</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('lastName')}</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <div className={styles.dividerSection}>
          <h2 className={styles.sectionTitle}>{t('philosophyApproach')}</h2>
          <div className="space-y-6">
            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('detailedDescription')}</label>
              <textarea
                value={formData.philosophyDesc}
                onChange={(e) => handleInputChange('philosophyDesc', e.target.value)}
                className={styles.textarea}
              />
            </div>
          </div>
        </div>

        <GalleryEditor
          title={t('certifications')}
          images={formData.certifications}
          onChange={(next) => setFormData((prev) => ({ ...prev, certifications: next }))}
        />

        <TransformationEditor
          transformations={formData.transformations}
          onChange={(next) => setFormData((prev) => ({ ...prev, transformations: next }))}
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

        <div className={styles.tagSection}>
          <h2 className={styles.sectionTitle}>{t('expertiseCredentials')}</h2>

          <div className="space-y-12">
            <div className={styles.tagSubSection}>
              <label className={styles.label}>{t('specializations')}</label>
              <div className={styles.tagGrid}>
                {formData.specializations.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button onClick={() => handleRemoveSpec(tag)} className={styles.tagRemove}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {showAddTag === 'list1' ? (
                  <div className={styles.menuWrapper}>
                    <div ref={specMenuRef} className={styles.menuContent}>
                      <div className={styles.menuHeader}>
                        <span className={styles.menuHeaderText}>{t('selectSpecialties')}</span>
                        <button
                          onClick={() => {
                            setShowAddTag(null);
                            setPendingSpecs([]);
                          }}
                          className="text-foreground/40 hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className={styles.menuList}>
                        {SPECIALIZATIONS.filter(
                          (s) => !formData.specializations.includes(s.value),
                        ).map((s) => (
                          <button
                            key={s.id}
                            onClick={() => togglePendingSpec(s.value)}
                            className={styles.menuItem(pendingSpecs.includes(s.value))}
                          >
                            {translateSpecializationLabel(s.label)}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={pendingSpecs.length === 0}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            specializations: [...prev.specializations, ...pendingSpecs],
                          }));
                          setShowAddTag(null);
                          setPendingSpecs([]);
                        }}
                        className={styles.menuSubmit}
                      >
                        {t('addSelected', { count: pendingSpecs.length })}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddTag('list1')} className={styles.addBtn}>
                    <Plus size={14} /> {t('addNew')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || isUploading || photoUploading}
          className={styles.saveBtn}
        >
          <Save size={18} />
          {updateMutation.isPending ? t('saving') : isUploading ? `Uploading ${uploadProgress}%` : t('saveProfile')}
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
