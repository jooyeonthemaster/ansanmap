'use client';

import { useEffect, useRef, useState } from 'react';
import { Booth } from '@/lib/types';
import { boothCategoryConfig } from '@/lib/booth-config';

interface AdminMapProps {
  onCoordinateSelect: (coords: {lat: number, lng: number}[]) => void;
  selectedCoordinates: {lat: number, lng: number}[];
  booths: Booth[];
  isAddingMode: boolean;
}

export default function AdminMap({ 
  onCoordinateSelect, 
  selectedCoordinates, 
  booths,
  isAddingMode 
}: AdminMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const polygonsRef = useRef<unknown[]>([]);
  const drawingPolygonRef = useRef<unknown>(null);
  const drawingLineRef = useRef<unknown>(null);
  const clickListenerRef = useRef<unknown>(null);

  // 카카오맵 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;

        // 안산 문화광장 중심
        const festivalCenter = { lat: 37.3219, lng: 126.8308 };

        const options = {
          center: new window.kakao.maps.LatLng(festivalCenter.lat, festivalCenter.lng),
          level: 3,
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
  // selectedCoordinates를 ref로도 저장 (최신 값 유지)
  const coordsRef = useRef(selectedCoordinates);
  useEffect(() => {
    coordsRef.current = selectedCoordinates;
  }, [selectedCoordinates]);

  // 지도 클릭 이벤트 처리
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 기존 리스너 제거
    if (clickListenerRef.current) {
      window.kakao.maps.event.removeListener(clickListenerRef.current);
    }

    if (isAddingMode) {
      const clickHandler = (mouseEvent: unknown) => {
        const latlng = (mouseEvent as { latLng: { getLat: () => number; getLng: () => number } }).latLng;
        const newCoord = {
          lat: latlng.getLat(),
          lng: latlng.getLng()
        };

        // ref를 통해 최신 좌표 가져와서 새 배열 생성
        const updatedCoords = [...coordsRef.current, newCoord];
        onCoordinateSelect(updatedCoords);
      };

      // 새 리스너 추가
      clickListenerRef.current = window.kakao.maps.event.addListener(map, 'click', clickHandler);
    }

    // 클린업
    return () => {
      if (clickListenerRef.current) {
        window.kakao.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [map, isAddingMode, onCoordinateSelect]);
  // 선택된 좌표들 표시 (마커와 연결선)
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 기존 마커와 도형 제거
    markersRef.current.forEach(m => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (m && (m as any).setMap) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m as any).setMap(null);
      }
    });
    markersRef.current = [];
    
    if (drawingPolygonRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (drawingPolygonRef.current as any).setMap(null);
      drawingPolygonRef.current = null;
    }
    if (drawingLineRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (drawingLineRef.current as any).setMap(null);
      drawingLineRef.current = null;
    }

    // 새 마커 추가
    selectedCoordinates.forEach((coord, index) => {
      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(coord.lat, coord.lng),
        map: map
      });

      // 마커 클릭 시 해당 점 제거
      window.kakao.maps.event.addListener(marker, 'click', () => {
        const updatedCoords = selectedCoordinates.filter((_, i) => i !== index);
        onCoordinateSelect(updatedCoords);
      });

      markersRef.current.push(marker);
    });

    // 연결선 그리기 (2개 이상의 점)
    if (selectedCoordinates.length >= 2) {
      const linePath = selectedCoordinates.map(coord =>
        new window.kakao.maps.LatLng(coord.lat, coord.lng)
      );
      
      drawingLineRef.current = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 3,
        strokeColor: '#FF00FF',
        strokeOpacity: 0.8,
        strokeStyle: 'dashed'
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (drawingLineRef.current as any).setMap(map);
    }

    // 폴리곤 그리기 (3개 이상의 점)
    if (selectedCoordinates.length >= 3) {
      const polygonPath = selectedCoordinates.map(coord =>
        new window.kakao.maps.LatLng(coord.lat, coord.lng)
      );

      drawingPolygonRef.current = new window.kakao.maps.Polygon({
        path: polygonPath,
        strokeWeight: 3,
        strokeColor: '#FF00FF',
        strokeOpacity: 0.8,
        fillColor: '#FF00FF',
        fillOpacity: 0.2
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (drawingPolygonRef.current as any).setMap(map);
    }
  }, [map, selectedCoordinates, onCoordinateSelect]);
  // 기존 부스들 표시
  useEffect(() => {
    if (!map || !window.kakao) return;

    // 기존 폴리곤 제거
    polygonsRef.current.forEach(p => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (p && (p as any).setMap) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p as any).setMap(null);
      }
    });
    polygonsRef.current = [];

    // 부스별로 폴리곤 생성
    booths.forEach(booth => {
      const config = boothCategoryConfig[booth.category];
      
      const polygonPath = booth.coordinates.map(coord =>
        new window.kakao.maps.LatLng(coord.lat, coord.lng)
      );

      const polygon = new window.kakao.maps.Polygon({
        path: polygonPath,
        strokeWeight: 2,
        strokeColor: config.strokeColor,
        strokeOpacity: booth.isActive ? 0.8 : 0.3,
        fillColor: config.fillColor,
        fillOpacity: booth.isActive ? config.fillOpacity : 0.2
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (polygon as any).setMap(map);
      polygonsRef.current.push(polygon);
    });
  }, [map, booths]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer}
        className="w-full h-full"
      />
      
      {/* 간단한 사용 안내 */}
      {isAddingMode && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-sm z-10">
          <h4 className="font-semibold mb-2 text-sm">📍 부스 영역 설정</h4>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>• <span className="font-semibold">지도를 클릭</span>하여 점 추가</p>
            <p>• <span className="font-semibold">마커 클릭</span>으로 점 삭제</p>
            <p>• 최소 <span className="font-semibold text-red-500">3개</span> 이상 필요</p>
            
            <div className="pt-2 border-t mt-2">
              <p className="font-semibold text-purple-600 text-sm">
                현재: {selectedCoordinates.length}개 점
              </p>
            </div>
            
            {selectedCoordinates.length > 0 && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    const newCoords = selectedCoordinates.slice(0, -1);
                    onCoordinateSelect(newCoords);
                  }}
                  className="flex-1 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  ↩ 되돌리기
                </button>
                <button
                  onClick={() => onCoordinateSelect([])}
                  className="flex-1 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  🗑 초기화
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 팁 표시 */}
      {isAddingMode && selectedCoordinates.length === 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-xs shadow-lg z-10">
          💡 지도를 클릭하여 시작하세요!
        </div>
      )}
    </div>
  );
}