"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, Save, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { SPECIALIZATIONS } from "@/constants/specializations";
import { TransformationEditor } from "./transformation-editor";
import { GalleryEditor } from "./gallery-editor";
import { PlansEditor } from "@/components/shared/plans-editor";
import { CoachProfile } from "../mock-data";
import { formStyles as styles } from "@/components/shared/form-styles";

interface CoachEditFormProps {
  profile: CoachProfile;
}

export const CoachEditForm = ({ profile }: CoachEditFormProps) => {
  const t = useTranslations("Profile");
  const t_root = useTranslations();
  const router = useRouter();
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
    setPendingSpecs(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const [formData, setFormData] = useState({
    name: profile.name,
    image: profile.image,
    title: (profile as { title?: string }).title || "",
    tier: (profile as { tier?: string }).tier || "",
    // philosophyTitle: profile.philosophy?.title || "",
    philosophyDesc: profile?.description || "",
    specializations: profile.credentials?.specializations || [],
    certifications: profile.credentials?.certifications || [],
    transformations: profile.transformations?.map((t, i) => {
      const parts = (t.duration || "").split(" ");
      return {
        id: i.toString(),
        name: t.clientName,
        durationValue: parts[0] || "",
        durationUnit: parts[1]?.toLowerCase() || "weeks",
        image: t.image
      };
    }) || [],
    plans: profile.plans || []
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



  const handleRemoveTag = (list: keyof typeof formData, tag: string) => {
    const currentList = formData[list] as string[];
    if (Array.isArray(currentList)) {
      setFormData(prev => ({ ...prev, [list]: currentList.filter(t => t !== tag) }));
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
                placeholder="Marcus Thorne"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('professionalTitle')}</label>
              <input
                type="text"
                placeholder="Senior Performance Specialist"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
        {/* Certifications (Visual Editor) */}
        <GalleryEditor
          title={t('certifications')}
          images={formData.certifications}
          onChange={(newCerts) => setFormData(prev => ({ ...prev, certifications: newCerts }))}
        />
        <TransformationEditor
          transformations={formData.transformations}
          onChange={(newTrans) => setFormData(prev => ({ ...prev, transformations: newTrans }))}
        />

        <PlansEditor
          plans={formData.plans}
          onChange={(newPlans) => setFormData(prev => ({ ...prev, plans: newPlans }))}
        />

        <div className={styles.tagSection}>
          <h2 className={styles.sectionTitle}>{t('expertiseCredentials')}</h2>

          <div className="space-y-12">
            {/* Specializations */}
            <div className={styles.tagSubSection}>
              <label className={styles.label}>{t('specializations')}</label>
              <div className={styles.tagGrid}>
                {formData.specializations.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button onClick={() => handleRemoveTag('specializations', tag)} className={styles.tagRemove}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {showAddTag === 'list1' ? (
                  <div className={styles.menuWrapper}>
                    <div ref={specMenuRef} className={styles.menuContent}>
                      <div className={styles.menuHeader}>
                        <span className={styles.menuHeaderText}>{t('selectSpecialties')}</span>
                        <button onClick={() => { setShowAddTag(null); setPendingSpecs([]); }} className="text-foreground/40 hover:text-foreground"><X size={14} /></button>
                      </div>
                      <div className={styles.menuList}>
                        {SPECIALIZATIONS.filter(s => !formData.specializations.includes(s.value)).map(s => (
                          <button key={s.id} onClick={() => togglePendingSpec(s.value)} className={styles.menuItem(pendingSpecs.includes(s.value))}>{t_root(s.label as any)}</button>
                        ))}
                      </div>
                      <button disabled={pendingSpecs.length === 0} onClick={() => { setFormData(prev => ({ ...prev, specializations: [...prev.specializations, ...pendingSpecs] })); setShowAddTag(null); setPendingSpecs([]); }} className={styles.menuSubmit}>{t('addSelected', { count: pendingSpecs.length })}</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddTag('list1')} className={styles.addBtn}><Plus size={14} /> {t('addNew')}</button>
                )}
              </div>
            </div>


          </div>
        </div>
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
