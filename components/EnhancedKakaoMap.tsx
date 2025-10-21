'use client';

import { useEffect, useRef, useState } from 'react';
import { getBooths, subscribeToBooths } from '@/lib/supabase/booth-api';
import { Booth } from '@/lib/types';
import { boothCategoryConfig } from '@/lib/booth-config';
import SearchAndFilter from './ui/SearchAndFilter';
import BoothDetail from './ui/BoothDetail';
import QRCheckIn from './ui/QRCheckIn';
import AnnouncementBanner from './ui/AnnouncementBanner';
import { Navigation, QrCode, Layers, Image } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ImageMapViewer from './ui/ImageMapViewer';
import { AnimatePresence } from 'framer-motion';

import { KakaoMap, KakaoOverlay, KakaoPolygon } from '@/types/kakao';

export default function EnhancedKakaoMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<KakaoMap | null>(null);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [filteredBooths, setFilteredBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [showQRCheckIn, setShowQRCheckIn] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState(3); // 줌 레벨 상태 추가
  const [showImageMap, setShowImageMap] = useState(false); // 이미지 지도 표시 상태
  const overlaysRef = useRef<KakaoOverlay[]>([]);
  const polygonsRef = useRef<KakaoPolygon[]>([]);
  const userMarkerRef = useRef<KakaoOverlay | null>(null);

  // 부스 데이터 로드 및 실시간 업데이트
  useEffect(() => {
    const loadBooths = async () => {
      const loadedBooths = await getBooths();
      // 시뮬레이션: 랜덤 혼잡도 및 대기시간 추가 (DB에 없는 경우)
      const enhancedBooths = loadedBooths.map((booth, index) => ({
        ...booth,
        congestionLevel: booth.congestionLevel || (['low', 'medium', 'high', 'very-high'] as const)[Math.floor(Math.random() * 4)],
        waitingTime: booth.waitingTime ?? Math.floor(Math.random() * 30),
        currentVisitors: booth.currentVisitors ?? Math.floor(Math.random() * 50),
        maxCapacity: booth.maxCapacity || 50,
        popularityScore: booth.popularityScore ?? (Math.random() * 5),
        webcamUrl: booth.webcamUrl || (index % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined),
        tags: booth.tags || ['축제', '한양대', 'ERICA', '2025']
      }));
      setBooths(enhancedBooths);
      setFilteredBooths(enhancedBooths);
    };

    loadBooths();

    // Realtime 구독 (Supabase에서 부스 변경 시 자동 업데이트)
    const unsubscribe = subscribeToBooths((updatedBooths) => {
      const enhancedBooths = updatedBooths.map((booth, index) => ({
        ...booth,
        congestionLevel: booth.congestionLevel || (['low', 'medium', 'high', 'very-high'] as const)[Math.floor(Math.random() * 4)],
        waitingTime: booth.waitingTime ?? Math.floor(Math.random() * 30),
        currentVisitors: booth.currentVisitors ?? Math.floor(Math.random() * 50),
        maxCapacity: booth.maxCapacity || 50,
        popularityScore: booth.popularityScore ?? (Math.random() * 5),
        webcamUrl: booth.webcamUrl || (index % 2 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined),
        tags: booth.tags || ['축제', '한양대', 'ERICA', '2025']
      }));
      setBooths(enhancedBooths);
      setFilteredBooths(enhancedBooths);
      toast.success('부스 정보가 업데이트되었습니다!');
    });

    return () => unsubscribe();
  }, []);

  // 카카오맵 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    document.head.appendChild(script);
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;

        // 한양대 ERICA 캠퍼스 중심
        const festivalCenter = { lat: 37.2978, lng: 126.8378 };
        
        const options = {
          center: new window.kakao.maps.LatLng(festivalCenter.lat, festivalCenter.lng),
          level: 3,
          draggable: true,
          scrollwheel: true,
          zoomable: true
        };

        const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options);
        setMap(kakaoMap);

        // 지도 타입 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        kakaoMap.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        kakaoMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
        
        // 줌 레벨 변경 이벤트 리스너 등록
        window.kakao.maps.event.addListener(kakaoMap, 'zoom_changed', () => {
          const level = kakaoMap.getLevel();
          setZoomLevel(level);
        });
      });
    };

    return () => {
      const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // 사용자 위치 추적
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        
        if (map && window.kakao) {
          // 기존 마커 제거
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }
          
          // 새 마커 생성
          const markerPosition = new window.kakao.maps.LatLng(location.lat, location.lng);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            map: map,
            image: new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzQyODVGNCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0iIzQyODVGNCIvPgo8L3N2Zz4=',
              new window.kakao.maps.Size(24, 24),
              { offset: new window.kakao.maps.Point(12, 12) }
            )
          });
          
          userMarkerRef.current = marker;
        }
      },
      (error) => {
        console.error('위치 추적 실패:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [map]);

  // 지도에 부스 표시
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 기존 폴리곤과 오버레이 제거
    polygonsRef.current.forEach(p => p.setMap(null));
    overlaysRef.current.forEach(o => o.setMap(null));
    polygonsRef.current = [];
    overlaysRef.current = [];

    // 현재 줌 레벨 가져오기
    const currentZoomLevel = map.getLevel();
    
    // 줌 레벨에 따른 오버레이 크기 및 표시 여부 결정
    const getOverlaySettings = (zoomLevel: number) => {
      if (zoomLevel <= 2) return { scale: 1, fontSize: 11, iconSize: 16, paddingY: 6, paddingX: 10, show: true };
      if (zoomLevel === 3) return { scale: 0.9, fontSize: 10, iconSize: 14, paddingY: 5, paddingX: 8, show: true };
      if (zoomLevel === 4) return { scale: 0.75, fontSize: 9, iconSize: 12, paddingY: 4, paddingX: 7, show: true };
      if (zoomLevel === 5) return { scale: 0.6, fontSize: 8, iconSize: 10, paddingY: 3, paddingX: 6, show: true };
      if (zoomLevel >= 6) return { scale: 0.5, fontSize: 7, iconSize: 8, paddingY: 2, paddingX: 5, show: false }; // 너무 줄어들면 숨김
    };

    const overlaySettings = getOverlaySettings(currentZoomLevel);

    // 필터된 부스만 표시
    filteredBooths.forEach(booth => {
      if (!booth.isActive) return;

      const config = boothCategoryConfig[booth.category] || boothCategoryConfig.info;

      // 혼잡도에 따른 색상 조정
      const fillOpacity = booth.congestionLevel === 'very-high' ? 0.7 :
                          booth.congestionLevel === 'high' ? 0.5 :
                          booth.congestionLevel === 'medium' ? 0.4 : 0.3;

      const strokeColor = booth.congestionLevel === 'very-high' ? '#EF4444' :
                         booth.congestionLevel === 'high' ? '#F97316' :
                         booth.congestionLevel === 'medium' ? '#EAB308' :
                         config.strokeColor;

      const polygonPath = booth.coordinates.map(coord => 
        new window.kakao.maps.LatLng(coord.lat, coord.lng)
      );

      const polygon = new window.kakao.maps.Polygon({
        path: polygonPath,
        strokeWeight: 3,
        strokeColor: strokeColor,
        strokeOpacity: 0.8,
        fillColor: config.fillColor,
        fillOpacity: fillOpacity
      });

      polygon.setMap(map);
      polygonsRef.current.push(polygon);

      // 폴리곤 클릭 이벤트
      window.kakao.maps.event.addListener(polygon, 'click', () => {
        setSelectedBooth(booth);
      });

      // 호버 효과
      window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
        polygon.setOptions({
          fillOpacity: fillOpacity + 0.2,
          strokeWeight: 4
        });
      });

      window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
        polygon.setOptions({
          fillOpacity: fillOpacity,
          strokeWeight: 3
        });
      });

      // 줄어들면 오버레이 숨기기
      if (!overlaySettings?.show) return;

      // 부스 오버레이 (줌 레벨에 따라 크기 조절)
      const center = getCenterOfPolygon(booth.coordinates);
      const overlayContent = document.createElement('div');
      overlayContent.innerHTML = `
        <div style="
          background: ${booth.congestionLevel === 'very-high' ? '#DC2626' :
                        booth.congestionLevel === 'high' ? '#EA580C' :
                        booth.congestionLevel === 'medium' ? '#CA8A04' :
                        'white'};
          color: ${booth.congestionLevel ? 'white' : 'black'};
          border: 1.5px solid ${strokeColor};
          border-radius: ${6 * overlaySettings.scale}px;
          padding: ${overlaySettings.paddingY}px ${overlaySettings.paddingX}px;
          font-size: ${overlaySettings.fontSize}px;
          font-weight: bold;
          box-shadow: 0 ${2 * overlaySettings.scale}px ${6 * overlaySettings.scale}px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${2 * overlaySettings.scale}px;
          backdrop-filter: blur(4px);
          background: ${booth.congestionLevel ?
            `linear-gradient(135deg, ${strokeColor}DD, ${strokeColor}AA)` :
            'rgba(255,255,255,0.92)'};
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          transform: scale(${overlaySettings.scale});
          min-width: ${overlaySettings.fontSize * 1.8}px;
        "
        onmouseover="this.style.transform='scale(${overlaySettings.scale * 1.1})'; this.style.boxShadow='0 ${6 * overlaySettings.scale}px ${20 * overlaySettings.scale}px rgba(0,0,0,0.25)';"
        onmouseout="this.style.transform='scale(${overlaySettings.scale})'; this.style.boxShadow='0 ${4 * overlaySettings.scale}px ${12 * overlaySettings.scale}px rgba(0,0,0,0.15)';">
          <span style="font-size: ${overlaySettings.fontSize * 0.85}px; font-weight: 700;">${booth.name.split(' - ')[0] || booth.name.substring(0, 3)}</span>
        </div>
      `;

      // 오버레이 클릭 이벤트 추가
      overlayContent.addEventListener('click', () => {
        setSelectedBooth(booth);
      });

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(center.lat, center.lng),
        content: overlayContent,
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: booth.congestionLevel === 'very-high' ? 10 : 5,
        clickable: true
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });
  }, [map, filteredBooths, zoomLevel]); // zoomLevel dependency 추가

  // 유틸리티 함수들
  const getCenterOfPolygon = (coordinates: {lat: number, lng: number}[]) => {
    const latSum = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    return {
      lat: latSum / coordinates.length,
      lng: lngSum / coordinates.length
    };
  };

  const handleNavigate = () => {
    if (!selectedBooth || !userLocation) {
      toast.error('위치 정보를 가져올 수 없습니다');
      return;
    }

    // 실제로는 카카오맵 길찾기 API 사용
    const center = getCenterOfPolygon(selectedBooth.coordinates);
    const url = `https://map.kakao.com/link/to/${selectedBooth.name},${center.lat},${center.lng}`;
    window.open(url, '_blank');
  };

  const handleBoothSelect = (booth: Booth) => {
    setSelectedBooth(booth);
    
    // 지도 중심 이동
    if (map && window.kakao) {
      const center = getCenterOfPolygon(booth.coordinates);
      const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
      map.setCenter(moveLatLon);
      map.setLevel(2);
    }
  };

  const toggleMapType = () => {
    if (!map || !window.kakao) return;
    
    if (mapType === 'roadmap') {
      map.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
      setMapType('satellite');
    } else {
      map.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
      setMapType('roadmap');
    }
  };

  const centerToUserLocation = () => {
    if (!map || !window.kakao || !userLocation) {
      toast.error('현재 위치를 가져올 수 없습니다');
      return;
    }
    
    const moveLatLon = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
    map.setCenter(moveLatLon);
    map.setLevel(3);
    toast.success('현재 위치로 이동했습니다');
  };

  return (
    <>
      <Toaster position="top-center" />
      <AnnouncementBanner />
      
      {/* 검색 및 필터 */}
      <SearchAndFilter 
        booths={booths}
        onFilter={setFilteredBooths}
        onBoothSelect={handleBoothSelect}
      />
      
      {/* 지도 컨테이너 */}
      <div className="relative h-[calc(100vh-3rem-3.5rem-3rem)]">
        <div 
          ref={mapContainer}
          className="w-full h-full"
        />
        
        {/* 플로팅 액션 버튼들 */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={centerToUserLocation}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="내 위치"
          >
            <Navigation className="w-5 h-5 text-blue-500" />
          </button>

          <button
            onClick={toggleMapType}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="지도 타입 변경"
          >
            <Layers className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={() => setShowImageMap(true)}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="지도 이미지로 보기"
            aria-label="지도 이미지로 보기"
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="w-5 h-5 text-purple-500" aria-hidden="true" />
          </button>

          <button
            onClick={() => setShowQRCheckIn(true)}
            className="p-3 bg-blue-500 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="QR 체크인"
          >
            <QrCode className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 범례 */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3">
          <p className="text-xs font-semibold mb-2">혼잡도</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">여유</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs">보통</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-xs">혼잡</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">매우 혼잡</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 부스 상세 정보 */}
      {selectedBooth && (
        <BoothDetail 
          booth={selectedBooth}
          onClose={() => setSelectedBooth(null)}
          onNavigate={handleNavigate}
        />
      )}
      
      {/* QR 체크인 */}
      {showQRCheckIn && (
        <QRCheckIn
          boothId={selectedBooth?.id || 'default'}
          boothName={selectedBooth?.name || '축제 부스'}
          onClose={() => setShowQRCheckIn(false)}
        />
      )}

      {/* 지도 이미지 뷰어 */}
      <AnimatePresence>
        {showImageMap && (
          <ImageMapViewer onClose={() => setShowImageMap(false)} />
        )}
      </AnimatePresence>
    </>
  );
}