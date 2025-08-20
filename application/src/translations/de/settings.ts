import { SettingsTranslations } from '../types/settings';

export const settingsTranslations: SettingsTranslations = {
  // Tabs
  systemSettings: "Systemeinstellungen",
  mailSettings: "E-Mail-Einstellungen",

  // System Settings
  appName: "Anwendungsname",
  appURL: "Anwendungs-URL",
  senderName: "Absendername",
  senderEmail: "Absender-E-Mail-Adresse",
  hideControls: "Steuerelemente ausblenden",

  // Mail Settings
  smtpSettings: "SMTP-Konfiguration",
  smtpEnabled: "SMTP aktivieren",
  smtpHost: "SMTP-Host",
  smtpPort: "SMTP-Port",
  smtpUsername: "SMTP-Benutzername",
  smtpPassword: "SMTP Password",
  smtpAuthMethod: "Authentifizierungsmethode",
  enableTLS: "TLS aktivieren",
  localName: "Lokaler Name",

  // Test Email
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

  // Actions and status
  save: "Änderungen speichern",
  saving: "Speichere...",
  settingsUpdated: "Einstellungen erfolgreich aktualisiert",
  errorSavingSettings: "Fehler beim Speichern der Einstellungen",
  errorFetchingSettings: "Error loading settings",
  testConnection: "Verbindung testen",
  testingConnection: "Verbindung wird getestet...",
  connectionSuccess: "Verbindung erfolgreich",
  connectionFailed: "Verbindung fehlgeschlagen",

  // Ergänzte fehlende Einträge
  addUser: "Benutzer hinzufügen",
  permissionNotice: "Berechtigungshinweis:",
  permissionNoticeAddUser: "Als Admin-Benutzer haben Sie keinen Zugriff auf die Anzeige oder Änderung von System- und E-Mail-Einstellungen. Diese Einstellungen können nur von Super-Admins aufgerufen und geändert werden. Wenden Sie sich an Ihren Super-Admin, wenn Sie Änderungen an der Systemkonfiguration oder den E-Mail-Einstellungen vornehmen müssen.",
  loadingSettings: "Einstellungen werden geladen...",
  loadingSettingsError: "Fehler beim Laden der Einstellungen",
};
