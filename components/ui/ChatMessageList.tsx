'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';

interface ChatMessageListProps {
  messages: Message[];
  deviceId: string;
}

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤 to 최신 메시지
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        <div className="text-center">
          <p>아직 메시지가 없습니다</p>
          <p className="mt-1">운영자에게 문의해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => {
        const isUser = message.sender_type === 'user';
        const isMyMessage = isUser; // 현재 기기가 보낸 메시지

        return (
          <div
            key={message.id}
            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                isMyMessage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {/* 발신자 표시 */}
              {!isMyMessage && (
                <div className="text-xs text-gray-600 mb-1 font-semibold">
                  운영자
                </div>
              )}

              {/* 메시지 내용 */}
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>

              {/* 시간 표시 */}
              <div
                className={`text-xs mt-1 ${
                  isMyMessage ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* 자동 스크롤 참조점 */}
      <div ref={messagesEndRef} />
    </div>
  );
}
