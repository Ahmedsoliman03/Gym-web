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

export const CoachEditForm = ({ profile }: CoachEditFormProps) => {
  const t = useTranslations("Profile");
  const t_root = useTranslations();
  const router = useRouter();
  const updateMutation = useUpdateProfileMutation();

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

  // Coach editable state. Server-hosted images come back as `{id, file}` —
  // we wrap them in `{id, url}` so the GalleryEditor can show + delete them,
  // and the builder will tell the API which ids to keep.
  const [formData, setFormData] = useState({
    name: profile.fullName ?? inner?.name ?? '',
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialPhoto);
  // Plan-row validation errors, set after a failed save attempt and cleared
  // whenever the user touches the plans list again.
  const [planErrors, setPlanErrors] = useState<PlanErrors>({});

  // Warn before leaving with unsaved edits. Snapshot the pristine state once,
  // then compare on every render (photo file change counts as dirty too).
  const initialSnapshotRef = useRef(serializeFormState(formData));
  const isDirty =
    photoFile !== null ||
    serializeFormState(formData) !== initialSnapshotRef.current;
  useUnsavedChangesWarning(isDirty);

  const handleInputChange = (
    field: 'name' | 'philosophyDesc',
    value: string,
  ) => {
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

  const handleRemoveSpec = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((t) => t !== tag),
    }));
  };

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
      role: 'coach',
      values: {
        name: formData.name,
        image: photoFile,
        philosophyDesc: formData.philosophyDesc,
        specializations: formData.specializations,
        certifications: formData.certifications,
        socialMedia: formData.socialMedia,
        plans: sanitized,
        transformations: formData.transformations.map((tr) => ({
          id: tr.id,
          clientName: tr.name,
          duration: tr.duration,
          image: tr.image,
        })),
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
              <label className={styles.label}>{t('fullName')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
