'use client';

import { useEffect, useRef, useState } from 'react';
import { Booth } from '@/lib/types';
import { boothCategoryConfig } from '@/lib/booth-config';
import { X, Clock, Phone } from 'lucide-react';

interface AdminMapProps {
  onCoordinateSelect: (coords: {lat: number, lng: number}[]) => void;
  selectedCoordinates: {lat: number, lng: number}[];
  booths: Booth[];
  isAddingMode: boolean;
  onDeleteBooth?: (boothId: string) => void;
  onEditBooth?: (booth: Booth) => void;
}

export default function AdminMap({
  onCoordinateSelect,
  selectedCoordinates,
  booths,
  isAddingMode,
  onDeleteBooth,
  onEditBooth
}: AdminMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const polygonsRef = useRef<unknown[]>([]);
  const drawingPolygonRef = useRef<unknown>(null);
  const drawingLineRef = useRef<unknown>(null);
  const clickListenerRef = useRef<unknown>(null);
  const [isDraggingPolygon, setIsDraggingPolygon] = useState(false);
  const [isDraggingMarker, setIsDraggingMarker] = useState(false);
  const markerClickTimeRef = useRef<number>(0);
  const polygonDragStartRef = useRef<{ lat: number; lng: number } | null>(null);
  const boothLabelsRef = useRef<Map<string, unknown>>(new Map());
  const [previewBooth, setPreviewBooth] = useState<Booth | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');


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

        // 지도 타입 컨트롤 추가
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        kakaoMap.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        // 줌 컨트롤 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        kakaoMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

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
    if (clickListenerRef.current && window.kakao?.maps?.event) {
      try {
        window.kakao.maps.event.removeListener(map, 'click', clickListenerRef.current);
      } catch {
        // 리스너 제거 실패 시 무시
      }
    }

    if (isAddingMode) {
      const clickHandler = (mouseEvent: unknown) => {
        // 드래그 중이면 클릭 무시
        if (isDraggingPolygon || isDraggingMarker) return;

        const latlng = (mouseEvent as { latLng: { getLat: () => number; getLng: () => number } }).latLng;
        const newCoord = {
          lat: latlng.getLat(),
          lng: latlng.getLng()
        };

        // 기존 부스 영역 안이면 핀 생성 안 함
        if (isClickInsideExistingBooth(newCoord)) {
          return;
        }

        // ref를 통해 최신 좌표 가져와서 새 배열 생성
        const updatedCoords = [...coordsRef.current, newCoord];
        onCoordinateSelect(updatedCoords);
      };

      // 새 리스너 추가
      clickListenerRef.current = clickHandler;
      window.kakao.maps.event.addListener(map, 'click', clickHandler);
    }

    // 클린업
    return () => {
      if (clickListenerRef.current && window.kakao?.maps?.event) {
        try {
          window.kakao.maps.event.removeListener(map, 'click', clickListenerRef.current);
        } catch {
          // 클린업 실패 시 무시
        }
        clickListenerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isAddingMode, onCoordinateSelect, isDraggingPolygon, isDraggingMarker]);
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

    // 새 마커 추가 (드래그 가능)
    selectedCoordinates.forEach((coord, index) => {
      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(coord.lat, coord.lng),
        map: map,
        draggable: true // 드래그 가능
      });

      let hasDragged = false;

      // 마커 드래그 시작
      window.kakao.maps.event.addListener(marker, 'dragstart', () => {
        setIsDraggingMarker(true);
        hasDragged = false;
      });

      let dragTimeout: NodeJS.Timeout | null = null;

      // 마커 드래그 중 - 스로틀링으로 성능 개선
      window.kakao.maps.event.addListener(marker, 'drag', () => {
        hasDragged = true;

        if (dragTimeout) {
          clearTimeout(dragTimeout);
        }

        dragTimeout = setTimeout(() => {
          const position = (marker as { getPosition: () => { getLat: () => number; getLng: () => number } }).getPosition();
          const updatedCoords = [...selectedCoordinates];
          updatedCoords[index] = {
            lat: position.getLat(),
            lng: position.getLng()
          };
          onCoordinateSelect(updatedCoords);
        }, 16); // 약 60fps
      });

      // 마커 드래그 종료 - 최종 위치 확정
      window.kakao.maps.event.addListener(marker, 'dragend', () => {
        setIsDraggingMarker(false);

        if (dragTimeout) {
          clearTimeout(dragTimeout);
        }

        const position = (marker as { getPosition: () => { getLat: () => number; getLng: () => number } }).getPosition();
        const updatedCoords = [...selectedCoordinates];
        updatedCoords[index] = {
          lat: position.getLat(),
          lng: position.getLng()
        };
        onCoordinateSelect(updatedCoords);
      });

      // 마커 클릭 - 짧은 클릭은 삭제, 드래그는 이동
      window.kakao.maps.event.addListener(marker, 'click', () => {
        const currentTime = Date.now();
        const lastClickTime = markerClickTimeRef.current;

        // 드래그하지 않았고, 더블클릭이 아닌 경우에만 삭제
        if (!hasDragged && (currentTime - lastClickTime > 300)) {
          setTimeout(() => {
            // 300ms 후에도 더블클릭이 발생하지 않았으면 삭제
            if (Date.now() - markerClickTimeRef.current > 250) {
              const updatedCoords = selectedCoordinates.filter((_, i) => i !== index);
              onCoordinateSelect(updatedCoords);
            }
          }, 300);
        }
        markerClickTimeRef.current = currentTime;
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

    // 폴리곤 그리기 (3개 이상의 점) - 드래그 가능
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

      const polygon = drawingPolygonRef.current;

      // 편집 중인 폴리곤 클릭 시 핀 생성 방지
      window.kakao.maps.event.addListener(polygon, 'click', () => {
        setIsDraggingPolygon(true);
        setTimeout(() => setIsDraggingPolygon(false), 100);
      });

      // 마우스 오버/아웃 효과
      window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (polygon as any).setOptions({
          strokeWeight: 4,
          fillOpacity: 0.3
        });
      });

      window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
        if (!polygonDragStartRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (polygon as any).setOptions({
            strokeWeight: 3,
            fillOpacity: 0.2
          });
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (polygon as any).setMap(map);
    }
  }, [map, selectedCoordinates, onCoordinateSelect]);

  // 폴리곤 중심점 계산
  const getPolygonCenter = (coordinates: {lat: number, lng: number}[]) => {
    const latSum = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    return {
      lat: latSum / coordinates.length,
      lng: lngSum / coordinates.length
    };
  };

  // Point-in-Polygon 체크 (Ray Casting Algorithm)
  const isPointInPolygon = (point: {lat: number, lng: number}, polygon: {lat: number, lng: number}[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;

      const intersect = ((yi > point.lng) !== (yj > point.lng))
          && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // 클릭한 지점이 기존 부스 영역 안인지 체크
  const isClickInsideExistingBooth = (clickPoint: {lat: number, lng: number}) => {
    return booths.some(booth => isPointInPolygon(clickPoint, booth.coordinates));
  };

  // 기존 부스들 표시 (클릭하면 영역 복사)
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

    // 기존 라벨 제거
    boothLabelsRef.current.forEach(label => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (label && (label as any).setMap) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (label as any).setMap(null);
      }
    });
    boothLabelsRef.current.clear();

    // 부스별로 폴리곤 생성
    booths.forEach(booth => {
      const config = boothCategoryConfig[booth.category] || boothCategoryConfig.info;

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

      // 폴리곤 클릭 시 미리보기 표시
      window.kakao.maps.event.addListener(polygon, 'click', (mouseEvent: unknown) => {
        // 이벤트 전파 중단 - 지도 클릭 이벤트가 발생하지 않도록
        if ((mouseEvent as { preventDefault?: () => void }).preventDefault) {
          (mouseEvent as { preventDefault: () => void }).preventDefault();
        }

        // 미리보기 모달 표시
        setPreviewBooth(booth);

        setIsDraggingPolygon(true); // 짧은 시간동안 지도 클릭 무시
        setTimeout(() => setIsDraggingPolygon(false), 100);
      });

      // 마우스 오버/아웃 효과
      window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (polygon as any).setOptions({
          strokeWeight: 3,
          strokeOpacity: 1,
          fillOpacity: 0.5
        });
      });

      window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (polygon as any).setOptions({
          strokeWeight: 2,
          strokeOpacity: booth.isActive ? 0.8 : 0.3,
          fillOpacity: booth.isActive ? config.fillOpacity : 0.2
        });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (polygon as any).setMap(map);
      polygonsRef.current.push(polygon);

      // 부스 코드 라벨 생성 (기본: 코드만, 호버: 전체 이름)
      if (isAddingMode && booth.coordinates.length >= 3) {
        const center = getPolygonCenter(booth.coordinates);

        // 부스 코드 추출 (부스번호 또는 이름의 앞부분)
        const boothCode = booth.name.split(' - ')[0] || booth.name.substring(0, 6);

        const labelContent = document.createElement('div');
        labelContent.className = 'px-2 py-1 bg-white bg-opacity-95 rounded shadow-lg text-xs font-semibold border-2 border-blue-500 whitespace-nowrap transition-all';
        labelContent.textContent = boothCode;
        labelContent.style.pointerEvents = 'auto'; // 호버 이벤트 가능하도록
        labelContent.style.display = 'block';
        labelContent.style.cursor = 'pointer';

        // 클릭 시 부스 정보 표시
        labelContent.addEventListener('click', () => {
          setPreviewBooth(booth);
        });

        // 호버 시 전체 이름 표시
        labelContent.addEventListener('mouseenter', () => {
          labelContent.textContent = booth.name;
          labelContent.style.zIndex = '1000';
        });

        labelContent.addEventListener('mouseleave', () => {
          labelContent.textContent = boothCode;
          labelContent.style.zIndex = 'auto';
        });

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(center.lat, center.lng),
          content: labelContent,
          yAnchor: 0.5
        });

        // 어드민에서는 항상 표시
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (customOverlay as any).setMap(map);
        boothLabelsRef.current.set(booth.id, customOverlay);
      }
    });
  }, [map, booths, isAddingMode, onCoordinateSelect]);

  // 지도 타입 전환
  const toggleMapType = () => {
    if (!map || !window.kakao) return;

    if (mapType === 'roadmap') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
      setMapType('satellite');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
      setMapType('roadmap');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full"
      />

      {/* 지도 타입 전환 버튼 */}
      <button
        onClick={toggleMapType}
        className="absolute top-4 right-4 z-10 px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-xs font-medium border border-gray-200"
      >
        {mapType === 'roadmap' ? '🛰️ 위성' : '🗺️ 지도'}
      </button>

      {/* 부스 미리보기 모달 */}
      {previewBooth && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl z-20 max-w-md mx-auto">
          <div className="relative">
            <button
              onClick={() => setPreviewBooth(null)}
              className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-2xl">
                  {(boothCategoryConfig[previewBooth.category] || boothCategoryConfig.info).icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{previewBooth.name}</h3>
                  <p className="text-xs text-gray-600">{(boothCategoryConfig[previewBooth.category] || boothCategoryConfig.info).name}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-700">{previewBooth.description}</p>

                {previewBooth.operatingHours && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{previewBooth.operatingHours}</span>
                  </div>
                )}

                {previewBooth.contact && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{previewBooth.contact}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t">
                {isAddingMode && (
                  <p className="text-xs text-gray-500 mb-3">
                    💡 이 부스의 정보입니다. 새 영역을 그리고 오른쪽 목록에서 부스를 선택하세요.
                  </p>
                )}

                {/* 수정/삭제 버튼은 항상 표시 */}
                {(onEditBooth || onDeleteBooth) && (
                  <div className="flex gap-2">
                    {onEditBooth && (
                      <button
                        onClick={() => {
                          onEditBooth(previewBooth);
                          setPreviewBooth(null);
                        }}
                        className="flex-1 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition"
                      >
                        수정
                      </button>
                    )}
                    {onDeleteBooth && (
                      <button
                        onClick={() => {
                          if (confirm(`"${previewBooth.name}" 부스를 삭제하시겠습니까?`)) {
                            onDeleteBooth(previewBooth.id);
                            setPreviewBooth(null);
                          }
                        }}
                        className="flex-1 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 간단한 사용 안내 */}
      {isAddingMode && !previewBooth && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-sm z-10">
          <h4 className="font-semibold mb-2 text-sm">📍 부스 영역 설정</h4>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>• <span className="font-semibold">지도 클릭</span>: 점 추가</p>
            <p>• <span className="font-semibold">기존 부스 클릭</span>: 정보 미리보기</p>
            <p>• <span className="font-semibold">마커 드래그</span>: 점 위치 조정</p>
            <p>• <span className="font-semibold">마커 클릭</span>: 점 삭제</p>
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