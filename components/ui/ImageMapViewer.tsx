'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageMapViewerProps {
  onClose: () => void;
}

export default function ImageMapViewer({ onClose }: ImageMapViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white z-10 flex flex-col"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">지도 이미지 보기</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 컨텐츠 - 준비 중 메시지 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">지도 이미지 준비 중</p>
          <p className="text-sm text-gray-500">곧 축제 지도 이미지를 제공할 예정입니다</p>
        </div>
      </div>
    </motion.div>
  );
}
