"use client";

import type { GymProfileViewModel, ProfilePlan } from "../types";
import { MapPin, Users, MessageSquare, Settings, Mail, Loader2, UserX } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { TransformationGallery } from "@/components/shared/transformation-gallery";
import { Plans } from "@/components/shared/membership-plans";
import { EmptySection } from "@/components/shared/empty-section";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { triggerChatOpen } from "@/features/chat/hooks/use-chat";
import { useStartChatMutation } from "@/features/chat/services/chat.service";
import { useChatSocket } from "@/features/chat/socket/chat-socket-provider";
import { useBlockUserMutation } from "@/features/settings/services/blocks.service";
import { usePlanGetStartedMutation } from "../services/profile.service";
import { StoryAvatarBadge } from "@/features/stories/components/story-avatar-badge";
import { SPECIALIZATIONS } from "@/constants/specializations";
import type { Story } from "@/features/stories/types";
import { ProfilePosts } from "./profile-posts";
import type { PresenceStatus } from "@/features/chat/types";
import { SocialMediaLinks } from "./social-media-links";
import { sectionDomId } from "../checklist-sections";
import { useTextTranslation } from "@/hooks/use-text-translation";
import { buildWhatsAppShareUrl, getDefaultWhatsAppShareMessage } from "@/features/share-preview/whatsapp-share";

