/**
 * 채팅방 API
 *
 * 채팅방 생성, 조회, 업데이트, 삭제 기능 제공
 */

import { supabase } from './client';
import type { ChatRoom, RoomType } from '../types';
import type { Database } from './database.types';

/**
 * 특정 디바이스의 채팅방 가져오기 (있으면 반환, 없으면 생성)
 *
 * @param deviceId 디바이스 ID
 * @param userName 사용자 닉네임
 * @param roomType 채팅방 타입
 * @returns 채팅방 객체
 */
export async function getOrCreateChatRoom(
  deviceId: string,
  userName: string = '방문자',
  roomType: RoomType = 'general'
): Promise<ChatRoom | null> {
  try {
    // 1. 기존 활성 채팅방 확인
    const { data, error: selectError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('user_device_id', deviceId)
      .eq('status', 'active')
      .eq('room_type', roomType)
      .order('created_at', { ascending: false })
      .limit(1);

    if (selectError) {
      console.error('[Chat API] 채팅방 조회 실패:', selectError);
      return null;
    }

    // 기존 채팅방이 있으면 반환
    const existingRooms = (data || []) as ChatRoom[];
    if (existingRooms.length > 0) {
      console.log('[Chat API] 기존 채팅방 발견:', existingRooms[0].id);
      return existingRooms[0];
    }

    // 2. 새 채팅방 생성
    const newRoom: Database['public']['Tables']['chat_rooms']['Insert'] = {
      user_device_id: deviceId,
      user_name: userName,
      room_type: roomType,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Supabase type inference issue during build, types are correct at runtime
    const { data: createdRoom, error: insertError } = await supabase
      .from('chat_rooms')
      .insert(newRoom)
      .select()
      .single();

    if (insertError || !createdRoom) {
      console.error('[Chat API] 채팅방 생성 실패:', insertError);
      return null;
    }
    console.log('[Chat API] 새 채팅방 생성:', createdRoom.id);
    return createdRoom;
  } catch (error) {
    console.error('[Chat API] getOrCreateChatRoom 예외:', error);
    return null;
  }
}

/**
 * 모든 활성 채팅방 가져오기 (관리자용)
 *
 * @param status 상태 필터 (기본: 'active')
 * @returns 채팅방 목록
 */
export async function getAllChatRooms(status: 'active' | 'closed' | 'all' = 'active'): Promise<ChatRoom[]> {
  try {
    let query = supabase
      .from('chat_rooms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Chat API] 채팅방 목록 조회 실패:', error);
      return [];
    }

    return data as ChatRoom[];
  } catch (error) {
    console.error('[Chat API] getAllChatRooms 예외:', error);
    return [];
  }
}

/**
 * 채팅방 ID로 조회
 *
 * @param roomId 채팅방 ID
 * @returns 채팅방 객체 또는 null
 */
export async function getChatRoom(roomId: string): Promise<ChatRoom | null> {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('[Chat API] 채팅방 조회 실패:', error);
      return null;
    }

    return data as ChatRoom;
  } catch (error) {
    console.error('[Chat API] getChatRoom 예외:', error);
    return null;
  }
}

/**
 * 채팅방 정보 업데이트
 *
 * @param roomId 채팅방 ID
 * @param updates 업데이트할 필드
 * @returns 업데이트된 채팅방 객체 또는 null
 */
export async function updateChatRoom(
  roomId: string,
  updates: Partial<Omit<ChatRoom, 'id' | 'created_at'>>
): Promise<ChatRoom | null> {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      console.error('[Chat API] 채팅방 업데이트 실패:', error);
      return null;
    }

    console.log('[Chat API] 채팅방 업데이트 완료:', roomId);
    return data as ChatRoom;
  } catch (error) {
    console.error('[Chat API] updateChatRoom 예외:', error);
    return null;
  }
}

/**
 * 채팅방 종료
 *
 * @param roomId 채팅방 ID
 * @returns 성공 여부
 */
export async function closeChatRoom(roomId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ status: 'closed' })
      .eq('id', roomId);

    if (error) {
      console.error('[Chat API] 채팅방 종료 실패:', error);
      return false;
    }

    console.log('[Chat API] 채팅방 종료 완료:', roomId);
    return true;
  } catch (error) {
    console.error('[Chat API] closeChatRoom 예외:', error);
    return false;
  }
}

/**
 * 채팅방 삭제
 *
 * @param roomId 채팅방 ID
 * @returns 성공 여부
 */
export async function deleteChatRoom(roomId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      console.error('[Chat API] 채팅방 삭제 실패:', error);
      return false;
    }

    console.log('[Chat API] 채팅방 삭제 완료:', roomId);
    return true;
  } catch (error) {
    console.error('[Chat API] deleteChatRoom 예외:', error);
    return false;
  }
}

