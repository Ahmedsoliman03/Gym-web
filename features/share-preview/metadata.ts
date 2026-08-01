import type { Metadata } from 'next';
import { serverApiGet } from '@/utils/server-fetch';

const SITE_NAME = 'GymSpot';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const DEFAULT_IMAGE = '/images/Gymspot-logo.png';

type Locale = 'en' | 'ar' | string;

interface CoachPreview {
    id: string;
    fullName: string;
    title?: string;
    specialization?: string[];
    city?: string;
    area?: string;
    photo?: string | null;
    description?: string;
}

interface GymPreview {
    id: string;
    gymName: string;
    description?: string;
    city?: string;
    area?: string;
    location?: string;
    mainPhoto?: string | null;
    specializations?: string[];
}

interface PostPreview {
    id: string;
    author?: {
        fullName?: string;
        userType?: string;
    };
    content?: string;
    media?: {
        file?: string | null;
        mediaType?: string;
    }[];
}

interface JobPreview {
    id: string;
    title: string;
    location?: string;
    content?: string;
    specialization?: string[];
    image?: string | null;
    gym?: {
        gymName?: string;
        city?: string;
        area?: string;
        mainPhoto?: string | null;
    };
}

const textFallback = (locale: Locale): string =>
    locale === 'ar'
        ? 'Discover coaches, gyms, jobs, and fitness community updates on GymSpot.'
        : 'Discover coaches, gyms, jobs, and fitness community updates on GymSpot.';

const truncate = (value: string | undefined, maxLength = 155): string => {
    const clean = (value || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    return `${clean.slice(0, maxLength - 1).trim()}...`;
};

const joinParts = (parts: Array<string | undefined | null>): string =>
    parts.filter(Boolean).join(' - ');

const sitePath = (locale: Locale, path: string): string => `/${locale}${path}`;

const absoluteUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url)) return url;
    return new URL(url, SITE_URL).toString();
};

const previewImageUrl = (image?: string | null): string =>
    absoluteUrl(image && image.trim() ? image : DEFAULT_IMAGE);

const metadata = ({
    locale,
    path,
    title,
    description,
    image,
}: {
    locale: Locale;
    path: string;
    title: string;
    description: string;
    image?: string | null;
}): Metadata => {
    const previewImage = previewImageUrl(image);
    const url = sitePath(locale, path);

    return {
        metadataBase: new URL(SITE_URL),
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title,
            description,
            url,
            locale: locale === 'ar' ? 'ar_AR' : 'en_US',
            images: [
                {
                    url: previewImage,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [previewImage],
        },
    };
};

const fallbackMetadata = (locale: Locale, path: string, title: string): Metadata =>
    metadata({
        locale,
        path,
        title,
        description: textFallback(locale),
        image: previewImageUrl(),
    });

export async function coachShareMetadata(id: string, locale: Locale): Promise<Metadata> {
    const path = `/coaches/${id}`;
    try {
        const coach = await serverApiGet<CoachPreview>(`public/coaches/${id}`);
        const location = joinParts([coach.area, coach.city]);
        const specialty = coach.specialization?.join(', ');
        return metadata({
            locale,
            path,
            title: `${coach.fullName} | ${SITE_NAME}`,
            description:
                truncate(coach.description) ||
                truncate(joinParts([coach.title, specialty, location])) ||
                textFallback(locale),
            image: coach.photo,
        });
    } catch {
        return fallbackMetadata(locale, path, `Coach Preview | ${SITE_NAME}`);
    }
}

export async function gymShareMetadata(id: string, locale: Locale): Promise<Metadata> {
    const path = `/gyms/${id}`;
    try {
        const gym = await serverApiGet<GymPreview>(`public/gyms/${id}`);
        const location = gym.location || joinParts([gym.area, gym.city]);
        const specialty = gym.specializations?.join(', ');
        return metadata({
            locale,
            path,
            title: `${gym.gymName} | ${SITE_NAME}`,
            description:
                truncate(gym.description) ||
                truncate(joinParts([specialty, location])) ||
                textFallback(locale),
            image: gym.mainPhoto,
        });
    } catch {
        return fallbackMetadata(locale, path, `Gym Preview | ${SITE_NAME}`);
    }
}

export async function postShareMetadata(id: string, locale: Locale): Promise<Metadata> {
    const path = `/community/${id}`;
    try {
        const post = await serverApiGet<PostPreview>(`public/community/posts/${id}`);
        const image = post.media?.find((item) => item.mediaType === 'image')?.file;
        const author = post.author?.fullName || SITE_NAME;
        return metadata({
            locale,
            path,
            title: `${author} on ${SITE_NAME}`,
            description: truncate(post.content) || textFallback(locale),
            image,
        });
    } catch {
        return fallbackMetadata(locale, path, `Community Post | ${SITE_NAME}`);
    }
}

export async function jobShareMetadata(id: string, locale: Locale): Promise<Metadata> {
    const path = `/jobs/${id}`;
    try {
        const job = await serverApiGet<JobPreview>(`public/jobs/${id}`);
        const location = job.location || joinParts([job.gym?.area, job.gym?.city]);
        const specialty = job.specialization?.join(', ');
        return metadata({
            locale,
            path,
            title: `${job.title} | ${SITE_NAME}`,
            description:
                truncate(job.content) ||
                truncate(joinParts([job.gym?.gymName, specialty, location])) ||
                textFallback(locale),
            image: job.image || job.gym?.mainPhoto,
        });
    } catch {
        return fallbackMetadata(locale, path, `Job Preview | ${SITE_NAME}`);
    }
}
