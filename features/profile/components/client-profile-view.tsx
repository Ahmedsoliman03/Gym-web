"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Save, RotateCcw, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProfileUser } from "../hooks/useProfileUser";
import toast from "react-hot-toast";
import { UserProfile } from "../types";
import * as Yup from "yup";
import { getPhoneSchema, getFullNameSchema } from "@/utils/validations";
import { WeightProgress } from "./WeightProgress";
import { WeeklyProgressCardSection } from "./WeeklyProgressCard";
import { useR2Upload } from "@/hooks/use-r2-upload";

const styles = {
  container: "max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden group shadow-2xl",
  gradientOverlay: "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none",
  avatarWrapper: "w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 relative z-10 cursor-pointer group/avatar",
  avatarOverlay: "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 z-20 text-white",
  avatarImage: "w-full h-full object-cover",
  avatarFallback: "w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-3xl",
  infoWrapper: "flex-1 text-center md:text-start relative z-10",
  subtitle: "text-primary/80 font-bold text-xs uppercase tracking-widest mb-1.5",
  name: "text-3xl font-black tracking-tight mb-1 text-white",
  contactRow: "flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-1.5 sm:gap-4 text-sm text-foreground/50",
  contactItem: "flex items-center justify-center md:justify-start gap-1.5",
  sectionHeading: "flex items-center gap-3 mb-2",
  sectionLabel: "text-primary/80 font-bold text-xs uppercase tracking-widest",
  sectionLine: "flex-1 h-px bg-white/5",
  card: "bg-surface p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden",
  cardTitle: "text-lg font-black mb-8 flex items-center gap-2 text-white uppercase tracking-wider",
  form: "space-y-6",
  fieldWrapper: "space-y-2",
  label: "text-xs font-bold uppercase tracking-wider text-foreground/40",
  inputWrapper: "relative group/input",
  inputIcon: "absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-foreground/30 group-focus-within/input:text-primary transition-colors",
  inputIconSize: "w-5 h-5",
  input: "w-full ps-12 pe-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed",
  buttonRow: "flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5",
  saveBtn: "flex-1 py-4 bg-primary text-black rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm uppercase tracking-wider",
  resetBtn: "flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 active:scale-[0.99] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm uppercase tracking-wider",
  error: "text-red-500 text-xs mt-1 px-1"
};

