const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

export function formatRelativeTime(iso?: string, justNowLabel?: string, locale?: string): string {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (Number.isNaN(seconds) || seconds < 0) return '';
    if (justNowLabel && seconds < 30) return justNowLabel;
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    // Older than a week: "2 Jul", or "2 Jul 2025" once it's crossed into a
    // past calendar year — named month instead of the locale's numeric
    // D/M/Y date, and the year omitted unless it's actually needed.
    const sameYear = date.getFullYear() === now.getFullYear();
    try {
        return new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'short',
            ...(sameYear ? {} : { year: 'numeric' }),
        }).format(date);
    } catch {
        return date.toLocaleDateString();
    }
}

export function formatRelativeTimeLong(iso: string, locale: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'narrow' });
    let duration = (then - Date.now()) / 1000; // seconds, negative for the past

    for (const division of RELATIVE_DIVISIONS) {
        if (Math.abs(duration) < division.amount) {
            return rtf.format(Math.round(duration), division.unit);
        }
        duration /= division.amount;
    }
    return '';
}

/** Clock time only, e.g. "09:30". */
export function formatClockTime(iso: string, locale: string): string {
    try {
        return new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return '';
    }
}

/** Short month/day + clock time, e.g. "Jun 5, 09:30". */
export function formatWhen(iso: string, locale: string): string {
    try {
        return new Intl.DateTimeFormat(locale, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return '';
    }
}

/** Long localized date-time, e.g. "Jun 5, 2026, 9:30 AM" (story viewers). */
export function formatViewedAt(value: string | undefined, locale: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const bcp47 = locale === 'ar' ? 'ar-EG' : 'en-US';
    return date.toLocaleString(bcp47, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

/** Ensure a price string carries the EGP suffix (idempotent). */
export function formatPriceWithCurrency(value: string | undefined): string {
    if (!value) return '';
    return /egp/i.test(value) ? value : `${value} EGP`;
}

/** Countdown "m:ss" from a number of seconds (e.g. the OTP resend timer). */
export function formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
