'use client';

import { useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { initializeSampleData } from '@/lib/sample-data';
import { Map, Heart, Info, Settings, RefreshCw } from 'lucide-react';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import NetworkStatus from '@/components/ui/NetworkStatus';

// 동적 임포트로 초기 로딩 최적화
const EnhancedKakaoMap = dynamic(() => import('@/components/EnhancedKakaoMap'), {
  loading: () => <SkeletonLoader />,
  ssr: false
});

const FavoritesPage = lazy(() => import('@/components/FavoritesPage'));
const InfoPage = lazy(() => import('@/components/InfoPage'));

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'map' | 'favorites' | 'info'>('map');

  const handleInitSampleData = () => {
    initializeSampleData();
    window.location.reload();
  };

  const handleBoothSelect = () => {
    setActiveTab('map');
  };

  return (
    <div className="relative w-full">
      <NetworkStatus />
      
      {/* 플로팅 액션 버튼 (개발용) */}
      {activeTab === 'map' && (
        <div className="fixed top-16 right-2 z-30 flex flex-col gap-2 max-w-[370px]">
          <button
            onClick={handleInitSampleData}
            className="p-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors group"
            title="샘플 데이터 초기화"
          >
            <RefreshCw className="w-4 h-4 group-hover:animate-spin" />
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="p-2 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
            title="관리자"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div className="h-[calc(100svh-3rem-3.5rem)]">
        {activeTab === 'map' && (
          <EnhancedKakaoMap />
        )}
        
        {activeTab === 'favorites' && (
          <Suspense fallback={<SkeletonLoader />}>
            <FavoritesPage onBoothSelect={handleBoothSelect} />
          </Suspense>
        )}
        
        {activeTab === 'info' && (
          <Suspense fallback={<SkeletonLoader />}>
            <InfoPage />
          </Suspense>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed left-1/2 bottom-0 z-40 w-[380px] -translate-x-1/2">
        <div className="h-14 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-black/5 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${
              activeTab === 'map' 
                ? 'text-blue-600 scale-110' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="text-xs font-medium">지도</span>
          </button>
          
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${
              activeTab === 'favorites' 
                ? 'text-blue-600 scale-110' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">즐겨찾기</span>
          </button>
          
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${
              activeTab === 'info' 
                ? 'text-blue-600 scale-110' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Info className="w-5 h-5" />
            <span className="text-xs font-medium">정보</span>
          </button>
        </div>
      </div>
    </div>
  );
}