const styles = {
  container: "space-y-8",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-start md:items-center",
  avatarWrapper: "relative",
  avatarBorder: "w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden",
  avatarInner: "w-full h-full rounded-full overflow-hidden relative",
  avatarImage: "object-cover",
  statusBadge: (status: PresenceStatus) =>
    `absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-surface ${status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
    }`,
  infoWrapper: "flex-1",
  title: "text-4xl font-bold mb-2",
  presencePill: "inline-flex items-center justify-start gap-2 mb-3 text-xs font-black uppercase tracking-wider text-foreground/55",
  presenceDot: (status: PresenceStatus) =>
    `h-2.5 w-2.5 rounded-full ${status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'
    }`,
  statsList: "flex flex-wrap justify-start gap-4 text-foreground/60 text-sm",
  statItem: "flex items-center gap-1",
  ratingStar: "text-yellow-500",
  actionsWrapper: "flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto",
  primaryBtn: "w-full sm:flex-1 md:w-44 min-w-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed",
  whatsappBtn: "w-full sm:flex-1 md:w-44 min-w-0 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold py-3 px-4 rounded-xl border border-[#25D366]/25 flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-[0.98]",
  secondaryBtn: "w-full sm:flex-1 md:w-44 min-w-0 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 px-4 rounded-xl border border-white/10 flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-[0.98]",
  dangerBtn: "w-full sm:flex-1 md:w-44 min-w-0 bg-red-500/10 hover:bg-red-500/15 text-red-300 font-bold py-3 px-4 rounded-xl border border-red-500/20 flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  card: "bg-surface p-8 rounded-3xl border border-white/5",
  sectionTitle: "text-xl font-bold mb-4 text-primary uppercase",
  description: "text-foreground/70 leading-relaxed",
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

export const GymProfileView = ({
  data,
  isOwner = true,
  stories,
  profileId,
  postsViewAllHref,
  email,
}: {
  data: GymProfileViewModel;
  isOwner?: boolean;
  stories?: Story[];
  profileId?: string;
  postsViewAllHref?: string;
  /** Owner-only email, surfaced under the name in the header. */
  email?: string;
}) => {
  const t = useTranslations("Profile");
  const tChat = useTranslations("Chat");
  const t_root = useTranslations();
  const locale = useLocale();
  const {
    displayedText: displayedDescription,
    isTranslating: isTranslatingDescription,
    toggleTranslation: toggleDescriptionTranslation,
    buttonLabel: descriptionTranslationLabel,
  } = useTextTranslation(data.description);
  const router = useRouter();
  const plansRef = useRef<HTMLDivElement>(null);
  const startChat = useStartChatMutation();
  const blockUser = useBlockUserMutation();
  const planGetStarted = usePlanGetStartedMutation();
  const {
    status: socketStatus,
    presenceByUser,
    watchPresence,
  } = useChatSocket();
  const liveStatus = data.userId ? (presenceByUser[data.userId] ?? data.status ?? 'offline') : (data.status ?? 'offline');

  useEffect(() => {
    if (isOwner || !data.userId) return;
    watchPresence([data.userId]);
    return () => watchPresence([]);
  }, [data.userId, isOwner, socketStatus, watchPresence]);

  const handleStartChat = () => {
    if (!data.userId) return;
    startChat.mutate(
      { userId: data.userId },
      {
        onSuccess: (result) => {
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

  const handleWhatsAppShare = () => {
    if (typeof window === 'undefined' || !data.id) return;
    const shareUrl = `${window.location.origin}/${locale}/gyms/${data.id}`;
    const message = `${getDefaultWhatsAppShareMessage('gym', locale)}\n${data.name}`;

    window.open(
      buildWhatsAppShareUrl({ url: shareUrl, message }),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const [blockOpen, setBlockOpen] = useState(false);

  const confirmBlock = () => {
    if (!data.userId) return;
    blockUser.mutate(data.userId, {
      onSuccess: () => {
        toast.success(t('blockSuccess'));
        setBlockOpen(false);
        router.replace('/settings?section=blocked');
      },
      onError: () => toast.error(t('blockError')),
    });
  };

  const planMessage = (plan: ProfilePlan) =>
    t('planInterestMessage', {
      plan: plan.name,
      duration: plan.duration,
      price: plan.salePrice || plan.price,
    });

  const handlePlanGetStarted = (plan: ProfilePlan) => {
    if (!plan.id) return;
    planGetStarted.mutate(
      {
        ownerType: 'gym',
        planId: plan.id,
        profileId,
        message: planMessage(plan),
      },
      {
        onSuccess: (result) => {
          if (result.status === 'request_pending') {
            toast.success(tChat('requestSentToast'));
            triggerChatOpen('outgoing');
          } else {
            triggerChatOpen('conversations', result.conversation.id);
          }
        },
        onError: () => toast.error(t('planInterestError')),
      },
    );
  };

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Map gym images to look like "transformations" for the gallery component
  const galleryImages = data.images.map((img, i) => ({
    clientName: `${t('facilityView')} ${i + 1}`,
    duration: t('peakState'),
    image: img
  }));

  const translatedPrograms = (data.programs ?? []).map((program) => {
    const match = SPECIALIZATIONS.find((s) => s.value === program);
    if (!match) return program;
    const label = match.label as Parameters<typeof t_root>[0];
    return t_root.has(label) ? t_root(label) : match.fallback;
  });

  return (
    <div className={styles.container}>
      {/* Gym Header */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarBorder}>
            <div className={styles.avatarInner}>
              <Image
                src={data.image}
                alt={data.name}
                fill
                className={styles.avatarImage}
                unoptimized
              />
            </div>
          </div>
          <StoryAvatarBadge
            profileImage={data.image}
            profileName={data.name}
            isOwner={isOwner}
            authorId={data.id}
            authorUserType="gym"
            stories={stories}
          />
          {/* {!isOwner && <div className={styles.statusBadge(liveStatus)} />} */}
        </div>
        <div className={styles.infoWrapper}>
          <h1 className={styles.title}>{data.name}</h1>
          {/* Owner-only email row mirrors the coach header. */}
          {isOwner && email && (
            <div className="flex items-center justify-start gap-2 text-sm font-medium text-foreground/60 mb-3 break-all">
              <Mail size={14} className="text-foreground/40 shrink-0" />
              <span>{email}</span>
            </div>
          )}
          {!isOwner && (
            <div className={styles.presencePill}>
              <span className={styles.presenceDot(liveStatus)} />
              {t(`status_${liveStatus}`)}
            </div>
          )}
          <div className={styles.statsList}>
            <span className={styles.statItem}><MapPin size={16} /> {data.location}</span>
            <span className={styles.statItem}><Users size={16} /> {data.memberCount} {t('members')}</span>
          </div>
        </div>
        <div className={styles.actionsWrapper}>
          {/* Chat is only useful when viewing someone else's gym — the owner
              has no one to chat with on their own page. Mirrors the coach
              profile header, which already hides chat for the owner. */}
          {!isOwner && (
            <>
              <button
                className={styles.whatsappBtn}
                onClick={handleWhatsAppShare}
              >
                <WhatsAppIcon size={18} />
                {t('shareOnWhatsApp')}
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleStartChat}
                disabled={startChat.isPending || !data.userId}
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
                disabled={blockUser.isPending || !data.userId}
              >
                {blockUser.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <UserX size={18} />
                )}
                {t('block')}
              </button>
            </>
          )}
          {isOwner && (
            <>
              <Link href="/profile/edit" className={styles.secondaryBtn}>
                <Settings size={18} />
                {t('editProfile')}
              </Link>
              <button
                className={styles.whatsappBtn}
                onClick={handleWhatsAppShare}
              >
                <WhatsAppIcon size={18} />
                {t('shareOnWhatsApp')}
              </button>
            </>
          )}
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
          {data.description?.trim() ? (
            <div className="space-y-2">
              <p className={`${styles.description} whitespace-pre-wrap break-words`}>
                {displayedDescription}
              </p>
              <button
                type="button"
                onClick={toggleDescriptionTranslation}
                disabled={isTranslatingDescription}
                className="text-primary/80 text-xs font-bold hover:text-primary hover:underline disabled:opacity-50"
              >
                {descriptionTranslationLabel}
              </button>
            </div>
          ) : (
            <EmptySection
              isOwner={isOwner}
              visitorMessage={t('noAboutYet')}
              variant="compact"
            />
          )}
        </div>

        <div id={sectionDomId('socialMedia')} className="scroll-mt-28">
          <SocialMediaLinks links={data.socialMedia} isOwner={isOwner} />
        </div>

        {/* Slider of Gym Images */}
        <div id={sectionDomId('gallery')} className="scroll-mt-28">
          <TransformationGallery
            transformations={galleryImages}
            title={t('facilityGallery')}
            hideOverlay={true}
            isOwner={isOwner}
            emptyVisitorMessage={t('noGalleryYet')}
          />
        </div>

        {/* Recent posts — surfaced after the about + gallery cards so the
            visitor sees content before scrolling further into programs. */}
        {profileId && (
          <ProfilePosts
            profileType="gym"
            profileId={profileId}
            ownerName={data.name}
            isOwner={isOwner}
            viewAllHref={postsViewAllHref}
          />
        )}

        {/* Programs — translated from API specializations */}
        <div id={sectionDomId('specializations')} className={`${styles.card} scroll-mt-28`}>
          <h2 className={styles.sectionTitle}>{t('activePrograms')}</h2>
          {translatedPrograms.length === 0 ? (
            <EmptySection
              isOwner={isOwner}
              visitorMessage={t('noProgramsYet')}
              variant="compact"
            />
          ) : (
            <div className={styles.programsGrid}>
              {translatedPrograms.map((program, idx) => (
                <div key={`${program}-${idx}`} className={styles.programTag}>
                  {program}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div id={sectionDomId('plans')} className="scroll-mt-28">
        <Plans
          ref={plansRef}
          plans={data.plans}
          isOwner={isOwner}
          onGetStarted={handlePlanGetStarted}
          pendingPlanId={planGetStarted.isPending ? (planGetStarted.variables?.planId ?? null) : null}
        />
      </div>

      <ConfirmDialog
        isOpen={blockOpen}
        title={t('blockTitle', { name: data.name })}
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
