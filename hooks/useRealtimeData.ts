import { useState, useEffect } from 'react';
import { Booth } from '@/lib/types';
import { getBooths } from '@/lib/utils/storage';

// 실시간 부스 데이터 업데이트 Hook
export function useRealtimeBooths(updateInterval: number = 10000) {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooths = () => {
      const loadedBooths = getBooths();
      
      // 실시간 데이터 시뮬레이션 (실제로는 API 호출)
      const enhancedBooths = loadedBooths.map(booth => ({
        ...booth,
        congestionLevel: booth.congestionLevel || 
          (['low', 'medium', 'high', 'very-high'][Math.floor(Math.random() * 4)] as any),
        waitingTime: booth.waitingTime ?? Math.floor(Math.random() * 30),
        currentVisitors: booth.currentVisitors ?? Math.floor(Math.random() * 50),
        maxCapacity: booth.maxCapacity || 50,
        popularityScore: booth.popularityScore ?? (Math.random() * 5),
      }));
      
      setBooths(enhancedBooths);
      setLoading(false);
    };

    loadBooths();
    const interval = setInterval(loadBooths, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateInterval]);

  return { booths, loading };
}

// 사용자 위치 추적 Hook
export function useUserLocation() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('위치 서비스를 사용할 수 없습니다');
      return;
    }

    let watchId: number;

    const startWatching = () => {
      setWatching(true);
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation(position.coords);
          setError(null);
        },
        (error) => {
          setError(error.message);
          setWatching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };

    startWatching();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      setWatching(false);
    };
  }, []);

  return { location, error, watching };
}

// 네트워크 상태 감지 Hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}