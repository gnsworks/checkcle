
import { getAuthHeaders, getBaseUrl } from '../utils';
import { SettingsApiResponse } from '../types';

export const testEmailConnection = async (data: any): Promise<SettingsApiResponse> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/settings/test-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    return {
      status: 200,
      json: {
        success: result.success || false,
        message:
          result.message || (result.success ? 'Connection successful' : 'Connection failed'),
      },
    };
  } catch (error) {
    console.error('Error testing email connection:', error);
    return {
      status: 500,
      json: { success: false, message: 'Failed to test email connection' },
    };
  }
};