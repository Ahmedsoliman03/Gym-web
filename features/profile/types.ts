export interface UserProfile {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    userType: 'client' | 'coach' | 'gym';

    profile: {
        id: string;
        type: 'client' | 'coach' | 'gym';
        name: string;
        photo: string | null;
    };
}