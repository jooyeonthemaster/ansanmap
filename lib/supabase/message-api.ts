/**
 * 메시지 API
 *
 * 메시지 전송, 조회, 읽음 처리 기능 제공
 */

import { supabase } from './client';
import type { Message, CreateMessageDto, SenderType } from '../types';
import { updateChatRoom } from './chat-api';

/**
 * 채팅방의 메시지 목록 가져오기
 *
 * @param roomId 채팅방 ID
 * @param limit 가져올 메시지 개수 (기본: 50)
 * @returns 메시지 목록 (최신순)
 */
export async function getMessages(
  roomId: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[Message API] 메시지 조회 실패:', error);
      return [];
    }

    return data as Message[];
  } catch (error) {
    console.error('[Message API] getMessages 예외:', error);
    return [];
  }
}

/**
 * 메시지 검색
 *
 * @param roomId 채팅방 ID
 * @param searchQuery 검색어
 * @returns 검색된 메시지 목록
 */
export async function searchMessages(
  roomId: string,
  searchQuery: string
): Promise<Message[]> {
  try {
    if (!searchQuery.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .ilike('content', `%${searchQuery}%`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Message API] 메시지 검색 실패:', error);
      return [];
    }

    console.log(`[Message API] 메시지 검색 완료: "${searchQuery}" - ${data.length}개 결과`);
    return data as Message[];
  } catch (error) {
    console.error('[Message API] searchMessages 예외:', error);
    return [];
  }
}

/**
 * 메시지 전송
 *
 * @param messageData 메시지 데이터
 * @returns 생성된 메시지 또는 null
 */
export async function sendMessage(
  messageData: CreateMessageDto
): Promise<Message | null> {
  try {
    // 메시지 길이 검증
    if (!messageData.content || messageData.content.trim().length === 0) {
      console.error('[Message API] 빈 메시지 전송 불가');
      return null;
    }

    if (messageData.content.length > 1000) {
      console.error('[Message API] 메시지가 너무 깁니다 (최대 1000자)');
      return null;
    }

    // 메시지 삽입
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: messageData.room_id,
        sender_type: messageData.sender_type,
        content: messageData.content.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Message API] 메시지 전송 실패:', error);
      return null;
    }

    // 채팅방의 last_message 및 updated_at 업데이트
    await updateChatRoom(messageData.room_id, {
      last_message: messageData.content.trim().substring(0, 100),
      last_message_at: new Date().toISOString(),
    });

    // 사용자 메시지인 경우 unread_count 증가
    if (messageData.sender_type === 'user') {
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('unread_count')
        .eq('id', messageData.room_id)
        .single();

      if (room) {
        await supabase
          .from('chat_rooms')
          .update({ unread_count: (room.unread_count || 0) + 1 })
          .eq('id', messageData.room_id);
      }
    }

    console.log('[Message API] 메시지 전송 완료:', data.id);
    return data as Message;
  } catch (error) {
    console.error('[Message API] sendMessage 예외:', error);
    return null;
  }
}

/**
 * 메시지 읽음 처리
 *
 * @param messageIds 읽음 처리할 메시지 ID 배열
 * @returns 성공 여부
 */
export async function markMessagesAsRead(messageIds: string[]): Promise<boolean> {
  try {
    if (messageIds.length === 0) {
      return true;
    }

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds);

    if (error) {
      console.error('[Message API] 메시지 읽음 처리 실패:', error);
      return false;
    }

    console.log('[Message API] 메시지 읽음 처리 완료:', messageIds.length, '개');
    return true;
  } catch (error) {
    console.error('[Message API] markMessagesAsRead 예외:', error);
    return false;
  }
}

/**
 * 채팅방의 모든 미읽음 메시지 읽음 처리
 *
 * @param roomId 채팅방 ID
 * @param senderType 읽음 처리할 발신자 타입 (예: 'user' 메시지만)
 * @returns 성공 여부
 */
