"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Save, RotateCcw, Zap, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateProfile } from "../services/profile.service";
import toast from "react-hot-toast";
import { UserProfile } from "../types";

const styles = {
  container: "max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden group shadow-2xl",
  gradientOverlay: "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none",
  avatarWrapper: "w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 relative z-10 cursor-pointer group/avatar",
  avatarOverlay: "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 z-20 text-white",
  avatarImage: "w-full h-full object-cover",
  avatarFallback: "w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-3xl",
  infoWrapper: "flex-1 text-center md:text-left relative z-10",
  subtitle: "text-primary/80 font-bold text-xs uppercase tracking-widest mb-1.5",
  name: "text-3xl font-black tracking-tight mb-1 text-white",
  card: "bg-surface p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden",
  cardTitle: "text-lg font-black mb-8 flex items-center gap-2 text-white uppercase tracking-wider",
  form: "space-y-6",
  fieldWrapper: "space-y-2",
  label: "text-xs font-bold uppercase tracking-wider text-foreground/40",
  inputWrapper: "relative group/input",
  inputIcon: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/30 group-focus-within/input:text-primary transition-colors",
  inputIconSize: "w-5 h-5",
  input: "w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed",
  buttonRow: "flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5",
  saveBtn: "flex-1 py-4 bg-primary text-black rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm uppercase tracking-wider",
  resetBtn: "flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 active:scale-[0.99] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
};

export const ClientProfileView = ({ data }: { data: UserProfile }) => {
  const t = useTranslations();
  const updateProfileMutation = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(data.fullName || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update states if data changes (e.g. from backend refetches)
  useEffect(() => {
    setFullName(data.fullName || "");
    setPhone(data.phone || "");
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [data]);

  const isDirty = fullName.trim() !== data.fullName || phone.trim() !== data.phone || selectedFile !== null;
  const isSaving = updateProfileMutation.isPending;

  const handleReset = () => {
    setFullName(data.fullName || "");
    setPhone(data.phone || "");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || isSaving) return;

    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('phone', phone.trim());
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }
      await updateProfileMutation.mutateAsync(formData);
      toast.success(t('Navbar.changePasswordSuccess') || 'Changes saved successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('Validation.error') || 'Failed to save changes');
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
          <div className={styles.avatarOverlay}>
            <Plus size={24} className="transform group-hover/avatar:scale-110 transition-transform" />
          </div>
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
        </div>
      </div>

      {/* Profile Details Edit Form */}
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
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                placeholder={t('Auth.fullNamePlaceholder') || 'Enter full name'}
                className={styles.input}
                required
              />
            </div>
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
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSaving}
                placeholder={t('Auth.phonePlaceholder') || 'Enter phone number'}
                className={styles.input}
                required
              />
            </div>
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
              disabled={!isDirty || isSaving}
              className={styles.saveBtn}
            >
              <Save size={16} />
              {isSaving ? '...' : (t('Profile.saveProfile') || 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
