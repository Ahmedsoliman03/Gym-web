export type ShareContentType = 'post' | 'job' | 'coach' | 'gym';
export type ShareLocale = 'en' | 'ar' | string;

const DEFAULT_MESSAGES: Record<'en' | 'ar', Record<ShareContentType, string>> = {
  en: {
    post: 'Check out this post on GymSpot',
    job: 'Check out this job on GymSpot',
    coach: 'Check out this coach on GymSpot',
    gym: 'Check out this gym on GymSpot',
  },
  ar: {
    post: 'شاهد هذا المنشور على GymSpot',
    job: 'شاهد هذه الوظيفة على GymSpot',
    coach: 'شاهد هذا المدرب على GymSpot',
    gym: 'شاهد هذا الجيم على GymSpot',
  },
};

export function getDefaultWhatsAppShareMessage(
  contentType: ShareContentType,
  locale: ShareLocale,
): string {
  const normalizedLocale = locale === 'ar' ? 'ar' : 'en';

  return DEFAULT_MESSAGES[normalizedLocale][contentType];
}

export function buildWhatsAppShareUrl({
  url,
  message,
}: {
  url: string;
  message: string;
}): string {
  return `https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`;
}