export async function markRoomMessagesAsRead(
  roomId: string,
  senderType?: SenderType
): Promise<boolean> {
  try {
    let query = supabase
      .from('messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .eq('is_read', false);

    if (senderType) {
      query = query.eq('sender_type', senderType);
    }

    const { error } = await query;

    if (error) {
      console.error('[Message API] 채팅방 메시지 읽음 처리 실패:', error);
      return false;
    }

    // unread_count 초기화
    if (senderType === 'user' || !senderType) {
      await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('id', roomId);
    }

    console.log('[Message API] 채팅방 메시지 읽음 처리 완료:', roomId);
    return true;
  } catch (error) {
    console.error('[Message API] markRoomMessagesAsRead 예외:', error);
    return false;
  }
}

/**
 * 특정 메시지 삭제
 *
 * @param messageId 메시지 ID
 * @returns 성공 여부
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('[Message API] 메시지 삭제 실패:', error);
      return false;
    }

    console.log('[Message API] 메시지 삭제 완료:', messageId);
    return true;
  } catch (error) {
    console.error('[Message API] deleteMessage 예외:', error);
    return false;
  }
}

/**
 * 채팅방의 미읽음 메시지 개수 조회
 *
 * @param roomId 채팅방 ID
 * @param senderType 발신자 타입 (기본: 'user')
 * @returns 미읽음 메시지 개수
 */
export async function getUnreadCount(
  roomId: string,
  senderType: SenderType = 'user'
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('sender_type', senderType)
      .eq('is_read', false);

    if (error) {
      console.error('[Message API] 미읽음 개수 조회 실패:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('[Message API] getUnreadCount 예외:', error);
    return 0;
  }
}

/**
 * 실시간 메시지 구독
 *
 * @param roomId 채팅방 ID
 * @param callback 새 메시지 수신 시 호출될 콜백 함수
 * @returns 구독 해제 함수
 */
export function subscribeToMessages(
  roomId: string,
  callback: (message: Message) => void
): () => void {
  console.log('[Message API] 메시지 실시간 구독 시작:', roomId);

  // 고유한 채널 이름으로 캐시 우회
  const channelName = `messages_v2:${roomId}:${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log('[Message API] 🔥 새 메시지 수신 (Realtime):', payload);
        console.log('[Message API] 📩 메시지 데이터:', payload.new);
        callback(payload.new as Message);
      }
    )
    .subscribe((status, err) => {
      console.log('[Message API] 📡 구독 상태:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[Message API] ✅ Realtime 구독 성공!');
      } else if (status === 'CHANNEL_ERROR') {
        // 에러가 발생해도 메시지는 정상 작동하므로 경고만 표시
        console.warn('[Message API] ⚠️ Realtime 구독 에러 (기능은 정상):', err?.message || 'Unknown error');
      } else if (status === 'TIMED_OUT') {
        console.error('[Message API] ⏱️ Realtime 구독 타임아웃!');
      } else if (status === 'CLOSED') {
        console.warn('[Message API] 🔒 Realtime 채널 닫힘');
      }
    });

  // 구독 해제 함수 반환
  return () => {
    console.log('[Message API] 메시지 실시간 구독 해제:', roomId);
    supabase.removeChannel(channel);
  };
}

/**
 * 관리자용: 모든 채팅방의 메시지 실시간 구독
 *
 * @param callback 새 메시지 수신 시 호출될 콜백 함수
 * @returns 구독 해제 함수
 */
export function subscribeToAllMessages(
  callback: (message: Message) => void
): () => void {
  console.log('[Message API] 전체 메시지 실시간 구독 시작 (관리자)');

  // 고유한 채널 이름으로 캐시 우회
  const channelName = `all_messages_v2:${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('[Message API] 새 메시지 수신 (전체):', payload.new);
        callback(payload.new as Message);
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Message API] ✅ 관리자 Realtime 구독 성공!');
      } else if (status === 'CHANNEL_ERROR') {
        console.warn('[Message API] ⚠️ 관리자 Realtime 구독 에러 (기능은 정상):', err?.message || 'Unknown error');
      }
    });

  // 구독 해제 함수 반환
  return () => {
    console.log('[Message API] 전체 메시지 실시간 구독 해제');
    supabase.removeChannel(channel);
  };
}
