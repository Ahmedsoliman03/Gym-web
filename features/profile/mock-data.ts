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
  description: string;
  transformations: { clientName: string; duration: string; image: string }[];
  credentials: { certifications: string[]; specializations: string[] };
  plans?: GymPlan[];
}

export interface GymPlan {
  name: string;
  duration: string;
  price: string;
  salePrice?: string;
  features: string[];
}

export interface GymProfile extends ProfileData {
  type: 'gym';
  memberCount: string;
  description: string;
  programs: string[];
  images: string[];
  plans?: GymPlan[];
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
    title: "Senior Performance Specialist",
    tier: "Strength & Conditioning",
    image: "/images/profile/marcus.png",
    stats: [
      { label: "EXP", value: "12y" },
      { label: "CLIENTS", value: "500+" },
    ],
    description: "My approach is built on the intersection of biological science and brutal consistency. We don't just 'work out'; we execute precise protocols designed to trigger specific physiological adaptations.",
    transformations: [
      { clientName: "David", duration: "12 Weeks", image: "/images/profile/david.png" },
      { clientName: "Sarah", duration: "6 Months", image: "/images/profile/sarah.png" },
      { clientName: "Mike", duration: "8 Months", image: "/images/profile/mike.png" },
    ],
    credentials: {
      certifications: ["/images/profile/cert-1.png", "/images/profile/cert-2.png", "/images/profile/cert-3.png"],
      specializations: ["Bodybuilding", "Powerlifting", "Strength & Conditioning", "Mobility"],
    },
    plans: [
      {
        name: "Personal Training",
        duration: "1 Month",
        price: "3000 EGP",
        features: ["12 Sessions", "Nutritional Plan", "Weekly Check-ins"]
      },
      {
        name: "Online Coaching",
        duration: "3 Months",
        price: "1500 EGP/Mo",
        salePrice: "1000 EGP/Mo",
        features: ["Workout Progrram", "Daily Support", "Video Analysis"]
      }
    ]
  },
  "elite-hq": {
    id: "elite-hq",
    type: 'gym',
    name: "Elite Performance HQ",
    location: "23 El-Nasr Road, Victory Square, Maadi, Cairo, Egypt",
    memberCount: "1.2k+",
    image: "/images/profile/gym-logo.png",
    description: "The most advanced training facility in the region. Equipped with Olympic-grade gear and a community of high-performers.",
    programs: ["CrossFit", "Powerlifting Club", "Yoga Flow", "Boxing Foundations"],
    images: [
      "/images/profile/gym-1.png",
      "/images/profile/gym-2.png",
      "/images/profile/gym-3.png",
    ],
    plans: [
      {
        name: "Month",
        duration: "1 Month",
        price: "1500 EGP",
        salePrice: "1200 EGP",
        features: ["3 Inbody", "4 Invitation"]
      },
      {
        name: "3 Months",
        duration: "3 Months",
        price: "4000 EGP",
        salePrice: "3200 EGP",
        features: ["1 Month Freeze", "3 Inbody", "4 Invitation"]
      },
      {
        name: "6 Months",
        duration: "6 Months",
        price: "7000 EGP",
        salePrice: "5500 EGP",
        features: ["1 Month Freeze", "3 Inbody", "4 Invitation"]
      },
      {
        name: "Year",
        duration: "1 Year",
        price: "12000 EGP",
        salePrice: "9000 EGP",
        features: ["1 Month Freeze", "3 Inbody", "4 Invitation"]
      }
    ]
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
