"use client"
import { Home } from "lucide-react";

const styles = {
  container: "min-h-screen bg-[#06080F] flex flex-col items-center justify-center p-6 text-center text-white font-sans selection:bg-primary/30",
  glow: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full",
  badge: "px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase rounded-full mb-8 relative z-10",
  title: "text-[150px] md:text-[200px] font-black leading-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent mb-6 relative z-10",
  subtitle: "text-2xl md:text-4xl font-black mb-6 uppercase relative z-10",
  description: "text-foreground/40 max-w-md mb-12 text-base md:text-lg opacity-60 relative z-10",
  button: "bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center gap-3 group relative z-10"
};

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className={styles.container}>
        <div className={styles.glow} />
        
        <div className={styles.badge}>Security Status: 404</div>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Lost in the Network</h2>
        <p className={styles.description}>
          The portal you're trying to reach does not exist or requires an encrypted key.
        </p>
        
        <a href="/" className={styles.button}>
          <Home size={20} />
          Back to Origin
        </a>

        {/* Inline CSS for the primary color since theme-provider might not be available here */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --primary: #22c55e; --primary-foreground: #ffffff; }
          .bg-primary { background-color: var(--primary); }
          .text-primary { color: var(--primary); }
          .text-primary-foreground { color: var(--primary-foreground); }
          .border-primary\\/20 { border-color: rgba(34, 197, 94, 0.2); }
          .bg-primary\\/10 { background-color: rgba(34, 197, 94, 0.1); }
          .shadow-primary\\/40 { shadow: 0 25px 50px -12px rgba(34, 197, 94, 0.4); }
        `}} />
      </body>
    </html>
  );
}
