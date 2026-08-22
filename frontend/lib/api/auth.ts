import { apiRequest, setAuthToken, removeAuthToken } from './client';
import { User, Merchant } from '@/types';

export interface AuthResponse {
  token: string;
  user: User;
  merchant: Merchant;
}

export interface RegisterParams {
  email: string;
  password: string;
  name?: string;
  businessName?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export const authApi = {
  async register(params: RegisterParams): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/dashboard/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
      useAuth: false,
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async login(params: LoginParams): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/dashboard/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
      useAuth: false,
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  logout() {
    removeAuthToken();
  },
};
