
import { getAuthHeaders, getBaseUrl } from '../utils';
import { SettingsApiResponse } from '../types';

export const getSettings = async (): Promise<SettingsApiResponse> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const settings = await response.json();
    return {
      status: 200,
      json: { success: true, data: settings },
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {
      status: 500,
      json: { success: false, message: 'Failed to fetch settings' },
    };
  }
};