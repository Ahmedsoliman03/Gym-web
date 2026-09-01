'use client';

import { useTranslations } from 'next-intl';

interface ContactSupportProps {
    /** Classes for the anchor element (lets each call site keep its own look). */
    className?: string;
    /** Show the trailing arrow icon (used in the login footer). */
    showArrow?: boolean;
    /** Classes for the arrow icon when shown. */
    iconClassName?: string;
    /** Override the link text; defaults to the `Auth.contactSupport` message. */
    label?: string;
}

// The support WhatsApp number lives in the environment so it can differ per
// deployment. Falls back to the previously hardcoded number if unset.
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '201159133110';

/** WhatsApp deep link to support — reused anywhere a plain `<a>` is needed
 * instead of the `<ContactSupport>` component (e.g. inside a menu item that
 * already renders its own icon). */
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE}`;

/**
 * Generic "Contact support" link that opens a WhatsApp chat with the support
 * number. Reused across auth screens (and anywhere support contact is needed).
 */
export function ContactSupport({
    className,
    showArrow = false,
    iconClassName,
    label,
}: ContactSupportProps) {
    const t = useTranslations();

    return (
        <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            <span>{label ?? t('Auth.contactSupport')}</span>
            {showArrow && (
                <svg
                    className={iconClassName}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            )}
        </a>
    );
}
