'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X, Check, Search, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ChatRoom, Message } from '@/lib/types';
import {
  getAllChatRooms,
  subscribeToChatRooms,
  closeChatRoom,
  searchChatRooms,
  toggleChatRoomImportant,
} from '@/lib/supabase/chat-api';
import {
  getMessages,
  sendMessage,
  markRoomMessagesAsRead,
  subscribeToMessages,
  searchMessages,
} from '@/lib/supabase/message-api';
import ChatRoomList from './ui/ChatRoomList';
import ChatMessageList from './ui/ChatMessageList';
import MessageInput from './ui/MessageInput';

export default function AdminChatManager() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [allRooms, setAllRooms] = useState<ChatRoom[]>([]); // 전체 채팅방 (검색/필터용)
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]); // 전체 메시지 (검색용)
  const [loading, setLoading] = useState(true);

  // 메시지 검색 관련 상태
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 채팅방 검색 관련 상태
  const [showRoomSearch, setShowRoomSearch] = useState(false);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [isRoomSearching, setIsRoomSearching] = useState(false);

  // 중요 채팅방 필터
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);

  // 현재 메시지 구독 해제 함수 저장
  const [currentMessageUnsubscribe, setCurrentMessageUnsubscribe] = useState<(() => void) | null>(null);

  // 초기 로드
  useEffect(() => {
    let unsubscribeRooms: (() => void) | undefined;

    const init = async () => {
      setLoading(true);
      try {
        const loadedRooms = await getAllChatRooms('active');
        setRooms(loadedRooms);
        setAllRooms(loadedRooms); // 전체 채팅방 저장

        // 실시간 구독
        unsubscribeRooms = subscribeToChatRooms((updatedRooms) => {
          setRooms(updatedRooms);
          setAllRooms(updatedRooms); // 전체 채팅방도 업데이트
          toast.success('새 메시지가 도착했습니다');
        });
      } catch (error) {
        console.error('[AdminChatManager] 채팅방 로드 실패:', error);
        toast.error('채팅방 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };

    init();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (unsubscribeRooms) {
        console.log('[AdminChatManager] 컴포넌트 언마운트 - 채팅방 구독 해제');
        unsubscribeRooms();
      }
    };
  }, []);

  // 채팅방 목록 새로고침
  const loadRooms = async () => {
    setLoading(true);
    try {
      const loadedRooms = await getAllChatRooms('active');
      setRooms(loadedRooms);
    } catch (error) {
      console.error('[AdminChatManager] 채팅방 로드 실패:', error);
      toast.error('채팅방 목록을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 채팅방 선택
  const handleSelectRoom = async (room: ChatRoom) => {
    // 이전 채팅방 구독 해제
    if (currentMessageUnsubscribe) {
      console.log('[AdminChatManager] 이전 채팅방 구독 해제');
      currentMessageUnsubscribe();
      setCurrentMessageUnsubscribe(null);
    }

    setSelectedRoom(room);
    setShowSearch(false); // 검색 초기화
    setSearchQuery('');

    // 메시지 로드
    const msgs = await getMessages(room.id);
    setMessages(msgs);
    setAllMessages(msgs); // 전체 메시지 저장 (검색용)

    // 미읽음 메시지 읽음 처리 (사용자 메시지)
    await markRoomMessagesAsRead(room.id, 'user');

    // 실시간 구독
    const unsubscribe = subscribeToMessages(room.id, (newMessage) => {
      setMessages((prev) => {
        // 중복 메시지 방지: 이미 같은 ID의 메시지가 있으면 추가하지 않음
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // 전체 메시지에도 추가
      setAllMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // 사용자 메시지면 자동 읽음 처리
      if (newMessage.sender_type === 'user') {
        markRoomMessagesAsRead(room.id, 'user');
      }
    });

    // 새 구독 함수 저장
    setCurrentMessageUnsubscribe(() => unsubscribe);
  };

  // 관리자 메시지 전송
  const handleSendMessage = async (content: string) => {
    if (!selectedRoom) {
      toast.error('채팅방을 선택해주세요');
      return;
    }

    const message = await sendMessage({
      room_id: selectedRoom.id,
      sender_type: 'admin',
      content,
    });

    if (!message) {
      toast.error('메시지 전송에 실패했습니다');
      return;
    }

    // Realtime 구독으로 자동으로 추가되므로 로컬 추가 불필요
    // 중복 방지를 위해 주석 처리
  };

  // 채팅방 종료
  const handleCloseRoom = async () => {
    if (!selectedRoom) return;

    if (confirm('정말 채팅방을 종료하시겠습니까?')) {
      // 구독 해제
      if (currentMessageUnsubscribe) {
        console.log('[AdminChatManager] 채팅방 종료 - 구독 해제');
        currentMessageUnsubscribe();
        setCurrentMessageUnsubscribe(null);
      }

      const success = await closeChatRoom(selectedRoom.id);
      if (success) {
        toast.success('채팅방이 종료되었습니다');
        setSelectedRoom(null);
        setMessages([]);
        loadRooms(); // 목록 새로고침
      } else {
        toast.error('채팅방 종료에 실패했습니다');
      }
    }
  };

  // 검색 토글
  const handleToggleSearch = () => {
    if (showSearch) {
      // 검색 종료: 전체 메시지로 복원
      setShowSearch(false);
      setSearchQuery('');
      setMessages(allMessages);
    } else {
      // 검색 시작
      setShowSearch(true);
    }
  };

  // 메시지 검색 실행
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!selectedRoom) return;

    if (!query.trim()) {
      // 검색어가 없으면 전체 메시지 표시
      setMessages(allMessages);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = await searchMessages(selectedRoom.id, query);
    setMessages(results);
    setIsSearching(false);

    if (results.length === 0) {
      toast.error('검색 결과가 없습니다');
    }
  };

  // 채팅방 검색 토글
  const handleToggleRoomSearch = () => {
    if (showRoomSearch) {
      // 검색 종료: 전체 채팅방으로 복원
      setShowRoomSearch(false);
      setRoomSearchQuery('');
      setRooms(showOnlyImportant ? allRooms.filter((r) => r.is_important) : allRooms);
    } else {
      // 검색 시작
      setShowRoomSearch(true);
    }
  };

  // 채팅방 검색 실행
  const handleRoomSearch = async (query: string) => {
    setRoomSearchQuery(query);

    if (!query.trim()) {
      // 검색어가 없으면 전체 채팅방 표시 (또는 중요 필터 적용)
      setRooms(showOnlyImportant ? allRooms.filter((r) => r.is_important) : allRooms);
      setIsRoomSearching(false);
      return;
    }

    setIsRoomSearching(true);
    const results = await searchChatRooms(query, 'active');

    // 중요 필터가 활성화되어 있으면 중요 채팅방만 필터링
    const filteredResults = showOnlyImportant ? results.filter((r) => r.is_important) : results;
    setRooms(filteredResults);
    setIsRoomSearching(false);

    if (filteredResults.length === 0) {
      toast.error('검색 결과가 없습니다');
    } else {
      toast.success(`${filteredResults.length}개의 채팅방을 찾았습니다`);
    }
  };

  // 중요 채팅방 필터 토글
  const handleToggleImportantFilter = async () => {
    const newValue = !showOnlyImportant;
    setShowOnlyImportant(newValue);

    if (newValue) {
      // 중요 채팅방만 표시
      if (roomSearchQuery.trim()) {
        // 검색 중이면 검색 결과에서 중요 채팅방만 필터링
        const results = await searchChatRooms(roomSearchQuery, 'active');
        setRooms(results.filter((r) => r.is_important));
      } else {
        // 검색 중이 아니면 전체에서 중요 채팅방만 필터링
        setRooms(allRooms.filter((r) => r.is_important));
      }
      toast.success('중요 채팅방만 표시합니다');
    } else {
      // 전체 채팅방 표시
      if (roomSearchQuery.trim()) {
        // 검색 중이면 전체 검색 결과 표시
        const results = await searchChatRooms(roomSearchQuery, 'active');
        setRooms(results);
      } else {
        // 검색 중이 아니면 전체 채팅방 표시
        setRooms(allRooms);
      }
      toast.success('전체 채팅방을 표시합니다');
    }
  };

  // 채팅방 중요 표시 토글
  const handleToggleRoomImportant = async (roomId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const success = await toggleChatRoomImportant(roomId, newValue);

    if (success) {
      // 로컬 상태 업데이트
      const updateRooms = (rooms: ChatRoom[]) =>
        rooms.map((r) => (r.id === roomId ? { ...r, is_important: newValue } : r));

      setRooms(updateRooms);
      setAllRooms(updateRooms);

      if (selectedRoom?.id === roomId) {
        setSelectedRoom({ ...selectedRoom, is_important: newValue });
      }

      toast.success(newValue ? '중요 채팅방으로 표시되었습니다' : '중요 표시가 해제되었습니다');
    } else {
      toast.error('중요 표시 변경에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] border-t bg-white">
      {/* 좌측: 채팅방 목록 */}
      <div className="w-80 border-r flex flex-col">
        {/* 헤더 */}
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">채팅방 목록</h3>
            <div className="flex items-center gap-1">
              {/* 중요 필터 버튼 */}
              <button
                onClick={handleToggleImportantFilter}
                className={`p-1 rounded transition-colors ${
                  showOnlyImportant
                    ? 'bg-yellow-500 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title={showOnlyImportant ? '전체 보기' : '중요 채팅방만 보기'}
              >
                <Star className="w-4 h-4" fill={showOnlyImportant ? 'white' : 'none'} />
              </button>
              {/* 검색 버튼 */}
              <button
                onClick={handleToggleRoomSearch}
                className={`p-1 rounded transition-colors ${
                  showRoomSearch
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title={showRoomSearch ? '검색 닫기' : '채팅방 검색'}
              >
                {showRoomSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
              {/* 새로고침 버튼 */}
              <button
                onClick={loadRooms}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 검색 입력창 */}
          {showRoomSearch && (
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={roomSearchQuery}
                onChange={(e) => handleRoomSearch(e.target.value)}
                placeholder="메시지 내용으로 검색..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
                autoFocus
              />
              {isRoomSearching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              {roomSearchQuery && (
                <span className="text-xs text-gray-500">{rooms.length}개</span>
              )}
            </div>
          )}
        </div>

        {/* 목록 */}
        <ChatRoomList
          rooms={rooms}
          selectedRoomId={selectedRoom?.id || null}
          onSelectRoom={handleSelectRoom}
          onToggleImportant={handleToggleRoomImportant}
        />
      </div>

      {/* 우측: 대화 영역 */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* 헤더 */}
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">
                    {selectedRoom.user_name || '방문자'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {selectedRoom.room_type === 'complaint' ? '민원 접수' : '일반 문의'}
                  </p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {/* 검색 버튼 */}
                  <button
                    onClick={handleToggleSearch}
                    className={`p-2 rounded transition-colors ${
                      showSearch
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title={showSearch ? '검색 닫기' : '메시지 검색'}
                  >
                    {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCloseRoom}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    종료
                  </button>
                </div>
              </div>

              {/* 검색 입력창 */}
              {showSearch && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="메시지 검색..."
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    autoFocus
                  />
                  {isSearching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                  {searchQuery && (
                    <span className="text-xs text-gray-500">
                      {messages.length}개 결과
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 메시지 목록 */}
            <ChatMessageList messages={messages} deviceId="admin" />

            {/* 메시지 입력 */}
            <MessageInput
              onSend={handleSendMessage}
              placeholder="답변을 입력하세요..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Check className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">좌측에서 채팅방을 선택해주세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
