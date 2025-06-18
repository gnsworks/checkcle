
import { getSettings } from './actions/getSettings';
import { updateSettings } from './actions/updateSettings';
import { testEmailConnection } from './actions/testEmailConnection';
import { testEmail } from './actions/testEmail';

/**
 * Settings API handler
 */
const settingsApi = async (body: any, path?: string) => {
  console.log('Settings API called with path:', path, 'body:', body);
  
  // Handle test email endpoint specifically
  if (path === '/api/settings/test/email') {
    console.log('Handling test email request');
    return await testEmail(body);
  }
  
  // Handle regular settings API with action-based routing
  const action = body?.action;
  console.log('Settings API called with action:', action, 'data:', body?.data);

  switch (action) {
    case 'getSettings':
      return await getSettings();
    
    case 'updateSettings':
      return await updateSettings(body.data);
    
    case 'testEmailConnection':
      return await testEmailConnection(body.data);
    
    default:
      console.error('Unknown action:', action);
      return {
        status: 400,
        json: { success: false, message: 'Unknown action' },
      };
  }
};

export default settingsApi;