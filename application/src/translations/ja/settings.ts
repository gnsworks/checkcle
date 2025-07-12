import { SettingsTranslations } from '../types/settings';

export const settingsTranslations: SettingsTranslations = {
  // タブ
  systemSettings: "システム設定",
  mailSettings: "メール設定",
  
  // システム設定
  appName: "アプリケーション名",
  appURL: "アプリケーションURL",
  senderName: "送信者名",
  senderEmail: "送信者メールアドレス",
  hideControls: "コントロールを非表示",
  
  // メール設定
  smtpSettings: "SMTP設定",
  smtpEnabled: "SMTPを有効にする",
  smtpHost: "SMTPホスト",
  smtpPort: "SMTPポート",
  smtpUsername: "SMTPユーザー名",
  smtpPassword: "SMTPパスワード",
  smtpAuthMethod: "認証方式",
  enableTLS: "TLSを有効にする",
  localName: "ローカル名",
  
  // テストメール
  testEmail: "テストメール",
  sendTestEmail: "テストメールを送信",
  emailTemplate: "メールテンプレート",
  verification: "認証",
  passwordReset: "パスワードリセット",
  confirmEmailChange: "メールアドレス変更確認",
  otp: "OTP",
  loginAlert: "ログインアラート",
  authCollection: "認証コレクション",
  selectCollection: "コレクションを選択",
  toEmailAddress: "宛先メールアドレス",
  enterEmailAddress: "メールアドレスを入力",
  sending: "送信中...",
  
  // アクションとステータス
  save: "変更を保存",
  saving: "保存中...",
  settingsUpdated: "設定が正常に更新されました",
  errorSavingSettings: "設定の保存中にエラーが発生しました",
  errorFetchingSettings: "設定の読み込み中にエラーが発生しました",
  testConnection: "接続テスト",
  testingConnection: "接続テスト中...",
  connectionSuccess: "接続成功",
  connectionFailed: "接続失敗"
};