"use client";

import { CoachProfile, GymProfile } from "../mock-data";
import { CoachEditForm } from "./coach-edit-form";
import { GymEditForm } from "./gym-edit-form";

interface EditProfileFormProps {
  profile: CoachProfile | GymProfile;
}

export const EditProfileForm = ({ profile }: EditProfileFormProps) => {
  if (profile.type === 'coach') {
    return <CoachEditForm profile={profile} />;
  }

  if (profile.type === 'gym') {
    return <GymEditForm profile={profile} />;
  }

  return (
    <div className="flex items-center justify-center p-20 text-foreground/40">
      Invalid Profile Type
    </div>
  );
};
