
import { getAuthHeaders, getBaseUrl } from '../utils';
import { SettingsApiResponse } from '../types';

export const updateSettings = async (data: any): Promise<SettingsApiResponse> => {
  try {
    const headers = getAuthHeaders();
    const baseUrl = getBaseUrl();

    let response = await fetch(`${baseUrl}/api/settings`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await fetch(`${baseUrl}/api/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const updatedSettings = await response.json();
    return {
      status: 200,
      json: { success: true, data: updatedSettings },
    };
  } catch (error) {
    console.error('Error updating settings:', error);
    return {
      status: 500,
      json: { success: false, message: 'Failed to update settings' },
    };
  }
};