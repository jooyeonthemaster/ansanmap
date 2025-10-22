/**
 * Device ID 관리 유틸리티
 *
 * 익명 사용자 식별을 위한 기기 ID 생성 및 관리
 * localStorage 기반 영구 저장
 */

const STORAGE_KEY_DEVICE_ID = 'asv_device_id';
const STORAGE_KEY_USER_NAME = 'asv_user_name';

/**
 * 랜덤 문자열 생성
 * @param length 문자열 길이
 * @returns 랜덤 문자열
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Device ID 가져오기 (없으면 생성)
 *
 * localStorage에 저장된 Device ID를 반환하거나,
 * 없으면 새로 생성하여 저장 후 반환
 *
 * @returns Device ID 문자열
 */
export function getOrCreateDeviceId(): string {
  // 서버 사이드 렌더링 체크
  if (typeof window === 'undefined') {
    return 'device_ssr_temporary';
  }

  try {
    // 기존 ID 확인
    let deviceId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);

    if (!deviceId) {
      // 새 ID 생성
      const timestamp = Date.now();
      const randomStr = generateRandomString(16);
      deviceId = `device_${timestamp}_${randomStr}`;

      // 저장
      localStorage.setItem(STORAGE_KEY_DEVICE_ID, deviceId);

      console.log('[Device ID] 새 기기 ID 생성:', deviceId);
    }

    return deviceId;
  } catch (error) {
    // localStorage 접근 불가 시 임시 ID
    console.error('[Device ID] localStorage 접근 실패:', error);
    return `device_temp_${Date.now()}_${generateRandomString(8)}`;
  }
}

/**
 * 사용자 닉네임 가져오기
 * @returns 사용자 닉네임 (기본값: '방문자')
 */
export function getUserNickname(): string {
  if (typeof window === 'undefined') {
    return '방문자';
  }

  try {
    return localStorage.getItem(STORAGE_KEY_USER_NAME) || '방문자';
  } catch (error) {
    console.error('[Device ID] 닉네임 가져오기 실패:', error);
    return '방문자';
  }
}

/**
 * 사용자 닉네임 설정
 * @param nickname 설정할 닉네임
 */
export function setUserNickname(nickname: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const trimmed = nickname.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY_USER_NAME, trimmed);
      console.log('[Device ID] 닉네임 설정:', trimmed);
    }
  } catch (error) {
    console.error('[Device ID] 닉네임 설정 실패:', error);
  }
}

/**
 * Device ID 초기화 (테스트용)
 *
 * 주의: 기존 채팅 이력과 연결이 끊어집니다
 */
export function resetDeviceId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY_DEVICE_ID);
    localStorage.removeItem(STORAGE_KEY_USER_NAME);
    console.log('[Device ID] 기기 ID 및 닉네임 초기화 완료');
  } catch (error) {
    console.error('[Device ID] 초기화 실패:', error);
  }
}

/**
 * 현재 Device ID 확인 (생성하지 않음)
 * @returns Device ID 또는 null
 */
export function getDeviceIdIfExists(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(STORAGE_KEY_DEVICE_ID);
  } catch (error) {
    console.error('[Device ID] Device ID 조회 실패:', error);
    return null;
  }
}
