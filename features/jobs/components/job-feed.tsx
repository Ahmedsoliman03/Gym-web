'use client';

import { useState } from 'react';

import { JOBS } from '@/constants/jops';
import { ApplyJobModal } from './apply-job-modal';
import { EditJobModal } from './edit-job-modal';
import { JobCard } from './job-card';

const styles = {
  container: "w-full",
  main: "w-full",
  feedGrid: "flex flex-col gap-12 mt-12",
  card: "bg-surface rounded-2xl overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5",
  cardHeader: "flex items-center justify-between p-6",
  authorWrapper: "flex items-center gap-4",
  avatar: "w-12 h-12 rounded-full object-cover border-2 border-primary/20",
  authorName: "font-bold text-foreground",
  authorMeta: "text-xs text-foreground/40",
  menuButton: "text-foreground/40 hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5",
  imageWrapper: "relative aspect-video md:aspect-[21/9] overflow-hidden",
  image: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
  badge: "absolute top-6 right-6 bg-primary/90 text-primary-foreground px-4 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-md",
  contentBody: "p-8",
  jobTitle: "text-3xl md:text-4xl font-headline font-bold mb-2 group-hover:text-primary transition-colors",
  metaGrid: "flex flex-wrap gap-4 items-center text-sm font-bold text-foreground/40 mb-6",
  metaItem: "flex items-center gap-1.5",
  salary: "text-primary",
  description: "text-foreground/60 leading-relaxed max-w-2xl",
  footerActions: "px-8 pb-8 flex flex-col sm:flex-row gap-4",
  actionButton: "flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all active:scale-95 font-bold text-sm uppercase",
  applyButton: "flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-all active:scale-95 shadow-[0_10px_30px_rgba(34,197,94,0.15)] text-sm uppercase",
  dropdown: "absolute right-0 top-full mt-2 w-48 bg-[#161B22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2",
  dropdownItem: "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors",
  formWrapper: "space-y-6",
  input: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
  label: "text-[11px] font-bold text-foreground/50 px-1 uppercase mb-2 block",
  error: "text-red-500 text-[10px] mt-1 px-1",
  submitButton: "w-full py-4 bg-primary text-black rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase",
  uploadContainer: "relative w-full py-6 px-4 bg-[#0D121F] border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group"
};

export function JobFeed() {
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);


  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.feedGrid}>
          {JOBS.map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              index={index}
              onApply={setApplyingJob}
              onEdit={setEditingJob}
              onAction={(action, job) => console.log(`${action} post:`, job.id)}
            />
          ))}
        </div>
      </div>

      <EditJobModal
        job={editingJob}
        onClose={() => setEditingJob(null)}
      />

      <ApplyJobModal
        job={applyingJob}
        onClose={() => setApplyingJob(null)}
      />
    </div>
  );
}
