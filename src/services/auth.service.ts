import axiosInstance from '@/lib/axios'
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserResponse,
} from '@/types'

export const authService = {
  login: (data: LoginRequest) =>
    axiosInstance.post<AuthResponse>('/api/v1/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<AuthResponse>('/api/v1/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    axiosInstance
      .post<RefreshTokenResponse>('/api/v1/auth/refresh', { refreshToken })
      .then((r) => r.data),

  getMe: () =>
    axiosInstance.get<UserResponse>('/api/v1/auth/me').then((r) => r.data),

  updateMe: (data: UpdateProfileRequest) =>
    axiosInstance.put<UserResponse>('/api/v1/auth/me', data).then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    axiosInstance.put('/api/v1/auth/change-password', data).then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    axiosInstance.post('/api/v1/auth/forgot-password', data).then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    axiosInstance.post('/api/v1/auth/reset-password', data).then((r) => r.data),

  logout: (accessToken: string) =>
    axiosInstance.post('/api/v1/auth/logout', null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
}
