'use client';

export default function SkeletonLoader() {
  return (
    <div className="h-[calc(100vh-6.5rem)] animate-pulse">
      {/* 검색바 스켈레톤 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* 지도 영역 스켈레톤 */}
      <div className="relative h-[calc(100%-60px)] bg-gray-100">
        {/* 범례 스켈레톤 */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 w-32">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded flex-1"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded flex-1"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>

        {/* 플로팅 버튼 스켈레톤 */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>

        {/* 부스 폴리곤 스켈레톤 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}