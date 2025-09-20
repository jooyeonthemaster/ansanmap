'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBooths, addBooth, deleteBooth, updateBooth } from '@/lib/booth-storage';
import { Booth, CreateBoothDto } from '@/lib/types';
import { boothCategoryConfig, BoothCategory } from '@/lib/booth-config';
import AdminMap from '@/components/AdminMap';

export default function AdminPage() {
  const router = useRouter();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [isAddingBooth, setIsAddingBooth] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number}[]>([]);
  
  // 폼 상태
  const [formData, setFormData] = useState<CreateBoothDto>({
    name: '',
    category: 'food' as BoothCategory,
    description: '',
    coordinates: [],
    operatingHours: '',
    contact: '',
    menuItems: [],
    price: ''
  });

  // 부스 목록 로드
  useEffect(() => {
    loadBooths();
  }, []);

  const loadBooths = () => {
    setBooths(getBooths());
  };
  // 부스 추가 핸들러
  const handleAddBooth = () => {
    if (!formData.name || selectedCoordinates.length < 3) {
      alert('부스 이름과 최소 3개의 좌표를 설정해주세요.');
      return;
    }

    const boothData: CreateBoothDto = {
      ...formData,
      coordinates: selectedCoordinates,
      menuItems: formData.menuItems || []
    };

    addBooth(boothData);
    loadBooths();
    resetForm();
    setIsAddingBooth(false);
    setShowMap(false);
    alert('부스가 추가되었습니다!');
  };

  // 부스 삭제 핸들러
  const handleDeleteBooth = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteBooth(id);
      loadBooths();
    }
  };

  // 부스 활성/비활성 토글
  const toggleBoothActive = (booth: Booth) => {
    updateBooth(booth.id, { isActive: !booth.isActive });
    loadBooths();
  };

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'food',
      description: '',
      coordinates: [],
      operatingHours: '',
      contact: '',
      menuItems: [],
      price: ''
    });
    setSelectedCoordinates([]);
  };
  // 지도 모달 표시
  if (showMap) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="h-12 bg-white border-b flex items-center justify-between px-4 flex-shrink-0">
          <h3 className="font-semibold">부스 영역 설정</h3>
          <button
            onClick={() => setShowMap(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 relative">
          <AdminMap 
            onCoordinateSelect={setSelectedCoordinates}
            selectedCoordinates={selectedCoordinates}
            booths={booths}
            isAddingMode={true}
          />
        </div>
        
        <div className="p-4 bg-white border-t flex-shrink-0">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-600">
              {selectedCoordinates.length > 0 
                ? `선택된 좌표: ${selectedCoordinates.length}개` 
                : '상단 도구를 선택하고 지도에 도형을 그려주세요'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowMap(false);
                handleAddBooth();
              }}
              disabled={selectedCoordinates.length < 3}
              className="flex-1 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              영역 확정
            </button>
            <button
              onClick={() => {
                setShowMap(false);
                setSelectedCoordinates([]);
              }}
              className="flex-1 py-2 bg-gray-500 text-white rounded"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100svh-3rem-3.5rem)] bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">부스 관리</h1>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600"
        >
          ← 지도
        </button>
      </div>

      {/* 부스 추가 버튼 */}
      {!isAddingBooth && (
        <div className="p-4">
          <button
            onClick={() => setIsAddingBooth(true)}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            + 새 부스 추가
          </button>
        </div>
      )}

      {/* 부스 추가 폼 */}
      {isAddingBooth && (
        <div className="p-4 bg-white">
          <h3 className="font-bold mb-3">새 부스 정보</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="부스 이름"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as BoothCategory})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(boothCategoryConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.name}
                </option>
              ))}
            </select>
            
            <textarea
              placeholder="부스 설명"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg h-20"
            />
            <input
              type="text"
              placeholder="운영 시간 (예: 10:00 - 22:00)"
              value={formData.operatingHours}
              onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            
            <input
              type="text"
              placeholder="연락처 (선택)"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            
            <input
              type="text"
              placeholder="가격 정보 (선택)"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
            
            <button
              onClick={() => setShowMap(true)}
              className="w-full py-3 bg-gray-100 border border-gray-300 rounded-lg"
            >
              {selectedCoordinates.length > 0 
                ? `✅ 영역 설정됨 (${selectedCoordinates.length}개 좌표)`
                : '📍 지도에서 영역 설정'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsAddingBooth(false);
                  resetForm();
                }}
                className="flex-1 py-2 bg-gray-500 text-white rounded-lg"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 부스 목록 */}
      <div className="p-4">
        <h3 className="font-semibold mb-3 text-gray-700">
          등록된 부스 ({booths.length})
        </h3>
        <div className="space-y-2">
          {booths.length === 0 && (
            <p className="text-center py-8 text-gray-400">
              등록된 부스가 없습니다
            </p>
          )}
          {booths.map(booth => (
            <div 
              key={booth.id}
              className="bg-white border rounded-lg p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-1">
                    {boothCategoryConfig[booth.category].icon}
                    {booth.name}
                  </h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded inline-block mt-1">
                    {boothCategoryConfig[booth.category].name}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  booth.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {booth.isActive ? '운영중' : '중단'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{booth.description}</p>
              <p className="text-xs text-gray-500 mb-2">⏰ {booth.operatingHours}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => toggleBoothActive(booth)}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    booth.isActive 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {booth.isActive ? '운영 중단' : '운영 재개'}
                </button>
                <button
                  onClick={() => handleDeleteBooth(booth.id)}
                  className="flex-1 py-1.5 text-xs bg-red-100 text-red-700 rounded"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}