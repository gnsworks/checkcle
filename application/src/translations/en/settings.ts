
import { SettingsTranslations } from '../types/settings';

export const settingsTranslations: SettingsTranslations = {
	// General Settings - Tabs
  systemSettings: "System Settings",
  mailSettings: "Mail Settings",
  
	// General Settings - System Settings
  appName: "Application Name",
  appURL: "Application URL",
  senderName: "Sender Name",
  senderEmail: "Sender Email Address",
  hideControls: "Hide Controls",
  
	// General Settings - Mail Settings
  smtpSettings: "SMTP Configuration",
  smtpEnabled: "Enable SMTP",
  smtpHost: "SMTP Host",
  smtpPort: "SMTP Port",
  smtpUsername: "SMTP Username",
  smtpPassword: "SMTP Password",
  smtpAuthMethod: "Authentication Method",
  enableTLS: "Enable TLS",
  localName: "Local Name",
  
	// General Settings - Test Email
  testEmail: "Test Email",
  sendTestEmail: "Send test email",
  emailTemplate: "Email template",
  verification: "Verification",
  passwordReset: "Password reset",
  confirmEmailChange: "Confirm email change",
  otp: "OTP",
  loginAlert: "Login alert",
  authCollection: "Auth collection",
  selectCollection: "Select collection",
  toEmailAddress: "To email address",
  enterEmailAddress: "Enter email address",
  sending: "Sending...",
  
  // General Settings - Actions and status
  save: "Save Changes",
  saving: "Saving...",
  settingsUpdated: "Settings updated successfully",
  errorSavingSettings: "Error saving settings",
  errorFetchingSettings: "Error loading settings",
  testConnection: "Test Connection",
  testingConnection: "Testing Connection...",
  connectionSuccess: "Connection successful",
  connectionFailed: "Connection failed",

	// User Management
	addUser: "Add User",
	permissionNotice: "Permission Notice:",
	permissionNoticeAddUser: "As an admin user, you do not have access to view or modify system and mail settings. These settings can only be accessed and modified by Super Admins. Contact your Super Admin if you need to make changes to system configuration or mail settings.",
	loadingSettings: "Loading settings...",
	loadingSettingsError: "Error loading settings",
};