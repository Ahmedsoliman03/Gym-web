"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { GalleryEditor } from "./gallery-editor";
import { PlansEditor } from "@/components/shared/plans-editor";
import { GymProfile, GymPlan } from "../mock-data";
import { formStyles as styles } from "@/components/shared/form-styles";

interface GymEditFormProps {
  profile: GymProfile;
}

export const GymEditForm = ({ profile }: GymEditFormProps) => {
  const t = useTranslations("Profile");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: profile.name,
    image: profile.image,
    description: profile.description,
    gymImages: profile.images,
    gymPlans: profile.plans || [] as GymPlan[]
  });

  const [imagePreview, setImagePreview] = useState<string | null>(profile.image);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
          </div>
        </div>

        <GalleryEditor
          images={formData.gymImages}
          onChange={(newImages) => setFormData(prev => ({ ...prev, gymImages: newImages }))}
        />

        <PlansEditor
          plans={formData.gymPlans}
          onChange={(newPlans) => setFormData(prev => ({ ...prev, gymPlans: newPlans }))}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.saveBtn}>
          <Save size={18} />
          {t('saveProfile')}
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
