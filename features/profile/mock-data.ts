export type ProfileType = 'coach' | 'gym' | 'client';

export interface ProfileData {
  id: string;
  type: ProfileType;
  name: string;
  image: string;
  banner?: string;
  location?: string;
}

export interface CoachProfile extends ProfileData {
  type: 'coach';
  title: string;
  tier: string;
  stats: { label: string; value: string }[];
  philosophy: { title: string; description: string };
  transformations: { clientName: string; duration: string; image: string }[];
  credentials: { certifications: string[]; specializations: string[] };
}

export interface GymProfile extends ProfileData {
  type: 'gym';
  rating: string;
  memberCount: string;
  description: string;
  facilities: string[];
  programs: string[];
  workingHours: string;
}

export interface ClientProfile extends ProfileData {
  type: 'client';
  goal: string;
  progress: number;
  weight: { current: string; target: string };
  stats: { label: string; value: string }[];
  recentActivity: { activity: string; time: string }[];
}

export const mockProfiles: Record<string, CoachProfile | GymProfile | ClientProfile> = {
  "marcus-thorne": {
    id: "marcus-thorne",
    type: 'coach',
    name: "Marcus Thorne",
    title: "Senior Strength & Conditioning Specialist",
    tier: "Elite Tier",
    image: "/images/profile/marcus.png",
    stats: [
      { label: "EXP", value: "12y" },
      { label: "CLIENTS", value: "500+" },
      { label: "RATING", value: "4.9" },
    ],
    philosophy: {
      title: "Coaching Philosophy",
      description: "My approach is built on the intersection of biological science and brutal consistency. We don't just 'work out'; we execute precise protocols designed to trigger specific physiological adaptations.",
    },
    transformations: [
      { clientName: "David R.", duration: "12 Weeks", image: "/images/profile/david.png" },
      { clientName: "Sarah M.", duration: "6 Months", image: "/images/profile/sarah.png" },
      { clientName: "Mike T.", duration: "8 Months", image: "/images/profile/mike.png" },
    ],
    credentials: {
      certifications: ["NASM Certified Personal Trainer", "Precision Nutrition L2", "CSCS (NSCA)"],
      specializations: ["Hypertrophy", "Powerlifting", "Fat Loss", "Mobility"],
    },
  },
  "elite-hq": {
    id: "elite-hq",
    type: 'gym',
    name: "Elite Performance HQ",
    location: "Downtown, Cairo",
    rating: "4.8",
    memberCount: "1.2k+",
    image: "/images/profile/gym-logo.png",
    description: "The most advanced training facility in the region. Equipped with Olympic-grade gear and a community of high-performers.",
    facilities: ["Olympic Racks", "Recovery Lounge", "Juice Bar", "Indoor Track"],
    programs: ["CrossFit", "Powerlifting Club", "Yoga Flow", "Boxing Foundations"],
    workingHours: "24/7 Access",
  },
  "john-doe": {
    id: "john-doe",
    type: 'client',
    name: "John Doe",
    goal: "Weight Loss & Muscle Gain",
    progress: 65,
    weight: { current: "85kg", target: "78kg" },
    image: "/images/profile/client-avatar.png",
    stats: [
      { label: "STREAK", value: "12 Days" },
      { label: "WORKOUTS", value: "48" },
      { label: "RANK", value: "#14" },
    ],
    recentActivity: [
      { activity: "Leg Day Protocol", time: "2 hours ago" },
      { activity: "5km Run", time: "Yesterday" },
      { activity: "Prgram Update", time: "2 days ago" },
    ],
  }
};
