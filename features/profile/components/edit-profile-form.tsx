"use client";

import type { EditProfileFormProps } from "../types";
import { ClientEditForm } from "./client-edit-form";
import { CoachEditForm } from "./coach-edit-form";
import { GymEditForm } from "./gym-edit-form";

export const EditProfileForm = ({ profile }: EditProfileFormProps) => {
  if (profile.userType === 'coach') {
    return <CoachEditForm profile={profile} />;
  }

  if (profile.userType === 'gym') {
    return <GymEditForm profile={profile} />;
  }

  if (profile.userType === 'client') {
    return <ClientEditForm profile={profile} />;
  }

  return null;
};
