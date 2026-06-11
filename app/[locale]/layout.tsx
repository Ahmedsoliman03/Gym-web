import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { GeistSans } from 'geist/font/sans';
import { Almarai } from 'next/font/google';
import '../globals.css';
import { Metadata } from 'next';

const almarai = Almarai({
    subsets: ['arabic'],
    weight: ['300', '400', '700', '800'],
    variable: '--font-almarai',
});

export const metadata: Metadata = {
    title: "GymSpot",
    description: "GymSpot"
};

import { Navbar } from '@/components/navbar';
import { ChatWidget } from '@/features/chat/components/chat-widget';
import { ChatSocketProvider } from '@/features/chat/socket/chat-socket-provider';
import { ScrollToTopButton } from '@/components/shared/scroll-to-top-button';
import { Toaster } from 'react-hot-toast';

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning className={`${GeistSans.variable} ${almarai.variable}`}>
            <body className="font-sans antialiased selection:bg-primary/30">
                <NextIntlClientProvider messages={messages}>
                    <QueryProvider>
                        <ChatSocketProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            forcedTheme="dark"
                            disableTransitionOnChange
                        >
                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                                gutter={10}
                                toastOptions={{
                                    duration: 3500,
                                    style: {
                                        background: '#161B2B',
                                        color: '#F9FAFB',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '14px',
                                        padding: '12px 16px',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.06)',
                                        backdropFilter: 'blur(12px)',
                                        maxWidth: '92vw',
                                    },
                                    success: {
                                        iconTheme: {
                                            primary: '#22C55E',
                                            secondary: '#000',
                                        },
                                        style: {
                                            border: '1px solid rgba(34,197,94,0.35)',
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 18px rgba(34,197,94,0.18)',
                                        },
                                    },
                                    error: {
                                        iconTheme: {
                                            primary: '#EF4444',
                                            secondary: '#fff',
                                        },
                                        style: {
                                            border: '1px solid rgba(239,68,68,0.35)',
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 18px rgba(239,68,68,0.18)',
                                        },
                                    },
                                    loading: {
                                        iconTheme: {
                                            primary: '#22C55E',
                                            secondary: '#161B2B',
                                        },
                                    },
                                }}
                            />
                            <Navbar />
                            {children}
                            <ChatWidget />
                            <ScrollToTopButton />
                        </ThemeProvider>
                        </ChatSocketProvider>
                    </QueryProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
