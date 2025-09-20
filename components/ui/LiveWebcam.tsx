'use client';

import { useState } from 'react';
import { X, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveWebcamProps {
  boothName: string;
  webcamUrl?: string;
  onClose: () => void;
}

export default function LiveWebcam({ boothName, webcamUrl, onClose }: LiveWebcamProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실제 구현에서는 실시간 스트리밍 서비스(HLS, WebRTC 등)를 사용
  // 여기서는 데모를 위해 YouTube Live 임베드 예시를 사용
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    
    // YouTube Live URL을 임베드 URL로 변환
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`;
    }
    
    // 다른 스트리밍 서비스 URL 처리 가능
    return url;
  };

  const embedUrl = getEmbedUrl(webcamUrl);

  if (!embedUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-white rounded-lg p-6 max-w-sm">
          <p className="text-center text-gray-600 mb-4">
            현재 이 부스의 라이브 영상이 준비되지 않았습니다.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed z-50 ${
          isFullscreen ? 'inset-0' : 'bottom-20 left-4 right-4 max-w-sm mx-auto'
        }`}
      >
        <div className={`bg-black rounded-lg overflow-hidden shadow-2xl ${
          isFullscreen ? 'h-full' : 'aspect-video'
        }`}>
          {/* 헤더 */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-white text-sm font-medium">LIVE</span>
                <span className="text-white/80 text-sm">{boothName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* 비디오 플레이어 */}
          <div className="relative w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-sm">영상 로딩중...</div>
              </div>
            )}
            
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('영상을 불러올 수 없습니다.');
                setIsLoading(false);
              }}
            />

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-sm">{error}</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}