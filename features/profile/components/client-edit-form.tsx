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
import { formStyles as styles } from "@/components/shared/form-styles";
import { toastApiError } from "@/utils/toast-api-error";
import type { ClientEditFormProps } from "../types";
import {
  buildEditProfileFormData,
  useUpdateProfileMutation,
} from "../services/profile.service";

export const ClientEditForm = ({ profile }: ClientEditFormProps) => {
  const t = useTranslations("Profile");
  const router = useRouter();
  const updateMutation = useUpdateProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialPhoto = profile.profile?.photo ?? null;
  const [formData, setFormData] = useState({
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialPhoto);

  // Warn before leaving with unsaved edits.
  const initialSnapshotRef = useRef(serializeFormState(formData));
  const isDirty =
    photoFile !== null ||
    serializeFormState(formData) !== initialSnapshotRef.current;
  useUnsavedChangesWarning(isDirty);

  const handleInputChange = (field: 'fullName' | 'phone', value: string) => {
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
    const payload = buildEditProfileFormData({
      role: 'client',
      values: {
        fullName: formData.fullName,
        phone: formData.phone,
        photo: photoFile,
      },
    });
    try {
      await updateMutation.mutateAsync(payload);
      toast.success(t('saveSuccess'));
      router.push('/profile');
    } catch (err: unknown) {
      // feature_limit_exceeded → friendly localized toast (see toastApiError).
      toastApiError(err, t('saveFailed'));
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
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={styles.input}
              />
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
        <button
          onClick={() => router.back()}
          className={styles.cancelBtn}
        >
          {t('cancelChanges')}
        </button>
      </div>
    </div>
  );
};
