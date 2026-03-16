'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe24Regular } from '@fluentui/react-icons';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'ar' : 'en';
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
            {/* Header with Settings */}
            <header className="p-4 flex justify-end gap-4">
                <button
                    onClick={toggleLanguage}
                    className="p-2 rounded-full hover:bg-surface transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Switch Language"
                >
                    <Globe24Regular />
                    <span>{locale.toUpperCase()}</span>
                </button>
            </header>

            {/* Main Content with Premium Animation */}
            <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                <div className={`w-full ${pathname.includes('request-access') ? 'max-w-4xl' : 'max-w-md'} bg-surface border border-foreground/5 shadow-2xl shadow-primary/5 rounded-3xl p-8 animate-premium-in`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
