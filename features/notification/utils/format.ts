// Compact relative-time formatting for notification rows ("5m", "2h", "3d").
// Uses Intl.RelativeTimeFormat so the unit words respect the active locale.

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

/** Relative time from `iso` to now, e.g. "5 minutes ago" / "منذ ٥ دقائق".
 *  Returns "" on an unparseable date so a row never renders "Invalid Date". */
export const formatRelativeTime = (iso: string, locale: string): string => {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'narrow' });
    let duration = (then - Date.now()) / 1000; // seconds, negative for the past

    for (const division of DIVISIONS) {
        if (Math.abs(duration) < division.amount) {
            return rtf.format(Math.round(duration), division.unit);
        }
        duration /= division.amount;
    }
    return '';
};
