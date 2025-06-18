
import { pb, getCurrentEndpoint } from '@/lib/pocketbase';

export const getAuthHeaders = (): Record<string, string> => {
  const authToken = pb.authStore.token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};

export const getBaseUrl = (): string => {
  return getCurrentEndpoint();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};