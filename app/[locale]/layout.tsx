import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { GeistSans } from 'geist/font/sans';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import '../globals.css';
import { Metadata } from 'next';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
    subsets: ['arabic'],
    weight: ['100', '200', '300', '400', '500', '600', '700'],
    variable: '--font-ibm-plex-arabic',
});

export const metadata: Metadata = {
    title: "Gym ",
    description: "Gym "
};

import { Navbar } from '@/components/navbar';

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
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning className={`${GeistSans.variable} ${ibmPlexArabic.variable}`}>
            <body className="font-sans antialiased selection:bg-primary/30">
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        forcedTheme="dark"
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
