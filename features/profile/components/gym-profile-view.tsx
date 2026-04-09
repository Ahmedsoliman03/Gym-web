"use client";

import { GymProfile } from "../mock-data";
import { MapPin, Star, Users, Clock, MessageSquare, Settings, Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { TransformationGallery } from "./transformation-gallery";
import { useRef } from "react";

const styles = {
  container: "space-y-8",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center",
  logoWrapper: "w-32 h-32 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden relative shrink-0",
  logoImage: "object-cover p-4",
  infoWrapper: "flex-1 text-center md:text-left",
  title: "text-4xl font-bold mb-2",
  statsList: "flex flex-wrap justify-center md:justify-start gap-4 text-foreground/60 text-sm",
  statItem: "flex items-center gap-1",
  ratingStar: "text-yellow-500",
  actionsWrapper: "flex flex-row md:flex-col gap-3 w-full md:w-auto",
  primaryBtn: "flex-1 md:w-44 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20",
  secondaryBtn: "flex-1 md:w-44 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 px-6 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
  card: "bg-surface p-8 rounded-3xl border border-white/5",
  sectionTitle: "text-xl font-bold mb-4 text-primary uppercase",
  description: "text-foreground/70 leading-relaxed italic",
  programsGrid: "grid grid-cols-2 md:grid-cols-4 gap-4",
  programTag: "p-4 bg-white/5 rounded-2xl border border-white/10 text-center font-bold text-sm",
  plansGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6",
  planCard: "bg-surface p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all",
  planHeader: "mb-6",
  planName: "text-2xl font-bold mb-1",
  planDuration: "text-primary text-sm font-bold uppercase tracking-wider",
  planFeatures: "space-y-3 mb-8 w-full",
  featureItem: "flex items-center justify-center gap-2 text-foreground/60 text-sm",
  planPricing: "mt-auto space-y-1 w-full pt-6 border-t border-white/5",
  oldPrice: "text-foreground/30 line-through text-sm",
  currentPrice: "text-2xl font-black text-foreground",
  buyBtn: "w-full mt-4 bg-white/5 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all py-3 rounded-xl font-bold text-sm",
  textBtn: "text-primary hover:text-primary/80 font-bold text-sm transition-all flex items-center gap-1 group"
};

export const GymProfileView = ({ data }: { data: GymProfile }) => {
  const t = useTranslations("Profile");
  const plansRef = useRef<HTMLDivElement>(null);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Map gym images to look like "transformations" for the gallery component
  const galleryImages = data.images.map((img, i) => ({
    clientName: `${t('facilityView')} ${i + 1}`,
    duration: t('peakState'),
    image: img
  }));

  return (
    <div className={styles.container}>
      {/* Gym Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <Image
            src={data.image}
            alt={data.name}
            fill
            className={styles.logoImage}
          />
        </div>
        <div className={styles.infoWrapper}>
          <h1 className={styles.title}>{data.name}</h1>
          <div className={styles.statsList}>
            <span className={styles.statItem}><MapPin size={16} /> {data.location}</span>
            <span className={styles.statItem}><Star size={16} className={styles.ratingStar} /> {data.rating} {t('rating')}</span>
            <span className={styles.statItem}><Users size={16} /> {data.memberCount} {t('members')}</span>
            <span className={styles.statItem}><Clock size={16} /> {data.workingHours}</span>
          </div>
        </div>
        <div className={styles.actionsWrapper}>
          <button className={styles.primaryBtn}>
            <MessageSquare size={18} />
            {t('chat')}
          </button>
          <Link href="/profile/edit" className={styles.secondaryBtn}>
            <Settings size={18} />
            {t('editProfile')}
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* About */}
        <div className={styles.card}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={styles.sectionTitle}>{t('aboutFacility')}</h2>
            <button onClick={scrollToPlans} className={styles.textBtn}>
              {t('goToPlans')}
            </button>
          </div>
          <p className={styles.description}>{data.description}</p>
        </div>

        {/* Slider of Gym Images */}
        <TransformationGallery
          transformations={galleryImages}
          title={t('facilityGallery')}
          hideOverlay={true}
        />

        {/* Programs */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{t('activePrograms')}</h2>
          <div className={styles.programsGrid}>
            {data.programs.map(program => (
              <div key={program} className={styles.programTag}>
                {program}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div ref={plansRef} className="space-y-6 pt-4">
        <h2 className={styles.sectionTitle}>{t('membershipPlans')}</h2>
        <div className={styles.plansGrid}>
          {data.plans?.map((plan, idx) => (
            <div key={idx} className={styles.planCard}>
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <span className={styles.planDuration}>{plan.duration}</span>
              </div>

              <div className={styles.planFeatures}>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className={styles.featureItem}>
                    <Check size={14} className="text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className={styles.planPricing}>
                {plan.salePrice && (
                  <div className={styles.oldPrice}>{plan.price}</div>
                )}
                <div className={styles.currentPrice}>
                  {plan.salePrice || plan.price}
                </div>
                <button className={styles.buyBtn}>
                  {t('getStarted')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

