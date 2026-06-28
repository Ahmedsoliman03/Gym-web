"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { CoachProfileHeader } from "./coach-profile-header";
import { CoachPhilosophy } from "./coach-philosophy";
import { TransformationGallery } from "@/components/shared/transformation-gallery";
import { CoachCredentials } from "./coach-credentials";
import { Plans } from "@/components/shared/membership-plans";
import type { CoachProfileViewModel, ProfilePlan } from "../types";
import type { Story } from "@/features/stories/types";
import { triggerChatOpen } from "@/features/chat/hooks/use-chat";
import { usePlanGetStartedMutation } from "../services/profile.service";
import { ProfilePosts } from "./profile-posts";
import { SocialMediaLinks } from "./social-media-links";
import { sectionDomId } from "../checklist-sections";

const styles = {
  container: "space-y-8",
  philosophyWrapper: "space-y-6",
  gridWrapper: "flex flex-wrap gap-6 items-start",
  mainColumn: "",
  sideColumn: ""
};

export const CoachProfileView = ({
  data,
  isOwner = true,
  stories,
  profileId,
  postsViewAllHref,
  promocode,
  email,
}: {
  data: CoachProfileViewModel;
  isOwner?: boolean;
  stories?: Story[];
  profileId?: string;
  postsViewAllHref?: string;
  promocode?: string;
  email?: string;
}) => {
  const t = useTranslations("Profile");
  const tChat = useTranslations("Chat");
  const plansRef = useRef<HTMLDivElement>(null);
  const planGetStarted = usePlanGetStartedMutation();

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
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
        ownerType: 'coach',
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

  return (
    <div className={styles.container}>
      <CoachProfileHeader
        name={data.name}
        stats={data.stats}
        image={data.image}
        isOwner={isOwner}
        coachId={data.id}
        coachUserId={data.userId}
        stories={stories}
        promocode={promocode}
        status={data.status}
        specializations={isOwner ? data.specializations : undefined}
        email={isOwner ? email : undefined}
      />

      <div className={styles.philosophyWrapper}>
        <CoachPhilosophy
          description={data.description}
          onGoToPlans={scrollToPlans}
          isOwner={isOwner}
        />
        <div id={sectionDomId('transformations')} className="scroll-mt-28">
          <TransformationGallery
            transformations={data.transformations}
            isOwner={isOwner}
            emptyVisitorMessage={t('noTransformationsYet')}
          />
        </div>
        <div id={sectionDomId('socialMedia')} className="scroll-mt-28">
          <SocialMediaLinks links={data.socialMedia} isOwner={isOwner} />
        </div>
      </div>
      {/* Recent posts — placed after the philosophy + transformations cards
          so the visitor reads the coach's pitch before browsing posts. */}
      {profileId && (
        <ProfilePosts
          profileType="coach"
          profileId={profileId}
          ownerName={data.name}
          isOwner={isOwner}
          viewAllHref={postsViewAllHref}
        />
      )}
      <div id={sectionDomId('certifications')} className="scroll-mt-28">
        <TransformationGallery
          title={t('certifications')}
          hideOverlay
          transformations={data.credentials.certifications.map(cert => ({
            clientName: t('certification'),
            duration: "",
            image: cert
          }))}
          isOwner={isOwner}
          emptyVisitorMessage={t('noCertificationsYet')}
        />
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


      <div id={sectionDomId('specializations')} className={`${styles.gridWrapper} scroll-mt-28`}>
        <CoachCredentials
          specializations={data.credentials.specializations}
          isOwner={isOwner}
        />
      </div>

    </div>
  );
};
