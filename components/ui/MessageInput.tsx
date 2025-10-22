'use client';

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...'
}: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    if (trimmed.length > 1000) {
      alert('메시지는 최대 1000자까지 입력 가능합니다.');
      return;
    }

    onSend(trimmed);
    setContent('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-white border-t">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        maxLength={1000}
        className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        style={{
          minHeight: '40px',
          maxHeight: '120px',
          height: 'auto'
        }}
        onInput={(e) => {
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !content.trim()}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        title="전송"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
