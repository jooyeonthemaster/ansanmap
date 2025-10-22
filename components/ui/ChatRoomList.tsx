'use client';

import { AlertCircle, MessageCircle, Clock, User, Star } from 'lucide-react';
import type { ChatRoom } from '@/lib/types';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (room: ChatRoom) => void;
  onToggleImportant?: (roomId: string, currentValue: boolean) => void;
}

export default function ChatRoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onToggleImportant
}: ChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>채팅방이 없습니다</p>
        </div>
      </div>
    );
  }

  // 중요 → 민원 → 일반 순, 최신순
  const sortedRooms = [...rooms].sort((a, b) => {
    // 중요 표시 우선
    if (a.is_important && !b.is_important) return -1;
    if (!a.is_important && b.is_important) return 1;

    // 민원 우선
    if (a.room_type === 'complaint' && b.room_type !== 'complaint') return -1;
    if (a.room_type !== 'complaint' && b.room_type === 'complaint') return 1;

    // 최신순
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {sortedRooms.map((room) => {
        const isSelected = room.id === selectedRoomId;
        const isComplaint = room.room_type === 'complaint';
        const hasUnread = room.unread_count > 0;

        return (
          <div
            key={room.id}
            className={`w-full text-left border-b transition-colors ${
              isSelected
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : 'hover:bg-gray-50 border-l-4 border-l-transparent'
            }`}
          >
            <div className="flex">
              {/* 메인 영역 (클릭하면 채팅방 선택) */}
              <button
                onClick={() => onSelectRoom(room)}
                className="flex-1 p-3 text-left"
              >
                {/* 헤더: 사용자 이름 + 타입 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-sm">
                      {room.user_name || '방문자'}
                    </span>
                    {isComplaint && (
                      <span title="민원">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </span>
                    )}
                    {room.is_important && (
                      <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    )}
                  </div>

                  {/* 미읽음 배지 */}
                  {hasUnread && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {room.unread_count}
                    </span>
                  )}
                </div>

                {/* 마지막 메시지 */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                  {room.last_message || '메시지가 없습니다'}
                </p>

                {/* 시간 */}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {room.last_message_at
                    ? formatRelativeTime(room.last_message_at)
                    : formatRelativeTime(room.created_at)}
                </div>
              </button>

              {/* 중요 표시 버튼 (오른쪽 영역) */}
              {onToggleImportant && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleImportant(room.id, room.is_important || false);
                  }}
                  className="px-3 flex items-center hover:bg-gray-100 transition-colors"
                  title={room.is_important ? '중요 해제' : '중요 표시'}
                >
                  <Star
                    className={`w-5 h-5 ${
                      room.is_important ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                    fill={room.is_important ? 'currentColor' : 'none'}
                  />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 상대 시간 포맷팅
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
