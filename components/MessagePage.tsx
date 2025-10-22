'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, AlertCircle, Loader2, User, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ChatRoom, Message, RoomType } from '@/lib/types';
import { getOrCreateChatRoom, changeChatRoomType } from '@/lib/supabase/chat-api';
import { getMessages, sendMessage, subscribeToMessages, markRoomMessagesAsRead, searchMessages } from '@/lib/supabase/message-api';
import { getOrCreateDeviceId, getUserNickname, setUserNickname } from '@/lib/utils/device-id';
import ChatMessageList from './ui/ChatMessageList';
import MessageInput from './ui/MessageInput';

export default function MessagePage() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempName, setTempName] = useState('');

  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]); // 전체 메시지 (검색용)
  const [loading, setLoading] = useState(true);
  const [roomType, setRoomType] = useState<RoomType>('general');

  // 검색 관련 상태
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // localStorage 캐시 키
  const CACHE_KEY_MESSAGES = 'asv_messages_cache';
  const CACHE_KEY_ROOM = 'asv_current_room_cache';

  // 초기화: Device ID 및 채팅방 로드
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // 먼저 캐시된 데이터 즉시 복원 (빠른 UI 표시)
    restoreFromCache();

    // 그 다음 서버에서 최신 데이터 로드
    const init = async () => {
      try {
        // Device ID 생성/로드
        const id = getOrCreateDeviceId();
        setDeviceId(id);

        // 사용자 닉네임 로드
        const nickname = getUserNickname();
        setUserName(nickname);

        // 채팅방 생성/로드 및 구독
        unsubscribe = await loadChatRoom(id, nickname, 'general');
      } catch (error) {
        console.error('[MessagePage] 초기화 실패:', error);
        toast.error('채팅방 로드에 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    init();

    // 컴포넌트 언마운트 시 Realtime 구독 해제
    return () => {
      if (unsubscribe) {
        console.log('[MessagePage] 컴포넌트 언마운트 - Realtime 구독 해제');
        unsubscribe();
      }
    };
  }, []);

  // 캐시에서 복원 (즉시 UI 표시)
  const restoreFromCache = () => {
    try {
      if (typeof window === 'undefined') return;

      // 캐시된 메시지 복원
      const cachedMessages = localStorage.getItem(CACHE_KEY_MESSAGES);
      if (cachedMessages) {
        const parsedMessages = JSON.parse(cachedMessages);
        setMessages(parsedMessages);
        setAllMessages(parsedMessages);
        console.log('[MessagePage] 캐시에서 메시지 복원:', parsedMessages.length);
      }

      // 캐시된 채팅방 정보 복원
      const cachedRoom = localStorage.getItem(CACHE_KEY_ROOM);
      if (cachedRoom) {
        const parsedRoom = JSON.parse(cachedRoom);
        setCurrentRoom(parsedRoom);
        setRoomType(parsedRoom.room_type);
        console.log('[MessagePage] 캐시에서 채팅방 복원:', parsedRoom.id);
      }
    } catch (error) {
      console.error('[MessagePage] 캐시 복원 실패:', error);
    }
  };


  // 채팅방 로드
  const loadChatRoom = async (
    deviceId: string,
    userName: string,
    roomType: RoomType
  ) => {
    // 채팅방 가져오기
    const room = await getOrCreateChatRoom(deviceId, userName, roomType);
    if (!room) {
      toast.error('채팅방을 불러오지 못했습니다');
      return;
    }

    setCurrentRoom(room);
    setRoomType(room.room_type);

    // 채팅방 정보 캐싱
    try {
      localStorage.setItem(CACHE_KEY_ROOM, JSON.stringify(room));
    } catch (error) {
      console.error('[MessagePage] 채팅방 캐시 저장 실패:', error);
    }

    // 메시지 로드
    const msgs = await getMessages(room.id);
    setMessages(msgs);
    setAllMessages(msgs); // 전체 메시지 저장 (검색용)

    // 메시지 캐싱
    try {
      localStorage.setItem(CACHE_KEY_MESSAGES, JSON.stringify(msgs));
      console.log('[MessagePage] 메시지 캐시 저장:', msgs.length);
    } catch (error) {
      console.error('[MessagePage] 메시지 캐시 저장 실패:', error);
    }

    // 미읽음 메시지 읽음 처리 (관리자 메시지)
    await markRoomMessagesAsRead(room.id, 'admin');

    // 실시간 구독
    const unsubscribe = subscribeToMessages(room.id, (newMessage) => {
      setMessages((prev) => {
        // 중복 메시지 방지: 이미 같은 ID의 메시지가 있으면 추가하지 않음
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        const updatedMessages = [...prev, newMessage];

        // 새 메시지 캐싱
        try {
          localStorage.setItem(CACHE_KEY_MESSAGES, JSON.stringify(updatedMessages));
        } catch (error) {
          console.error('[MessagePage] 메시지 캐시 업데이트 실패:', error);
        }

        return updatedMessages;
      });

      // 전체 메시지에도 추가
      setAllMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // 관리자 메시지면 읽음 처리
      if (newMessage.sender_type === 'admin') {
        markRoomMessagesAsRead(room.id, 'admin');
      }

      // 알림 표시
      if (newMessage.sender_type === 'admin') {
        toast.success('운영자로부터 새 메시지가 도착했습니다');
      }
    });

    return unsubscribe;
  };

  // 메시지 전송
  const handleSendMessage = async (content: string) => {
    if (!currentRoom) {
      toast.error('채팅방이 준비되지 않았습니다');
      return;
    }

    const message = await sendMessage({
      room_id: currentRoom.id,
      sender_type: 'user',
      content,
    });

    if (!message) {
      toast.error('메시지 전송에 실패했습니다');
      return;
    }

    // Realtime 구독으로 자동으로 추가되므로 로컬 추가 불필요
    // 중복 방지를 위해 주석 처리
  };

  // 채팅방 타입 변경 (일반 ↔ 민원)
  const handleChangeRoomType = async (newType: RoomType) => {
    if (!currentRoom) return;
    if (newType === roomType) return;

    const success = await changeChatRoomType(currentRoom.id, newType);
    if (success) {
      setRoomType(newType);
      toast.success(
        newType === 'complaint'
          ? '민원 접수로 전환되었습니다'
          : '일반 문의로 전환되었습니다'
      );

      // 채팅방 재로드
      const room = await getOrCreateChatRoom(deviceId, userName, newType);
      if (room) {
        setCurrentRoom(room);
        const msgs = await getMessages(room.id);
        setMessages(msgs);
      }
    } else {
      toast.error('채팅방 타입 변경에 실패했습니다');
    }
  };

  // 닉네임 변경
  const handleChangeName = () => {
    setShowNameInput(true);
    setTempName(userName);
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (!trimmed) {
      toast.error('닉네임을 입력해주세요');
      return;
    }

    setUserNickname(trimmed);
    setUserName(trimmed);
    setShowNameInput(false);
    toast.success(`닉네임이 "${trimmed}"으로 변경되었습니다`);
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

  // 검색 실행
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!currentRoom) return;

    if (!query.trim()) {
      // 검색어가 없으면 전체 메시지 표시
      setMessages(allMessages);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = await searchMessages(currentRoom.id, query);
    setMessages(results);
    setIsSearching(false);

    if (results.length === 0) {
      toast.error('검색 결과가 없습니다');
    } else {
      toast.success(`${results.length}개의 메시지를 찾았습니다`);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100svh-3rem-3.5rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">채팅방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100svh-3rem-3.5rem)] flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            운영자에게 문의하기
          </h1>

          <div className="flex items-center gap-2">
            {/* 검색 버튼 */}
            <button
              onClick={handleToggleSearch}
              className={`p-2 rounded transition-colors ${
                showSearch
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={showSearch ? '검색 닫기' : '메시지 검색'}
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* 닉네임 표시/변경 */}
            <button
              onClick={handleChangeName}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border px-2 py-1 rounded"
            >
              <User className="w-3 h-3" />
              {userName}
            </button>
          </div>
        </div>

        {/* 검색 입력창 */}
        {showSearch && (
          <div className="mb-2 flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
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

        {/* 채팅방 타입 선택 */}
        <div className="flex gap-2">
          <button
            onClick={() => handleChangeRoomType('general')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              roomType === 'general'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" />
            일반 문의
          </button>
          <button
            onClick={() => handleChangeRoomType('complaint')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              roomType === 'complaint'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-1" />
            민원 접수
          </button>
        </div>

        {/* 민원 안내 */}
        {roomType === 'complaint' && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
            ⚠️ 민원 접수는 우선 처리됩니다
          </div>
        )}
      </div>

      {/* 닉네임 변경 모달 */}
      {showNameInput && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-sm">
            <h3 className="font-semibold mb-3">닉네임 변경</h3>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              maxLength={20}
              placeholder="닉네임 입력 (최대 20자)"
              className="w-full px-3 py-2 border rounded-lg mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNameInput(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleSaveName}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <ChatMessageList messages={messages} deviceId={deviceId} />

      {/* 메시지 입력 */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={!currentRoom}
        placeholder={
          roomType === 'complaint'
            ? '민원 내용을 자세히 입력해주세요...'
            : '메시지를 입력하세요...'
        }
      />
    </div>
  );
}
