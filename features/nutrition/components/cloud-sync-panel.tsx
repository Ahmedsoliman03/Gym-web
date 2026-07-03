"use client";

import { Key, CheckCircle } from "lucide-react";

interface CloudSyncPanelProps {
  wgerToken: string;
  setTokenState: (token: string) => void;
  isConnected: boolean;
  handleConnect: () => void;
  handleDisconnect: () => void;
  t: (key: string) => string;
}

const styles = {
  tokenPanel: "bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between",
  tokenInputWrapper: "flex-1 flex gap-2 w-full max-w-md",
  input: "w-full bg-[#0D121F] border border-white/5 focus:border-primary/50 text-foreground px-4 py-3 rounded-xl outline-none transition-all text-sm font-bold",
  btn: "bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2",
  btnOutline: "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2",
};

export function CloudSyncPanel({
  wgerToken,
  setTokenState,
  isConnected,
  handleConnect,
  handleDisconnect,
  t,
}: CloudSyncPanelProps) {
  return (
    <div className={styles.tokenPanel}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0">
          <Key size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">{t("apiTokenLabel")}</h3>
          <p className="text-[10px] text-foreground/50 font-bold">
            {isConnected ? t("connected") : t("apiTokenPlaceholder")}
          </p>
        </div>
      </div>

      <div className={styles.tokenInputWrapper}>
        {isConnected ? (
          <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
              <CheckCircle size={14} />
              {t("connected")}
            </div>
            <button type="button" onClick={handleDisconnect} className={styles.btnOutline}>
              {t("disconnect")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            <input
              type="password"
              value={wgerToken}
              onChange={(e) => setTokenState(e.target.value)}
              placeholder="e.g. 9df04a8b75f..."
              className={styles.input}
            />
            <button type="button" onClick={handleConnect} className={styles.btn}>
              {t("connectBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
