'use client';

import { useEffect, useRef, useState } from 'react';
import { getBooths } from '@/lib/booth-storage';
import { Booth } from '@/lib/types';
import { boothCategoryConfig } from '@/lib/booth-config';
import type { KakaoMap as KakaoMapType, KakaoOverlay, KakaoPolygon } from '@/types/kakao';

export default function KakaoMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<KakaoMapType | null>(null);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const overlaysRef = useRef<KakaoOverlay[]>([]);
  const polygonsRef = useRef<KakaoPolygon[]>([]);

  // 부스 데이터 로드
  useEffect(() => {
    const loadBooths = () => {
      const loadedBooths = getBooths();
      setBooths(loadedBooths);
    };

    loadBooths();
    // 3초마다 부스 데이터 리로드 (실시간 업데이트)
    const interval = setInterval(loadBooths, 3000);
    
    return () => clearInterval(interval);
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

        // 안산 문화광장 중심 (축제 장소)
        const festivalCenter = { lat: 37.3219, lng: 126.8308 };

        const options = {
          center: new window.kakao.maps.LatLng(festivalCenter.lat, festivalCenter.lng),
          level: 3, // 축제장을 자세히 볼 수 있는 레벨
          draggable: true,
          scrollwheel: true,
          zoomable: true
        };

        const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options);
        setMap(kakaoMap);
      });
    };

    return () => {
      const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);
  // 지도에 부스 표시
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 기존 폴리곤과 오버레이 제거
    polygonsRef.current.forEach(p => p.setMap(null));
    overlaysRef.current.forEach(o => o.setMap(null));
    polygonsRef.current = [];
    overlaysRef.current = [];

    // 부스별로 폴리곤과 오버레이 생성
    booths.forEach(booth => {
      if (!booth.isActive) return;

      const config = boothCategoryConfig[booth.category];
      
      // 폴리곤 경로 생성
      const polygonPath = booth.coordinates.map(coord => 
        new window.kakao.maps.LatLng(coord.lat, coord.lng)
      );

      // 폴리곤 생성
      const polygon = new window.kakao.maps.Polygon({
        path: polygonPath,
        strokeWeight: 3,
        strokeColor: config.strokeColor,
        strokeOpacity: 0.8,
        fillColor: config.fillColor,
        fillOpacity: config.fillOpacity
      });

      polygon.setMap(map);
      polygonsRef.current.push(polygon);
      // 폴리곤 클릭 이벤트
      window.kakao.maps.event.addListener(polygon, 'click', () => {
        setSelectedBooth(booth);
      });

      // 폴리곤 호버 효과
      window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
        polygon.setOptions({
          fillOpacity: config.fillOpacity + 0.2,
          strokeWeight: 4
        });
      });

      window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
        polygon.setOptions({
          fillOpacity: config.fillOpacity,
          strokeWeight: 3
        });
      });

      // 부스 이름 오버레이
      const center = getCenterOfPolygon(booth.coordinates);
      const overlayContent = `
        <div style="
          background: white;
          border: 2px solid ${config.strokeColor};
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <span>${config.icon} ${booth.name}</span>
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(center.lat, center.lng),
        content: overlayContent,
        yAnchor: 0.5,
        xAnchor: 0.5
      });

      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });
  }, [map, booths]);
  // 폴리곤 중심점 계산
  const getCenterOfPolygon = (coordinates: {lat: number, lng: number}[]) => {
    const latSum = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    return {
      lat: latSum / coordinates.length,
      lng: lngSum / coordinates.length
    };
  };

  return (
    <>
      <div 
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />
      
      {/* 선택된 부스 정보 팝업 */}
      {selectedBooth && (
        <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-xl shadow-lg p-4 z-10 max-w-[380px] mx-auto">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>{boothCategoryConfig[selectedBooth.category].icon}</span>
              {selectedBooth.name}
            </h3>
            <button 
              onClick={() => setSelectedBooth(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">
              {boothCategoryConfig[selectedBooth.category].name}
            </p>
            <p>{selectedBooth.description}</p>
            <p>🕐 {selectedBooth.operatingHours}</p>
            {selectedBooth.contact && <p>📞 {selectedBooth.contact}</p>}
            {selectedBooth.price && <p>💰 {selectedBooth.price}</p>}
            {selectedBooth.menuItems && selectedBooth.menuItems.length > 0 && (
              <div>
                <p className="font-medium mt-2">메뉴:</p>
                <ul className="list-disc list-inside">
                  {selectedBooth.menuItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}