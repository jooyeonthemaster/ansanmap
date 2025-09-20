// Kakao Maps 타입 정의
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: any;
        LatLng: any;
        Polygon: any;
        CustomOverlay: any;
        Marker: any;
        MarkerImage: any;
        Size: any;
        Point: any;
        MapTypeControl: any;
        ZoomControl: any;
        ControlPosition: any;
        MapTypeId: any;
        event: {
          addListener: (target: any, type: string, callback: (...args: any[]) => void) => void;
          removeListener: (target: any, type: string, callback: (...args: any[]) => void) => void;
        };
      };
    };
  }
}

// 카카오맵 인스턴스 타입
export interface KakaoMap {
  setCenter: (latlng: any) => void;
  getCenter: () => any;
  setLevel: (level: number) => void;
  getLevel: () => number;
  setMapTypeId: (mapTypeId: any) => void;
  addControl: (control: any, position: any) => void;
}

// 카카오 오버레이 타입
export interface KakaoOverlay {
  setMap: (map: KakaoMap | null) => void;
}

// 카카오 폴리곤 타입
export interface KakaoPolygon {
  setMap: (map: KakaoMap | null) => void;
  setOptions: (options: any) => void;
}

export {};
