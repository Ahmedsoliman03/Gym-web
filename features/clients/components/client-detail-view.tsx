"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, MapPin, MessageSquare, RotateCw, User, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { GLoader } from "@/components/ui/g-loader";
import { triggerChatOpen } from "@/features/chat/hooks/use-chat";
import { useStartChatMutation } from "@/features/chat/services/chat.service";
import { useChatSocket } from "@/features/chat/socket/chat-socket-provider";
import { useBlockUserMutation } from "@/features/settings/services/blocks.service";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useProfileLink } from "@/features/profile/hooks/useProfileLink";
import toast from "react-hot-toast";
import { useClient } from "../services/clients.service";
import type { ClientDetailViewProps } from "../types";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-3xl mx-auto px-3 sm:px-4 md:px-8 pt-20 sm:pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
  card: "relative w-full rounded-3xl bg-surface p-8 overflow-hidden border border-white/5",
  contentWrapper: "flex flex-col md:flex-row items-center gap-8",
  avatarWrapper: "relative shrink-0",
  avatarBorder: "w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden",
  avatarInner: "w-full h-full rounded-full overflow-hidden relative bg-primary/10 flex items-center justify-center text-primary",
  avatarImage: "object-cover",
  infoWrapper: "flex-1 text-center md:text-left",
  subtitle: "text-primary/80 font-black text-[11px] uppercase tracking-widest mb-1.5",
  name: "text-4xl font-bold text-foreground mb-2",
  locationRow: "flex items-center justify-center md:justify-start gap-1.5 text-sm font-medium text-foreground/60 mb-3",
  presencePill: "inline-flex items-center justify-center md:justify-start gap-2 text-xs font-black uppercase tracking-wider text-foreground/55",
  presenceDot: (status: 'online' | 'busy' | 'offline') =>
    `h-2.5 w-2.5 rounded-full ${status === 'online' ? 'bg-green-500' : status === 'busy' ? 'bg-amber-500' : 'bg-gray-500'}`,
  actionsWrapper: "flex flex-row md:flex-col gap-3 w-full md:w-auto",
  primaryBtn: "flex-1 md:w-44 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed",
  dangerBtn: "flex-1 md:w-44 bg-red-500/10 hover:bg-red-500/15 text-red-300 font-bold py-3 px-6 rounded-xl border border-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  retryBtn: "flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer",
};

export function ClientDetailView({ id }: ClientDetailViewProps) {
  const t = useTranslations("Clients");
  const tProfile = useTranslations("Profile");
  const tChat = useTranslations("Chat");
  const router = useRouter();
  const { data: client, isLoading, error, refetch, isFetching } = useClient(id);

  const { isSelf } = useProfileLink(id, 'client');

  const startChat = useStartChatMutation();
  const blockUser = useBlockUserMutation();
  const { presenceByUser, watchPresence, status: socketStatus } = useChatSocket();
  const [blockOpen, setBlockOpen] = useState(false);

  const clientUserId = client?.userId;
  const liveStatus = clientUserId ? (presenceByUser[clientUserId] ?? client?.status ?? 'offline') : 'offline';

  useEffect(() => {
    if (isSelf) router.replace('/profile');
  }, [isSelf, router]);

  // Subscribe to the visited user's realtime presence while the page is open.
  useEffect(() => {
    if (isSelf || !clientUserId) return;
    watchPresence([clientUserId]);
    return () => watchPresence([]);
  }, [clientUserId, isSelf, socketStatus, watchPresence]);

  const handleStartChat = () => {
    if (!clientUserId) return;
    startChat.mutate(
      { userId: clientUserId },
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

  const confirmBlock = () => {
    if (!clientUserId) return;
    blockUser.mutate(clientUserId, {
      onSuccess: () => {
        toast.success(tProfile('blockSuccess'));
        setBlockOpen(false);
        router.replace('/settings?section=blocked');
      },
      onError: () => toast.error(tProfile('blockError')),
    });
  };

  if (isSelf || isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <GLoader size={72} />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className={styles.loaderWrapper}>
        <div className="flex flex-col items-center gap-4">
          <span className="text-red-500 font-bold uppercase tracking-wider">{t("loadFailed")}</span>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className={styles.retryBtn}>
            <RotateCw size={14} className={isFetching ? "animate-spin" : ""} />
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  const location = client.location || [client.area, client.city].filter(Boolean).join(', ');

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.contentWrapper}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarBorder}>
                <div className={styles.avatarInner}>
                  {client.photo ? (
                    <Image src={client.photo} alt={client.fullName} fill className={styles.avatarImage} unoptimized />
                  ) : (
                    <User size={56} />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.infoWrapper}>
              <p className={styles.subtitle}>{t("clientLabel")}</p>
              <h1 className={styles.name}>{client.fullName}</h1>
              {location && (
                <div className={styles.locationRow}>
                  <MapPin size={14} className="text-foreground/40 shrink-0" />
                  <span>{location}</span>
                </div>
              )}
              <div className={styles.presencePill}>
                <span className={styles.presenceDot(liveStatus)} />
                {tProfile(`status_${liveStatus}`)}
              </div>
            </div>

            <div className={styles.actionsWrapper}>
              <button className={styles.primaryBtn} onClick={handleStartChat} disabled={startChat.isPending || !clientUserId}>
                {startChat.isPending ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                {tProfile('chat')}
              </button>
              <button className={styles.dangerBtn} onClick={() => setBlockOpen(true)} disabled={blockUser.isPending || !clientUserId}>
                {blockUser.isPending ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                {tProfile('block')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={blockOpen}
        title={tProfile('blockTitle', { name: client.fullName })}
        body={tProfile('blockConfirm')}
        cancelLabel={tProfile('blockCancel')}
        confirmLabel={tProfile('block')}
        submittingLabel={tProfile('blocking')}
        tone="danger"
        isSubmitting={blockUser.isPending}
        onCancel={() => setBlockOpen(false)}
        onConfirm={confirmBlock}
      />
    </main>
  );
}