export const ClientProfileView = ({ data }: { data: UserProfile }) => {
  const t = useTranslations();
  const { updateProfile, updateProfileMutation } = useProfileUser();
  const { uploadFile, isUploading, uploadProgress } = useR2Upload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(data.fullName || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  // Update states if data changes (e.g. from backend refetches)
  useEffect(() => {
    setFullName(data.fullName || "");
    setPhone(data.phone || "");
    setUploadedPhotoPath(null);
    setPreviewUrl(null);
    setErrors({});
  }, [data]);

  const isDirty = fullName.trim() !== data.fullName || phone.trim() !== data.phone || uploadedPhotoPath !== null;
  const isSaving = updateProfileMutation.isPending;

  const handleReset = () => {
    setFullName(data.fullName || "");
    setPhone(data.phone || "");
    setUploadedPhotoPath(null);
    setPreviewUrl(null);
    setErrors({});
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
    try {
      const path = await uploadFile(file, 'profile_photo');
      setUploadedPhotoPath(path);
    } catch {
      toast.error('Upload failed');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors(prev => ({ ...prev, fullName: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const profileSchema = Yup.object().shape({
    fullName: getFullNameSchema(t),
    phone: getPhoneSchema(t),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || isSaving) return;

    setErrors({});

    try {
      await profileSchema.validate({ fullName: fullName.trim(), phone: phone.trim() }, { abortEarly: false });

      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('phone', phone.trim());
      if (uploadedPhotoPath) {
        formData.append('photo', uploadedPhotoPath);
      }
      await updateProfile(formData);
      toast.success(t('Profile.saveSuccess') || 'Changes saved successfully!');
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: { fullName?: string; phone?: string } = {};
        error.inner.forEach((err) => {
          if (err.path === 'fullName') newErrors.fullName = err.message;
          if (err.path === 'phone') newErrors.phone = err.message;
        });
        setErrors(newErrors);
        if (error.errors && error.errors[0]) {
          toast.error(error.errors[0]);
        }
      } else {
        toast.error(error?.response?.data?.message || t('Validation.error') || 'Failed to save changes');
      }
    }
  };

  // Get initials for fallback avatar
  const getInitials = (nameStr: string) => {
    if (!nameStr) return "?";
    return nameStr
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.container}>
      {/* Client Header */}
      <div className={styles.header}>
        <div className={styles.gradientOverlay} />

        {/* Avatar Wrapper with Click Action & Hover Layer */}
        <div className={styles.avatarWrapper} onClick={triggerFileSelect}>
          {previewUrl || data.profile.photo ? (
            <img
              src={previewUrl || data.profile.photo!}
              alt={fullName}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {getInitials(fullName)}
            </div>
          )}
          {isUploading ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs rounded-full z-20">
              {uploadProgress}%
            </div>
          ) : (
            <div className={styles.avatarOverlay}>
              <Plus size={24} className="transform group-hover/avatar:scale-110 transition-transform" />
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isSaving}
        />

        <div className={styles.infoWrapper}>
          <p className={styles.subtitle}>{t('Profile.client') || 'Client Member'}</p>
          <h1 className={styles.name}>{fullName || data.fullName}</h1>
          <div className={styles.contactRow}>
            <span className={styles.contactItem}>
              <Mail size={13} className="text-foreground/30 shrink-0" />
              {data.email}
            </span>
            {(phone || data.phone) && (
              <span className={styles.contactItem}>
                <Phone size={13} className="text-foreground/30 shrink-0" />
                {phone || data.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fitness Tracking zone — dashboard + shareable journey card grouped
          under one labeled section so the page reads as distinct zones
          instead of an undifferentiated stack of cards. */}
      <div className="space-y-8">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>{t('Profile.fitnessTrackingSection') || 'Fitness Tracking'}</span>
          <div className={styles.sectionLine} />
        </div>
        <WeightProgress />
        <WeeklyProgressCardSection />
      </div>

      {/* Account Settings zone */}
      <div className="space-y-4">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>{t('Profile.accountSettingsSection') || 'Account Settings'}</span>
          <div className={styles.sectionLine} />
        </div>
        <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <User size={18} className="text-primary" /> {t('Profile.basicInfo') || 'Personal Details'}
        </h2>

        <form onSubmit={handleSave} className={styles.form}>
          {/* Full Name Field */}
          <div className={styles.fieldWrapper}>
            <label className={styles.label}>{t('Auth.fullName') || 'Full Name'}</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <User className={styles.inputIconSize} />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={handleFullNameChange}
                disabled={isSaving}
                placeholder={t('Auth.fullNamePlaceholder') || 'Enter full name'}
                className={`${styles.input} ${errors.fullName ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""}`}
                required
              />
            </div>
            {errors.fullName && <div className={styles.error}>{errors.fullName}</div>}
          </div>

          {/* Phone Field */}
          <div className={styles.fieldWrapper}>
            <label className={styles.label}>{t('Auth.phone') || 'Phone Number'}</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <Phone className={styles.inputIconSize} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                disabled={isSaving}
                placeholder={t('Auth.phonePlaceholder') || 'Enter phone number'}
                className={`${styles.input} ${errors.phone ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""}`}
                required
              />
            </div>
            {errors.phone && <div className={styles.error}>{errors.phone}</div>}
          </div>

          {/* Email Field (Disabled) */}
          <div className={styles.fieldWrapper}>
            <label className={styles.label}>{t('Auth.emailAddress') || 'Email Address'}</label>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <Mail className={styles.inputIconSize} />
              </div>
              <input
                type="email"
                value={data.email}
                disabled
                className={styles.input}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={styles.buttonRow}>
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
              className={styles.resetBtn}
            >
              <RotateCcw size={16} />
              {t('Profile.cancelChanges') || 'Return to Default'}
            </button>

            <button
              type="submit"
              disabled={!isDirty || isSaving || isUploading}
              className={styles.saveBtn}
            >
              <Save size={16} />
              {isSaving ? '...' : isUploading ? `Uploading ${uploadProgress}%` : (t('Profile.saveProfile') || 'Save Changes')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
