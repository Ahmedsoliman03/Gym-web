import { ArrowLeft, Briefcase, MessageSquareText } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PostTypeChooserProps {
  onChooseType: (type: 'job' | 'community') => void;
  onBack: () => void;
}

const styles = {
  backLink: "inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors mb-8 group cursor-pointer border-0 bg-transparent p-0 outline-none",
  backIcon: "group-hover:-translate-x-0.5 transition-transform",
  heading: "text-4xl md:text-5xl font-headline font-black text-foreground mb-2",
  subheading: "text-foreground/50 mb-10",
  typeGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  typeCard: "group relative flex flex-col items-start gap-4 p-6 bg-[#0D121F] border-2 border-white/5 rounded-2xl text-left cursor-pointer hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] transition-all w-full outline-none",
  typeIcon: "w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform",
  typeTitle: "font-headline font-black text-lg text-foreground",
  typeDesc: "text-sm text-foreground/40 leading-relaxed",
};

export function PostTypeChooser({ onChooseType, onBack }: PostTypeChooserProps) {
  const t = useTranslations('Jobs');

  return (
    <>
      <button className={styles.backLink} onClick={onBack}>
        <ArrowLeft size={16} className={styles.backIcon} />
        {t('backToJobs')}
      </button>

      <h1 className={styles.heading}>{t('choosePostType')}</h1>
      <p className={styles.subheading}>{t('choosePostTypeDesc')}</p>

      <div className={styles.typeGrid}>
        <button type="button" className={styles.typeCard} onClick={() => onChooseType('job')}>
          <span className={styles.typeIcon}><Briefcase size={24} /></span>
          <span className={styles.typeTitle}>{t('postTypeJob')}</span>
          <span className={styles.typeDesc}>{t('postTypeJobDesc')}</span>
        </button>

        <button type="button" className={styles.typeCard} onClick={() => onChooseType('community')}>
          <span className={styles.typeIcon}><MessageSquareText size={24} /></span>
          <span className={styles.typeTitle}>{t('postTypeCommunity')}</span>
          <span className={styles.typeDesc}>{t('postTypeCommunityDesc')}</span>
        </button>
      </div>
    </>
  );
}
