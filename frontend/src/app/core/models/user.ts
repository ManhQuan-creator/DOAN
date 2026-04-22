export interface UserInfo {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  name: string;
  phone: string | null;
  address: string | null;
  cccd: string | null;
  imageUrl: string | null;
  role: 'USER' | 'ADMIN';
  status: number;
  statusName: string;
  type: number;
  country: string | null;
  countryCode: string | null;
  zipcode: string | null;
  city: string | null;
  createdAt: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserInfo;
}

export interface UpdateProfileRequest {
  name?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  address?: string;
  country?: string;
  countryCode?: string;
  zipcode?: string;
  city?: string;
  cccd?: string;
  birthday?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}
// Thêm vào user.ts
export interface RegisterOtpRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    otp: string;
}