'use client';

import { usePathname } from '@/i18n/routing';

const styles = {
  container: "min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300",
  main: "flex-1 flex items-center justify-center p-6 pt-24 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent",
  content: (isWide: boolean) => `
    w-full ${isWide ? 'max-w-4xl' : 'max-w-md'} 
    bg-surface border border-foreground/5 
    shadow-2xl shadow-primary/5 rounded-3xl p-8 
   
  `
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isWide = pathname.includes('request-access');

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.content(isWide)}>
                    {children}
                </div>
            </main>
        </div>
    );
}
