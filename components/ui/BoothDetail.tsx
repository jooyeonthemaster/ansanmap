'use client';

import { useState } from 'react';
import { X, Clock, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booth } from '@/lib/types';
import LiveWebcam from './LiveWebcam';

interface BoothDetailProps {
  booth: Booth;
  onClose: () => void;
  onNavigate: () => void;
}

export default function BoothDetail({ booth, onClose }: BoothDetailProps) {
  const [showWebcam, setShowWebcam] = useState(false);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 max-w-[420px] mx-auto max-h-[75vh] overflow-hidden"
        >
          {/* 컴팩트 헤더 */}
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-5 pt-5 pb-4">
            {/* 드래그 인디케이터 */}
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-lg font-bold text-indigo-600">
                  {booth.name.split(' - ')[0] || booth.name.substring(0, 3)}
                </span>
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-lg font-bold text-white leading-tight">{booth.name}</h2>
              </div>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: 'calc(75vh - 7rem)' }}>

            {/* 소개 */}
            {booth.description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{booth.description}</p>
              </div>
            )}

            {/* 운영 정보 */}
            <div className="space-y-2">
              {booth.operatingHours && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>{booth.operatingHours}</span>
                </div>
              )}

              {booth.contact && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <span>{booth.contact}</span>
                </div>
              )}
            </div>

            {/* 메뉴 아이템 */}
            {booth.menuItems && booth.menuItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">메뉴</h3>
                <div className="space-y-1.5">
                  {booth.menuItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-3 py-2.5">
                      <span className="text-sm text-gray-700">{item}</span>
                      {booth.price && idx === 0 && (
                        <span className="text-sm font-semibold text-indigo-600">{booth.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 태그 */}
            {booth.tags && booth.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {booth.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 text-xs font-medium rounded-full border border-indigo-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 웹캠 뷰어 */}
      {showWebcam && (
        <LiveWebcam
          boothName={booth.name}
          webcamUrl={booth.webcamUrl}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </>
  );
}