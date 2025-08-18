import { ServicesTranslations } from '../types/services';

export const servicesTranslations: ServicesTranslations = {
  // Service Table
  serviceStatus: "Dienststatus",
  responseTime: "Antwortzeit",
  uptime: "Betriebszeit",
  lastChecked: "Zuletzt überprüft",
  noServices: "Keine Dienste entsprechen Ihren Filterkriterien.",
  currentlyMonitoring: "Derzeit überwacht",
  retry: "Wiederholen",
  overview: "Überblick",
  newService: "Neuer Dienst",
  rowsPerPage: "Zeilen pro Seite",
  search: "Suchen",
  allTypes: "Alle Arten",
  createNewService: "Neuen Service hinzufügen",
  createNewServiceDesc: "Geben Sie detaillierte Informationen ein, um einen neuen zu erstellen, den Sie überwachen möchten.",

  // ServiceBasicFields.tsx
  serviceName: "Dienstname",
  serviceNameDesc: "Geben Sie einen aussagekräftigen Namen für Ihren Service ein",

  // ServiceConfigFields.tsx
  checkInterval: "Prüfintervall",
  seconds: "Sekunden",
  minute: "Minute",
  minutes: "Minuten",
  hour: "Stunde",
  hours: "Stunden",
  custom: "Benutzerdefiniert",
  checkIntervalPlaceholder: "Intervall in Sekunden eingeben",
  backToPresets: "Zurück zu Voreinstellungen",
  checkIntervalDesc: "Wie oft der Dienststatus überprüft werden soll",
  checkIntervalDescCustom: "Benutzerdefiniertes Intervall in Sekunden eingeben (mindestens 10 Sekunden)",
  retryAttempts: "Wiederholungsversuche",
  attempt: "Versuch",
  attempts: "Versuche",
  retryAttemptsDesc: "Anzahl der Wiederholungsversuche, bevor der Dienst als ausgefallen markiert wird",

  // ServiceForm.tsx
  updateService: "Dienst aktualisieren",
  createService: "Dienst erstellen",

  // ServiceNotificationFields.tsx
  enableNotifications: "Benachrichtigungen aktivieren",
  enableNotificationsDesc: "Benachrichtigungen für diesen Dienst aktivieren oder deaktivieren",
  notificationChannels: "Benachrichtigungskanäle",
  notificationChannelsEnabledDesc: "Benachrichtigungskanäle für diesen Dienst auswählen",
  notificationChannelsDesc: "Aktivieren Sie zuerst Benachrichtigungen, um Kanäle auszuwählen",
  notificationChannelsPlaceholder: "Benachrichtigungskanal hinzufügen",
  alertTemplate: "Alarmvorlage",
  alertTemplateLoading: "Lade Vorlagen...",
  alertTemplatePlaceholder: "Alarmvorlage auswählen",
  alertTemplateEnabledDesc: "Wählen Sie eine Vorlage für Alarmmeldungen",
  alertTemplateDesc: "Aktivieren Sie zuerst Benachrichtigungen, um eine Vorlage auszuwählen",

  // ServiceTypeField.tsx
  serviceType: "Diensttyp",
  serviceTypeHTTPDesc: "Webseiten und REST-APIs mit HTTP/HTTPS-Protokoll überwachen",
  serviceTypePINGDesc: "Host-Verfügbarkeit mit PING-Protokoll überwachen",
  serviceTypeTCPDesc: "TCP-Port-Konnektivität mit TCP-Protokoll überwachen",
  serviceTypeDNSDesc: "DNS-Auflösung überwachen",

  // ServiceRegionalFields.tsx
  regionalMonitoring: "Regionale Überwachung",
  regionalMonitoringDesc: "Diesen Dienst regionalen Überwachungsagenten für verteilte Überwachung zuweisen",
  regionalAgents: "Regionale Agenten",
  regionalAgentsLoading: "Lade Agenten...",
  regionalAgentsAvailablePlaceholder: "Zusätzliche regionale Agenten auswählen...",
  regionalAgentsAllSelected: "Alle verfügbaren Agenten ausgewählt",
  regionalAgentsNoAvailable: "Keine regionalen Agenten verfügbar",
  regionalAgentsNoOnlineAvailable: "Keine regionalen Agenten online verfügbar",
  regionalAgentsNotFoundMessage: "Keine regionalen Online-Agenten gefunden. Dienste verwenden die Standardüberwachung.",
  regionalAgentsNotSelectedMessage: "Keine regionalen Agenten ausgewählt. Der Dienst verwendet die Standardüberwachung.",

  // ServiceUrlField.tsx
  targetDefault: "Ziel-URL/Host",
  targetDNS: "Domainname",
  targetHTTPDesc: "Geben Sie die vollständige URL inklusive Protokoll ein (http:// oder https://)",
  targetPINGDesc: "Geben Sie den Hostnamen oder die IP-Adresse zum Pingen ein",
  targetTCPDesc: "Geben Sie Hostname oder IP-Adresse für TCP-Verbindungstest ein",
  targetTCPPortDesc: "Geben Sie die Portnummer für den TCP-Verbindungstest ein",
  targetDNSDesc: "Domainnamen für DNS-Überwachung eingeben (A, AAAA, MX, etc.)",
  targetDefaultDesc: "Geben Sie die Ziel-URL oder den Hostnamen für die Überwachung ein",
  targetDefaultPlaceholder: "URL oder Hostname eingeben",

  // types.ts
  serviceNameRequired: "Dienstname ist erforderlich",
  urlDomainHostRequired: "URL/Domain/Host ist erforderlich",
  enterValidUrlHostnameDomain: "Bitte eine gültige URL, einen Hostnamen oder eine Domain eingeben",

  // Dashboard
  upServices: "DIENSTE ONLINE",
  downServices: "DIENSTE OFFLINE",
  pausedServices: "DIENSTE PAUSIERT",
  warningServices: "DIENSTE MIT WARNUNG",
};