/**
 * 채팅방 타입 변경 (일반 ↔ 민원)
 *
 * @param roomId 채팅방 ID
 * @param newType 새로운 채팅방 타입
 * @returns 성공 여부
 */
export async function changeChatRoomType(
  roomId: string,
  newType: RoomType
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ room_type: newType })
      .eq('id', roomId);

    if (error) {
      console.error('[Chat API] 채팅방 타입 변경 실패:', error);
      return false;
    }

    console.log('[Chat API] 채팅방 타입 변경:', roomId, '→', newType);
    return true;
  } catch (error) {
    console.error('[Chat API] changeChatRoomType 예외:', error);
    return false;
  }
}

/**
 * 채팅방의 미읽음 메시지 수 초기화
 *
 * @param roomId 채팅방 ID
 * @returns 성공 여부
 */
export async function resetUnreadCount(roomId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ unread_count: 0 })
      .eq('id', roomId);

    if (error) {
      console.error('[Chat API] 미읽음 수 초기화 실패:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Chat API] resetUnreadCount 예외:', error);
    return false;
  }
}

/**
 * 채팅방 검색 (메시지 내용 기반)
 *
 * @param searchQuery 검색어
 * @param status 채팅방 상태 (기본: 'active')
 * @returns 검색된 채팅방 목록
 */
export async function searchChatRooms(
  searchQuery: string,
  status: 'active' | 'closed' = 'active'
): Promise<ChatRoom[]> {
  try {
    if (!searchQuery.trim()) {
      return getAllChatRooms(status);
    }

    // 1. 메시지 내용에서 검색어가 포함된 room_id 찾기
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('room_id')
      .ilike('content', `%${searchQuery}%`);

    if (msgError) {
      console.error('[Chat API] 메시지 검색 실패:', msgError);
      return [];
    }

    // 2. 중복 제거 및 room_id 목록 추출
    const roomIds = [...new Set(messages?.map((m) => m.room_id) || [])];

    if (roomIds.length === 0) {
      console.log('[Chat API] 검색 결과 없음:', searchQuery);
      return [];
    }

    // 3. room_id로 채팅방 정보 가져오기
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('status', status)
      .in('id', roomIds)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Chat API] 채팅방 조회 실패:', error);
      return [];
    }

    console.log(`[Chat API] 채팅방 검색 완료: "${searchQuery}" - ${data.length}개 결과`);
    return (data as ChatRoom[]) || [];
  } catch (error) {
    console.error('[Chat API] searchChatRooms 예외:', error);
    return [];
  }
}

/**
 * 채팅방 중요 표시 토글
 *
 * @param roomId 채팅방 ID
 * @param isImportant 중요 표시 여부
 * @returns 성공 여부
 */
export async function toggleChatRoomImportant(
  roomId: string,
  isImportant: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_important: isImportant })
      .eq('id', roomId);

    if (error) {
      console.error('[Chat API] 중요 표시 토글 실패:', error);
      return false;
    }

    console.log('[Chat API] 중요 표시 토글:', roomId, '→', isImportant);
    return true;
  } catch (error) {
    console.error('[Chat API] toggleChatRoomImportant 예외:', error);
    return false;
  }
}

/**
 * 중요 채팅방만 조회
 *
 * @param status 채팅방 상태 (기본: 'active')
 * @returns 중요 채팅방 목록
 */
export async function getImportantChatRooms(
  status: 'active' | 'closed' = 'active'
): Promise<ChatRoom[]> {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('status', status)
      .eq('is_important', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Chat API] 중요 채팅방 조회 실패:', error);
      return [];
    }

    console.log('[Chat API] 중요 채팅방 조회 완료:', data.length);
    return (data as ChatRoom[]) || [];
  } catch (error) {
    console.error('[Chat API] getImportantChatRooms 예외:', error);
    return [];
  }
}

/**
 * 실시간 채팅방 구독
 *
 * @param callback 채팅방 변경 시 호출될 콜백 함수
 * @returns 구독 해제 함수
 */
export function subscribeToChatRooms(
  callback: (rooms: ChatRoom[]) => void
): () => void {
  console.log('[Chat API] 채팅방 실시간 구독 시작');

  const channel = supabase
    .channel('chat_rooms_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_rooms',
      },
      async () => {
        // 변경 발생 시 전체 목록 재로드
        const rooms = await getAllChatRooms('active');
        callback(rooms);
      }
    )
    .subscribe();

  // 구독 해제 함수 반환
  return () => {
    console.log('[Chat API] 채팅방 실시간 구독 해제');
    supabase.removeChannel(channel);
  };
}
