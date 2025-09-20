'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Navigation, Clock, Users, Camera, Star, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booth } from '@/lib/types';
import { boothCategoryConfig } from '@/lib/booth-config';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/utils/storage';
import LiveWebcam from './LiveWebcam';
import toast from 'react-hot-toast';

interface BoothDetailProps {
  booth: Booth;
  onClose: () => void;
  onNavigate: () => void;
}

export default function BoothDetail({ booth, onClose, onNavigate }: BoothDetailProps) {
  const [isFav, setIsFav] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(booth.id));
  }, [booth.id]);

  const handleFavoriteToggle = () => {
    if (isFav) {
      removeFavorite(booth.id);
      toast.success('즐겨찾기에서 제거했습니다');
    } else {
      addFavorite(booth.id, true);
      toast.success('즐겨찾기에 추가했습니다');
    }
    setIsFav(!isFav);
  };

  const getCongestionColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very-high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCongestionText = (level?: string) => {
    switch (level) {
      case 'low': return '여유';
      case 'medium': return '보통';
      case 'high': return '혼잡';
      case 'very-high': return '매우 혼잡';
      default: return '정보 없음';
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-30 max-w-[380px] mx-auto max-h-[70vh] overflow-hidden"
        >
          {/* 헤더 이미지 영역 */}
          <div className="relative h-40 bg-gradient-to-br from-blue-400 to-purple-500">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl shadow-lg">
                  {boothCategoryConfig[booth.category].icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{booth.name}</h2>
                  <p className="text-white/80 text-sm">{boothCategoryConfig[booth.category].name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 10rem)' }}>
            {/* 상태 정보 */}
            <div className="p-4 grid grid-cols-3 gap-3 border-b">
              <div className="text-center">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCongestionColor(booth.congestionLevel)}`}>
                  <Users className="w-3 h-3" />
                  {getCongestionText(booth.congestionLevel)}
                </div>
              </div>
              <div className="text-center">
                {booth.waitingTime !== undefined && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-800">
                    <Clock className="w-3 h-3" />
                    {booth.waitingTime > 0 ? `${booth.waitingTime}분 대기` : '대기 없음'}
                  </div>
                )}
              </div>
              <div className="text-center">
                {booth.popularityScore !== undefined && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full text-xs font-medium text-yellow-800">
                    <Star className="w-3 h-3 fill-current" />
                    {booth.popularityScore.toFixed(1)}
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="p-4 flex gap-3">
              <button
                onClick={handleFavoriteToggle}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                  isFav 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                {isFav ? '즐겨찾기 됨' : '즐겨찾기'}
              </button>
              
              <button
                onClick={onNavigate}
                className="flex-1 py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                길찾기
              </button>
              
              <button
                onClick={() => booth.webcamUrl ? setShowWebcam(true) : null}
                disabled={!booth.webcamUrl}
                className={`py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                  booth.webcamUrl 
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Camera className="w-4 h-4" />
                라이브
              </button>
            </div>

            {/* 기본 정보 */}
            <div className="px-4 pb-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">소개</h3>
                <p className="text-sm text-gray-600">{booth.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{booth.operatingHours}</span>
              </div>

              {booth.contact && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{booth.contact}</span>
                </div>
              )}

              {booth.currentVisitors !== undefined && booth.maxCapacity !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">현재 방문자</span>
                    <span className="font-medium">{booth.currentVisitors} / {booth.maxCapacity}명</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        booth.congestionLevel === 'very-high' ? 'bg-red-500' :
                        booth.congestionLevel === 'high' ? 'bg-orange-500' :
                        booth.congestionLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(booth.currentVisitors / booth.maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 메뉴 아이템 */}
              {booth.menuItems && booth.menuItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">메뉴</h3>
                  <div className="space-y-2">
                    {booth.menuItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm">{item}</span>
                        {booth.price && idx === 0 && (
                          <span className="text-sm font-medium text-blue-600">{booth.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 태그 */}
              {booth.tags && booth.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {booth.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
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