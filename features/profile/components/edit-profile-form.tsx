"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, Save, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { SPECIALIZATIONS } from "@/constants/specializations";

const styles = {
  container: "max-w-4xl mx-auto px-4 py-12",
  header: "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12",
  titleWrapper: "space-y-1",
  titleLabel: "text-4xl font-bold text-foreground uppercase text-shadow-glow",
  subtitle: "text-foreground/40 text-sm font-bold uppercase",

  typeSelector: "flex p-1 bg-white/5 rounded-2xl w-fit border border-white/5 mb-8",
  typeBtn: (active: boolean) => `px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground/60'}`,

  section: "bg-surface rounded-3xl border border-white/5 p-8 space-y-8",
  sectionTitle: "text-xs font-black text-primary uppercase mb-6",

  imageUpload: "flex flex-col items-center gap-6 pb-8 border-b border-white/5",
  avatarCircle: "relative w-32 h-32 rounded-full border-4 border-primary p-1",
  avatarInner: "w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden relative",
  avatarOverlay: "absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer",

  fieldGroup: "grid grid-cols-1 md:grid-cols-2 gap-6",
  inputWrapper: "flex flex-col gap-2",
  label: "text-[10px] font-black text-foreground/40 uppercase ml-1",
  input: "bg-white/5 py-1 border border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm ",
  textarea: "bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm min-h-[120px] resize-none",

  tagInputWrapper: "space-y-3",
  tagGrid: "flex flex-wrap gap-2",
  tag: "bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-2 uppercase group",
  tagRemove: "hover:text-foreground transition-colors",
  addBtn: "text-xs font-bold text-primary flex items-center gap-2 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all active:scale-95",

  actions: "flex items-center gap-3  mt-5",
  saveBtn: "bg-primary text-primary-foreground font-black uppercase px-6 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-xs md:text-sm",
  cancelBtn: "bg-white/5 text-foreground/60 font-black uppercase px-6 py-3 rounded-xl hover:bg-white/10 transition-all text-xs md:text-sm border border-white/5"
};

export const EditProfileForm = () => {
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
    name: "Marcus Thorne",
    image: "/images/profile/marcus.png",
    title: "Senior Performance Specialist",
    tier: "Strength & Conditioning",
    philosophyTitle: "Coaching Philosophy",
    philosophyDesc: "My approach is built on the intersection of biological science and brutal consistency.",
    specializations: ["Bodybuilding", "Powerlifting"],
    certifications: ["NASM CPT", "PN-L2"],
  });

  const [imagePreview, setImagePreview] = useState<string | null>("/images/profile/marcus.png");
  const [newTag, setNewTag] = useState("");

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

  const handleAddTag = (list: keyof typeof formData) => {
    if (!newTag.trim()) return;
    const currentList = formData[list] as string[];
    if (Array.isArray(currentList) && !currentList.includes(newTag)) {
      setFormData(prev => ({ ...prev, [list]: [...currentList, newTag] }));
    }
    setNewTag("");
  };

  const handleRemoveTag = (list: keyof typeof formData, tag: string) => {
    const currentList = formData[list] as string[];
    if (Array.isArray(currentList)) {
      setFormData(prev => ({ ...prev, [list]: currentList.filter(t => t !== tag) }));
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.titleLabel}>{t('editProfile')}</h1>
          <p className={styles.subtitle}>{t('editSubtitle')}</p>
        </div>
      </div>

      {/* Main Form Box */}
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
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-foreground/20 italic text-xs">{t('noImage')}</div>
              )}
              <div className={styles.avatarOverlay}>
                <Camera className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xs font-black text-foreground uppercase mb-1">{t('profilePhoto')}</h3>
            <p className="text-[10px] text-foreground/40 uppercase">{t('clickChangeAvatar')}</p>
          </div>
        </div>

        {/* Basic Info */}
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

            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('professionalTitle')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="space-y-8 pt-8 border-t border-white/5">
          <h2 className={styles.sectionTitle}>{t('philosophyApproach')}</h2>
          <div className="space-y-6">
            <div className={styles.inputWrapper}>
              <label className={styles.label}>{t('philosophyHeadline')}</label>
              <input
                type="text"
                value={formData.philosophyTitle}
                onChange={(e) => handleInputChange('philosophyTitle', e.target.value)}
                className={styles.input}
              />
            </div>
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

        {/* Tags Section */}
        <div className="space-y-8 pt-8 border-t border-white/5">
          <h2 className={styles.sectionTitle}>{t('expertiseCredentials')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Specializations */}
            <div className="space-y-4">
              <label className={styles.label}>{t('specializations')}</label>
              <div className={styles.tagGrid}>
                {formData.specializations.map(tag => {
                  const specItem = SPECIALIZATIONS.find(s => s.value === tag);
                  return (
                    <span key={tag} className={styles.tag}>
                      {specItem ? t_root(specItem.label as any) : tag}
                      <button onClick={() => handleRemoveTag('specializations', tag)} className={styles.tagRemove}>
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}

                {showAddTag === 'list1' ? (
                  <div className="relative">
                    <div ref={specMenuRef} className="absolute z-50 bottom-full mb-4 left-0 w-72 bg-[#161B2B] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-4 backdrop-blur-xl animate-premium-in">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] font-black text-foreground/40 uppercase">{t('selectSpecialties')}</span>
                        <button onClick={() => { setShowAddTag(null); setPendingSpecs([]); }} className="text-foreground/40 hover:text-foreground"><X size={14} /></button>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                        {SPECIALIZATIONS.filter(s => !formData.specializations.includes(s.value)).map(s => (
                          <button
                            key={s.id}
                            onClick={() => togglePendingSpec(s.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${pendingSpecs.includes(s.value) ? 'bg-primary text-primary-foreground' : 'text-foreground/60 hover:bg-white/5'}`}
                          >
                            {t_root(s.label as any)}
                          </button>
                        ))}
                      </div>

                      <button
                        disabled={pendingSpecs.length === 0}
                        onClick={() => {
                          if (pendingSpecs.length > 0) {
                            const currentList = formData.specializations;
                            setFormData(prev => ({ ...prev, specializations: [...currentList, ...pendingSpecs] }));
                            setShowAddTag(null);
                            setPendingSpecs([]);
                          }
                        }}
                        className="w-full bg-primary disabled:opacity-50 text-primary-foreground font-black text-[10px] uppercase py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
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

            {/* Certifications */}
            <div className="space-y-4">
              <label className={styles.label}>{t('certifications')}</label>
              <div className={styles.tagGrid}>
                {formData.certifications.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button onClick={() => handleRemoveTag('certifications', tag)} className={styles.tagRemove}>
                      <X size={10} />
                    </button>
                  </span>
                ))}

                {showAddTag === 'list2' ? (
                  <div ref={tagInputRef} className="flex items-center gap-2">
                    <input
                      autoFocus
                      className={styles.input + " py-1 w-32"}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('certifications')}
                    />
                    <button onClick={() => handleAddTag('certifications')} className="text-primary"><Plus size={16} /></button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddTag('list2')} className={styles.addBtn}>
                    <Plus size={14} /> {t('addNew')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
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
