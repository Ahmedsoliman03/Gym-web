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
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            forcedTheme="dark"
                            disableTransitionOnChange
                        >
                            <Toaster position="top-center" reverseOrder={false} />
                            <Navbar />
                            {children}
                            <ChatWidget />
                        </ThemeProvider>
                    </QueryProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
