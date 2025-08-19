
import { SettingsTranslations } from '../types/settings';

export const settingsTranslations: SettingsTranslations = {
	// General Settings - Tabs
  systemSettings: "시스템 설정",
  mailSettings: "메일 설정",
  
	// General Settings - System Settings
  appName: "앱 이름",
  appURL: "앱 URL",
  senderName: "발신자 이름",
  senderEmail: "발신자 이메일 주소",
  hideControls: "컨트롤 숨기기",
  
	// General Settings - Mail Settings
  smtpSettings: "SMTP 구성",
  smtpEnabled: "SMTP 활성화",
  smtpHost: "SMTP 호스트",
  smtpPort: "SMTP 포트",
  smtpUsername: "SMTP 사용자 이름",
  smtpPassword: "SMTP 비밀번호",
  smtpAuthMethod: "인증 방법",
  enableTLS: "TLS 활성화",
  localName: "로컬 이름",
  
	// General Settings - Test Email
  testEmail: "테스트 이메일",
  sendTestEmail: "테스트 이메일 전송",
  emailTemplate: "이메일 템플릿",
  verification: "검증",
  passwordReset: "비밀번호 재설정",
  confirmEmailChange: "이메일 변경 확인",
  otp: "OTP",
  loginAlert: "로그인 알림",
  authCollection: "인증 컬렉션",
  selectCollection: "컬렉션 선택",
  toEmailAddress: "받는 이메일",
  enterEmailAddress: "이메일 주소 입력",
  sending: "전송 중...",
  
  // General Settings - Actions and status
  save: "변경 사항 저장",
  saving: "저장 중...",
  settingsUpdated: "설정이 성공적으로 업데이트되었습니다",
  errorSavingSettings: "설정 저장 중 오류 발생",
  errorFetchingSettings: "설정 불러오기 중 오류 발생",
  testConnection: "연결 테스트",
  testingConnection: "연결 테스트 중...",
  connectionSuccess: "연결 성공",
  connectionFailed: "연결 실패",

	// User Management
  addUser: "사용자 추가",
  permissionNotice: "권한 안내:",
  permissionNoticeAddUser: "관리자 계정은 시스템 및 메일 설정을 확인하거나 변경할 수 없습니다. 이 설정은 슈퍼 관리자만 접근 및 수정할 수 있습니다. 시스템 구성 또는 메일 설정 변경이 필요하면 슈퍼 관리자에게 문의하세요.",
  loadingSettings: "설정 로딩 중...",
  loadingSettingsError: "설정 로딩 중 오류 발생",
};