export interface User {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activtyLevel?: string;
  goal?: string;
  roles: string[];
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  height: number;
  weight: number;
  age: number;
  gender: string;
  activtyLevel: string;
  goal: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  goal?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}