"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, MessageSquare, Settings, Loader2, Tag, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { triggerChatOpen } from "@/features/chat/hooks/use-chat";
import { useStartChatMutation } from "@/features/chat/services/chat.service";
import { useChatSocket } from "@/features/chat/socket/chat-socket-provider";
import { useBlockUserMutation } from "@/features/settings/services/blocks.service";
import toast from "react-hot-toast";
import { StoryAvatarBadge } from "@/features/stories/components/story-avatar-badge";
import { SPECIALIZATIONS } from "@/constants/specializations";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { CoachProfileHeaderProps } from "../types";
import { PromocodeChip } from "./promocode-chip";

const styles = {
  // ... existing styles ...
  container: "relative w-full rounded-3xl bg-surface p-8 overflow-hidden border border-white/5",
  contentWrapper: "flex flex-col md:flex-row items-center  gap-8",
  avatarWrapper: "relative",
  avatarBorder: "w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden",
  avatarInner: "w-full h-full rounded-full overflow-hidden relative",
  avatarImage: "object-cover",
  statusBadge: (status: 'online' | 'busy' | 'offline') =>
    `absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-surface ${
      status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
    }`,
  infoWrapper: "flex-1 text-center md:text-left",
  titleAndTier: "flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2",
  nameRow: "flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2",
  name: "text-4xl font-bold text-foreground",
  tier: "bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 uppercase",
  title: "text-foreground/40 font-bold",
  presencePill: "inline-flex items-center justify-center md:justify-start gap-2 mb-3 text-xs font-black uppercase tracking-wider text-foreground/55",
  presenceDot: (status: 'online' | 'busy' | 'offline') =>
    `h-2.5 w-2.5 rounded-full ${
      status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
    }`,
  // Single specialization badge next to the name. The full list is revealed in
  // a tooltip on hover/focus instead of rendering a chip per specialization.
  specBadgeWrapper: "relative inline-flex group",
  specBadge:
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider cursor-default focus:outline-none focus:ring-2 focus:ring-primary/40",
  specTooltip:
    "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 hidden group-hover:flex group-focus-within:flex flex-wrap gap-1.5 w-max max-w-[260px] p-2.5 rounded-xl bg-surface border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
  specTooltipChip:
    "inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold normal-case tracking-normal",
  emailRow:
    "flex items-center justify-center md:justify-start gap-2 text-sm font-medium text-foreground/60 mb-3 break-all",
  emailIcon: "text-foreground/40 shrink-0",
  statsGrid: "flex flex-wrap justify-center md:justify-start gap-8",
  statItem: "flex flex-col",
  statValue: "text-2xl font-bold text-foreground",
  statLabel: "text-xs text-foreground/40 uppercase",
  actionsWrapper: "flex flex-row md:flex-col gap-3 w-full md:w-auto",
  primaryBtn: "flex-1 md:w-44 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20",
  secondaryBtn: "flex-1 md:w-44 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 px-6 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
  dangerBtn: "flex-1 md:w-44 bg-red-500/10 hover:bg-red-500/15 text-red-300 font-bold py-3 px-6 rounded-xl border border-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
};

