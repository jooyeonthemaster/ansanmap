'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBooths, addBooth, deleteBooth, updateBooth } from '@/lib/supabase/booth-api';
import { Booth, CreateBoothDto } from '@/lib/types';
import { boothCategoryConfig, BoothCategory } from '@/lib/booth-config';
import AdminMap from '@/components/AdminMap';
import AnnouncementManager from '@/components/AnnouncementManager';
import AdminChatManager from '@/components/AdminChatManager';
import FestivalDataManager from '@/components/FestivalDataManager';
import toast from 'react-hot-toast';
import festivalData from '@/asv-festival-2025.json';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'booths' | 'announcements' | 'messages' | 'festival'>('booths');
  const [booths, setBooths] = useState<Booth[]>([]);
  const [isAddingBooth, setIsAddingBooth] = useState(false);
  const [editingBoothId, setEditingBoothId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number}[]>([]);
  const [showBoothList, setShowBoothList] = useState(false);
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(false);
  const [highlightedBoothId, setHighlightedBoothId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 폼 상태
  const [formData, setFormData] = useState<CreateBoothDto>({
    name: '',
    category: 'info' as BoothCategory,
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

  const loadBooths = async () => {
    const data = await getBooths();
    setBooths(data);
  };

  // 부스 수정 시작
  const handleEditBooth = (booth: Booth) => {
    setEditingBoothId(booth.id);
    setFormData({
      name: booth.name,
      category: booth.category,
      description: booth.description || '',
      coordinates: booth.coordinates,
      operatingHours: booth.operatingHours || '',
      contact: booth.contact || '',
      menuItems: booth.menuItems || [],
      price: booth.price || ''
    });
    setSelectedCoordinates(booth.coordinates);
    setIsAddingBooth(true);
  };

  // 부스 영역 복사 (새 부스 추가용)
  const handleCopyBoothArea = (booth: Booth) => {
    setEditingBoothId(null); // 새 부스로 추가
    setFormData({
      name: '',
      category: 'info',
      description: '',
      coordinates: booth.coordinates,
      operatingHours: '',
      contact: '',
      menuItems: [],
      price: ''
    });
    setSelectedCoordinates(booth.coordinates);
    setIsAddingBooth(true);
    toast.success(`"${booth.name}" 영역이 복사되었습니다!`);
  };

  // 부스 추가/수정 핸들러 (사용되지 않음 - 추후 필요시 사용)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveBooth = async () => {
    if (!formData.name || selectedCoordinates.length < 3) {
      alert('부스 이름과 최소 3개의 좌표를 설정해주세요.');
      return;
    }

    const boothData: CreateBoothDto = {
      ...formData,
      coordinates: selectedCoordinates,
      menuItems: formData.menuItems || []
    };

    if (editingBoothId) {
      // 수정 모드
      const result = await updateBooth(editingBoothId, boothData);
      if (result) {
        toast.success('부스가 수정되었습니다!');
        await loadBooths();
        resetForm();
        setIsAddingBooth(false);
        setEditingBoothId(null);
        setShowMap(false);
      } else {
        toast.error('부스 수정에 실패했습니다.');
      }
    } else {
      // 추가 모드
      const result = await addBooth(boothData);
      if (result) {
        toast.success('부스가 추가되었습니다!');
        await loadBooths();
        resetForm();
        setIsAddingBooth(false);
        setShowMap(false);
      } else {
        toast.error('부스 추가에 실패했습니다.');
      }
    }
  };

  // 부스 삭제 핸들러
  const handleDeleteBooth = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const result = await deleteBooth(id);
      if (result) {
        toast.success('부스가 삭제되었습니다.');
        await loadBooths();
      } else {
        toast.error('부스 삭제에 실패했습니다.');
      }
    }
  };

  // 부스 활성/비활성 토글
  const toggleBoothActive = async (booth: Booth) => {
    const result = await updateBooth(booth.id, { isActive: !booth.isActive });
    if (result) {
      toast.success(booth.isActive ? '운영이 중단되었습니다.' : '운영이 재개되었습니다.');
      await loadBooths();
    } else {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'info',
      description: '',
      coordinates: [],
      operatingHours: '',
      contact: '',
      menuItems: [],
      price: ''
    });
    setSelectedCoordinates([]);
    setEditingBoothId(null);
  };

  // JSON 부스 선택 핸들러
  const handleSelectBoothFromJson = (boothData: { boothNumber: string; programName: string; organization: string }) => {
    setFormData({
      ...formData,
      name: `${boothData.boothNumber} - ${boothData.programName}`,
      description: boothData.organization || '',
      category: 'info' // 기본값, 필요시 수정
    });
    setShowBoothList(false);
    toast.success(`"${boothData.programName}" 정보가 입력되었습니다!`);
  };

  // 모든 부스를 평탄화하여 목록 생성
  const getAllBooths = () => {
    const allBooths: Array<{ zone: string; zoneName: string; booth: { boothNumber: string; programName: string; organization: string } }> = [];

    Object.entries(festivalData.zones).forEach(([zoneKey, zoneData]) => {
      // booths 배열이 있는 zone만 처리
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((zoneData as any).booths && Array.isArray((zoneData as any).booths)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (zoneData as any).booths.forEach((booth: { boothNumber: string; programName: string; organization: string }) => {
          allBooths.push({
            zone: zoneKey,
            zoneName: zoneData.name,
            booth
          });
        });
      }
    });

    return allBooths;
  };
  // 부스 목록 모달 표시
  if (showBoothList) {
    getAllBooths();
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="h-12 bg-white border-b flex items-center justify-between px-4 flex-shrink-0">
          <h3 className="font-semibold">부스 선택</h3>
          <button
            onClick={() => setShowBoothList(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(festivalData.zones).map(([zoneKey, zoneData]) => {
            // booths 배열이 있는 zone만 렌더링
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!(zoneData as any).booths || !Array.isArray((zoneData as any).booths)) {
              return null;
            }

            return (
              <div key={zoneKey} className="mb-6">
                <h4 className="font-bold text-lg mb-2 text-blue-600">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {zoneData.name} - {(zoneData as any).theme}
                </h4>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(zoneData as any).booths.map((booth: { boothNumber: string; programName: string; organization: string }) => (
                    <button
                      key={booth.boothNumber}
                      onClick={() => handleSelectBoothFromJson(booth)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border rounded-lg transition"
                    >
                      <div className="font-semibold text-sm">
                        {booth.boothNumber} - {booth.programName}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {booth.organization}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 부스가 이미 할당되었는지 확인
  const isBoothAssigned = (boothNumber: string) => {
    return booths.some(booth => booth.name.includes(boothNumber));
  };

  // 할당된 부스 개수 계산
  const getAssignedBoothsCount = () => {
    const allBoothNumbers = getAllBooths().map(b => b.booth.boothNumber);
    return allBoothNumbers.filter(bn => isBoothAssigned(bn)).length;
  };

  // 지도에서 부스 선택하여 자동 저장
  const handleQuickSaveBooth = async (boothData: { boothNumber: string; programName: string; organization: string }) => {
    if (selectedCoordinates.length < 3) {
      toast.error('최소 3개의 좌표를 설정해주세요!');
      return;
    }

    // 하이라이트 효과
    setHighlightedBoothId(boothData.boothNumber);
    setTimeout(() => setHighlightedBoothId(null), 2000);

    const newBoothData: CreateBoothDto = {
      name: `${boothData.boothNumber} - ${boothData.programName}`,
      category: 'info',
      description: boothData.organization || '',
      coordinates: selectedCoordinates,
      operatingHours: '',
      contact: '',
      menuItems: [],
      price: ''
    };

    const result = await addBooth(newBoothData);
    if (result) {
      toast.success(`"${boothData.programName}" 부스가 등록되었습니다!`);
      await loadBooths();
      setSelectedCoordinates([]); // 좌표 리셋하여 다음 영역 생성 가능
    } else {
      toast.error('부스 등록에 실패했습니다.');
    }
  };

  // 지도 모달 표시
  if (showMap) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex">
        {/* 지도 영역 */}
        <div className="flex-1 flex flex-col">
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
              onDeleteBooth={handleDeleteBooth}
              onEditBooth={handleEditBooth}
            />
          </div>

          <div className="p-4 bg-white border-t flex-shrink-0">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {selectedCoordinates.length > 0
                  ? `✅ 영역 생성됨 (${selectedCoordinates.length}개 좌표) → 오른쪽 목록에서 부스 선택`
                  : '📍 지도에서 영역을 그려주세요'}
              </span>
            </div>
          </div>
        </div>

        {/* 부스 목록 사이드바 */}
        <div className="w-80 bg-gray-50 border-l flex flex-col">
          <div className="bg-white border-b px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">부스 목록</h3>
              <span className="text-xs text-gray-600">
                {getAssignedBoothsCount()} / {getAllBooths().length}
              </span>
            </div>

            {/* 검색 입력 */}
            <input
              type="text"
              placeholder="부스번호, 프로그램명, 단체명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border rounded-lg mb-2"
            />

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUnassigned}
                onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
                className="rounded"
              />
              <span>미할당 부스만 보기</span>
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {Object.entries(festivalData.zones).map(([zoneKey, zoneData]) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (!(zoneData as any).booths || !Array.isArray((zoneData as any).booths)) {
                return null;
              }

              // 필터링된 부스 목록 (검색 + 미할당 필터)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const filteredBooths = (zoneData as any).booths.filter((booth: { boothNumber: string; programName: string; organization: string }) => {
                // 검색어 필터
                if (searchQuery.trim()) {
                  const query = searchQuery.toLowerCase();
                  const matchesSearch =
                    booth.boothNumber.toLowerCase().includes(query) ||
                    booth.programName.toLowerCase().includes(query) ||
                    booth.organization.toLowerCase().includes(query);

                  if (!matchesSearch) return false;
                }

                // 미할당 필터
                if (showOnlyUnassigned) {
                  return !isBoothAssigned(booth.boothNumber);
                }
                return true;
              });

              if (filteredBooths.length === 0) {
                return null;
              }

              return (
                <div key={zoneKey} className="mb-4">
                  <h4 className="font-bold text-sm mb-2 text-blue-600 sticky top-0 bg-gray-50 py-1">
                    {zoneData.name}
                  </h4>
                  <div className="space-y-1">
                    {filteredBooths.map((booth: { boothNumber: string; programName: string; organization: string }) => {
                      const isAssigned = isBoothAssigned(booth.boothNumber);
                      const isHighlighted = highlightedBoothId === booth.boothNumber;

                      return (
                        <button
                          key={booth.boothNumber}
                          onClick={() => handleQuickSaveBooth(booth)}
                          disabled={selectedCoordinates.length < 3 || isAssigned}
                          className={`w-full text-left p-2 border rounded transition text-xs ${
                            isHighlighted
                              ? 'bg-green-100 border-green-500 scale-105'
                              : isAssigned
                              ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                              : 'bg-white hover:bg-blue-50 border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold flex-1">
                              {booth.boothNumber} - {booth.programName}
                            </div>
                            {isAssigned && (
                              <span className="text-green-600 ml-2">✓</span>
                            )}
                          </div>
                          <div className="text-gray-600 mt-0.5 line-clamp-1">
                            {booth.organization}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 - PC 반응형 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">관리자 페이지</h1>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 사용자 화면으로
          </button>
        </div>

        {/* 탭 메뉴 - PC 반응형 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex border-t">
            <button
              onClick={() => setActiveTab('booths')}
              className={`flex-1 sm:flex-initial sm:px-8 py-3 text-sm font-medium transition-colors ${
                activeTab === 'booths'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              부스 관리
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex-1 sm:flex-initial sm:px-8 py-3 text-sm font-medium transition-colors ${
                activeTab === 'announcements'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              공지사항 관리
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 sm:flex-initial sm:px-8 py-3 text-sm font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              메시지 관리
            </button>
            <button
              onClick={() => setActiveTab('festival')}
              className={`flex-1 sm:flex-initial sm:px-8 py-3 text-sm font-medium transition-colors ${
                activeTab === 'festival'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              축제 데이터
            </button>
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 - PC 반응형 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'festival' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-180px)]">
            <FestivalDataManager />
          </div>
        ) : activeTab === 'messages' ? (
          <AdminChatManager />
        ) : activeTab === 'announcements' ? (
          <AnnouncementManager />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 지도 영역 (PC에서 2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* 부스 관리 지도 */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-[500px] relative">
                  <AdminMap
                    onCoordinateSelect={() => {}}
                    selectedCoordinates={[]}
                    booths={booths}
                    isAddingMode={false}
                    onDeleteBooth={handleDeleteBooth}
                    onEditBooth={handleEditBooth}
                  />
                </div>
              </div>

              {/* 부스 추가 버튼 */}
              <button
                onClick={() => setShowMap(true)}
                className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors shadow-sm"
              >
                📍 지도에서 부스 등록하기
              </button>
            </div>

            {/* 오른쪽: 부스 목록 (PC에서 1/3) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <h3 className="font-semibold mb-4 text-gray-700 text-lg">
                  등록된 부스 ({booths.length})
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {booths.length === 0 && (
                    <p className="text-center py-12 text-gray-400">
                      등록된 부스가 없습니다
                    </p>
                  )}
                  {booths.map(booth => (
                    <div
                      key={booth.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold flex items-center gap-1 text-sm truncate">
                            {(boothCategoryConfig[booth.category] || boothCategoryConfig.info).icon}
                            <span className="truncate">{booth.name}</span>
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded inline-block mt-1">
                            {(boothCategoryConfig[booth.category] || boothCategoryConfig.info).name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ml-2 ${
                          booth.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {booth.isActive ? '운영중' : '중단'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{booth.description}</p>
                      <p className="text-xs text-gray-500 mb-3">⏰ {booth.operatingHours}</p>

                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => handleEditBooth(booth)}
                            className="py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => toggleBoothActive(booth)}
                            className={`py-1.5 text-xs rounded transition-colors ${
                              booth.isActive
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {booth.isActive ? '중단' : '재개'}
                          </button>
                          <button
                            onClick={() => handleDeleteBooth(booth.id)}
                            className="py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                        <button
                          onClick={() => handleCopyBoothArea(booth)}
                          className="w-full py-1.5 text-xs bg-purple-100 text-purple-700 rounded border border-purple-200 hover:bg-purple-200 transition-colors"
                        >
                          📋 영역 복사
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}