'use client';

import { usePathname } from '@/i18n/routing';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
            {/* Main Content with Premium Animation */}
            <main className="flex-1 flex items-center justify-center p-6 pt-24 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                <div className={`w-full ${pathname.includes('request-access') ? 'max-w-4xl' : 'max-w-md'} bg-surface border border-foreground/5 shadow-2xl shadow-primary/5 rounded-3xl p-8 animate-premium-in`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