export const CoachProfileHeader = ({
  name,
  stats,
  image,
  isOwner = true,
  coachId,
  coachUserId,
  stories,
  promocode,
  specializations,
  email,
  status = 'offline',
}: CoachProfileHeaderProps) => {
  const t = useTranslations("Profile");
  const tChat = useTranslations("Chat");
  const tRoot = useTranslations();
  const router = useRouter();
  const startChat = useStartChatMutation();
  const blockUser = useBlockUserMutation();
  const {
    status: socketStatus,
    presenceByUser,
    watchPresence,
  } = useChatSocket();
  const liveStatus = coachUserId ? (presenceByUser[coachUserId] ?? status) : status;

  useEffect(() => {
    if (isOwner || !coachUserId) return;
    watchPresence([coachUserId]);
    return () => watchPresence([]);
  }, [coachUserId, isOwner, socketStatus, watchPresence]);

  const handleStartChat = () => {
    if (!coachUserId) return;
    startChat.mutate(
      { userId: coachUserId },
      {
        onSuccess: (result) => {
          // Land on the tab that shows what just happened: Outgoing for a
          // pending request the target still needs to approve, Conversations
          // for an open chat that's ready to use.
          if (result.status === "request_pending") {
            toast.success(tChat("requestSentToast"));
            triggerChatOpen('outgoing');
          } else {
            triggerChatOpen('conversations');
          }
        },
        onError: () => toast.error(tChat("requestErrorToast")),
      },
    );
  };

  const [blockOpen, setBlockOpen] = useState(false);

  const confirmBlock = () => {
    if (!coachUserId) return;
    blockUser.mutate(coachUserId, {
      onSuccess: () => {
        toast.success(t('blockSuccess'));
        setBlockOpen(false);
        router.replace('/settings?section=blocked');
      },
      onError: () => toast.error(t('blockError')),
    });
  };
  const allSpecs = specializations ?? [];
  const labelFor = (value: string) => {
    const match = SPECIALIZATIONS.find(
      (s) => s.value.toLowerCase() === value.toLowerCase(),
    );
    const label = match?.label as Parameters<typeof tRoot>[0] | undefined;
    return match
      ? label && tRoot.has(label)
        ? tRoot(label)
        : match.fallback
      : value;
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Profile Picture */}
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarBorder}>
            <div className={styles.avatarInner}>
              <Image
                src={image}
                alt={name}
                fill
                className={styles.avatarImage}
                unoptimized
              />
            </div>
          </div>
          <StoryAvatarBadge
            profileImage={image}
            profileName={name}
            isOwner={isOwner}
            authorId={coachId}
            authorUserType="coach"
            stories={stories}
          />
          {/* {!isOwner && <div className={styles.statusBadge(liveStatus)} />} */}
        </div>

        {/* Info */}
        <div className={styles.infoWrapper}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{name}</h1>
            {/* A single specialization badge sits next to the name; hovering
                (or focusing) it reveals every specialization in a tooltip so
                the name row stays compact regardless of list length. */}
            {allSpecs.length > 0 && (
              <span
                className={styles.specBadgeWrapper}
                tabIndex={0}
                aria-label={`${t('specializations')}: ${allSpecs
                  .map(labelFor)
                  .join(', ')}`}
              >
                <span className={styles.specBadge}>
                  <Tag size={11} />
                  {t('specializations')} · {allSpecs.length}
                </span>
                <span className={styles.specTooltip} role="tooltip">
                  {allSpecs.map((spec) => (
                    <span key={spec} className={styles.specTooltipChip}>
                      {labelFor(spec)}
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>

          {/* Owner-only email — surfaces the account email under the name
              so the user can sanity-check the address tied to their profile. */}
          {isOwner && email && (
            <div className={styles.emailRow}>
              <Mail size={14} className={styles.emailIcon} />
              <span>{email}</span>
            </div>
          )}

          {!isOwner && (
            <div className={styles.presencePill}>
              <span className={styles.presenceDot(liveStatus)} />
              {t(`status_${liveStatus}`)}
            </div>
          )}

          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>
                  {t.has(stat.label.toLowerCase()) ? t(stat.label.toLowerCase()) : stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        
        <div className={styles.actionsWrapper}>
             {/* Owner-only referral promocode chip with copy button. */}
          {isOwner && promocode && (
            <div className="mt-2 mb-3 flex justify-center md:justify-start">
              <PromocodeChip code={promocode} />
            </div>
          )}
          
           {!isOwner ?
          <>
            <button
              className={styles.primaryBtn}
              onClick={handleStartChat}
              disabled={startChat.isPending || !coachUserId}
            >
              {startChat.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <MessageSquare size={18} />
              )}
              {t('chat')}
            </button>
            <button
              className={styles.dangerBtn}
              onClick={() => setBlockOpen(true)}
              disabled={blockUser.isPending || !coachUserId}
            >
              {blockUser.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UserX size={18} />
              )}
              {t('block')}
            </button>
          </>
         :
            <Link href="/profile/edit" className={styles.secondaryBtn}>
              <Settings size={18} />
              {t('editProfile')}
            </Link>
}
        </div>
      </div>

      <ConfirmDialog
        isOpen={blockOpen}
        title={t('blockTitle', { name })}
        body={t('blockConfirm')}
        cancelLabel={t('blockCancel')}
        confirmLabel={t('block')}
        submittingLabel={t('blocking')}
        tone="danger"
        isSubmitting={blockUser.isPending}
        onCancel={() => setBlockOpen(false)}
        onConfirm={confirmBlock}
      />
    </div>
  );
};
