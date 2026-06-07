'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { AddCommunityPostModal } from './add-community-post-modal';

const styles = {
  wrapper: 'mb-4',
  button:
    'w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-white/10 text-foreground/40 font-black text-sm uppercase tracking-widest hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-[0.99] transition-all duration-300 group',
  icon:
    'w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:rotate-90 transition-transform duration-300',
};

export function AddCommunityPostButton() {
  const t = useTranslations('Community');
  const { profile } = useProfileUser();
  const [isOpen, setIsOpen] = useState(false);

  // Only gyms and coaches can create community posts (per API spec).
  if (profile?.userType !== 'gym' && profile?.userType !== 'coach') return null;

  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={() => setIsOpen(true)}>
        <span className={styles.icon}>
          <Plus size={16} strokeWidth={3} />
        </span>
        {t('createPost')}
      </button>
      <AddCommunityPostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
