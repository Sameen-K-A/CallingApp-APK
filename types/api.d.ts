import { IAuthUser } from "./general";

export interface IVerifyOTPResponse {
  success: boolean;
  message: string;
  token: string;
  user: IAuthUser;
};

// COMPLETE PROFILE API TYPES
// ============================================

export interface ICompleteProfilePayload {
  name: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  role: 'USER' | 'TELECALLER';
  about?: string; // Required only if role is TELECALLER
  language: string;
};

export interface ICompleteProfileResponse {
  success: boolean;
  message: string;
  data: IAuthUser;
};

// EDIT PROFILE API TYPES
// ============================================

export interface IEditProfilePayload {
  name?: string;
  language?: string;
  profile?: string | null;
  about?: string;
}

export interface IEditProfileResponse {
  success: boolean;
  message: string;
  data: IAuthUser;
}