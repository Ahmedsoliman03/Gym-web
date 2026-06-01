export interface StoryAuthor {
    fullName: string;
    userType: 'coach' | 'gym' | 'client';
}

export interface StoryMedia {
    file: string;
}

export interface Story {
    id: string;
    author: StoryAuthor;
    media: StoryMedia[];
}
