'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getFestivalData,
  addBooth,
  updateBooth,
  deleteBooth,
  syncFestivalDataToSupabase,
} from '@/lib/actions/festival-data';
import type { FestivalBooth } from '@/asv-festival-2025.types';

type ZoneType = 'advanceZone' | 'shineZone' | 'viewZone' | 'futureScienceZone';

const ZONE_NAMES: Record<ZoneType, string> = {
  advanceZone: 'Advance Zone (발전하는 과학)',
  shineZone: 'Shine Zone (빛나는 과학)',
  viewZone: 'View Zone (과학의 관점)',
  futureScienceZone: 'Future Science Zone (주제존)',
};

export default function FestivalDataManager() {
  const [selectedZone, setSelectedZone] = useState<ZoneType>('advanceZone');
  const [booths, setBooths] = useState<FestivalBooth[]>([]);
  const [filteredBooths, setFilteredBooths] = useState<FestivalBooth[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 편집/추가 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingBooth, setEditingBooth] = useState<FestivalBooth | null>(null);
  const [originalBoothNumber, setOriginalBoothNumber] = useState('');

  // 폼 상태
  const [formData, setFormData] = useState<FestivalBooth>({
    boothNumber: '',
    programName: '',
    organization: '',
  });

  // 데이터 로드
  const loadBooths = async () => {
    setIsLoading(true);
    try {
      const data = await getFestivalData();
      const zoneBooths = data.zones[selectedZone].booths;
      setBooths(zoneBooths);
      setFilteredBooths(zoneBooths);
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone]);

  // 검색 필터링
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setFilteredBooths(booths);
      return;
    }

    const keyword = searchKeyword.toLowerCase();
    const filtered = booths.filter(
      (booth) =>
        booth.boothNumber.toLowerCase().includes(keyword) ||
        booth.programName.toLowerCase().includes(keyword) ||
        booth.organization.toLowerCase().includes(keyword)
    );
    setFilteredBooths(filtered);
  }, [searchKeyword, booths]);

  // 부스 추가 모달 열기
  const handleOpenAddModal = () => {
    setEditMode('add');
    setFormData({
      boothNumber: '',
      programName: '',
      organization: '',
    });
    setIsModalOpen(true);
  };

  // 부스 수정 모달 열기
  const handleOpenEditModal = (booth: FestivalBooth) => {
    setEditMode('edit');
    setEditingBooth(booth);
    setOriginalBoothNumber(booth.boothNumber);
    setFormData({ ...booth });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBooth(null);
    setOriginalBoothNumber('');
    setFormData({
      boothNumber: '',
      programName: '',
      organization: '',
    });
  };

  // 부스 저장 (추가 또는 수정)
  const handleSaveBooth = async () => {
    if (!formData.boothNumber.trim() || !formData.programName.trim() || !formData.organization.trim()) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      let result;

      if (editMode === 'add') {
        result = await addBooth(selectedZone, formData);
      } else {
        result = await updateBooth(selectedZone, originalBoothNumber, formData);
      }

      if (result.success) {
        toast.success(result.message);
        handleCloseModal();

        // 데이터만 다시 로드 (페이지 새로고침 없이)
        await loadBooths();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('저장에 실패했습니다.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase 동기화
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncToSupabase = async () => {
    if (!confirm('JSON 파일의 데이터를 Supabase 부스 정보와 동기화하시겠습니까?\n\n부스 번호로 매칭하여 name과 description이 업데이트됩니다.')) {
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncFestivalDataToSupabase();

      if (result.success) {
        toast.success(
          `${result.message}\n\n` +
          `전체: ${result.details?.total}개\n` +
          `업데이트: ${result.details?.updated}개\n` +
          `매칭 실패: ${result.details?.notFound}개`,
          { duration: 5000 }
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('동기화 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 부스 삭제
  const handleDeleteBooth = async (boothNumber: string) => {
    if (!confirm(`부스 ${boothNumber}를 삭제하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteBooth(selectedZone, boothNumber);

      if (result.success) {
        toast.success(result.message);

        // 데이터만 다시 로드 (페이지 새로고침 없이)
        await loadBooths();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="p-3 border-b">
        <h2 className="text-lg font-bold mb-3">축제 부스 데이터 관리</h2>

        {/* Zone 선택 */}
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {(Object.keys(ZONE_NAMES) as ZoneType[]).map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 text-xs rounded whitespace-nowrap transition ${
                selectedZone === zone
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {ZONE_NAMES[zone]}
            </button>
          ))}
        </div>

        {/* 검색 및 추가 */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="부스 번호, 프로그램명, 운영기관 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSyncToSupabase}
            disabled={isLoading || isSyncing}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
            title="JSON 데이터를 Supabase와 동기화"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            동기화
          </button>
          <button
            onClick={handleOpenAddModal}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          총 {filteredBooths.length}개 부스
        </div>
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                부스 번호
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                프로그램명
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                운영기관
              </th>
              <th className="px-3 py-2 text-center font-medium text-gray-700 border-b w-20">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : filteredBooths.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                  부스 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filteredBooths.map((booth) => (
                <tr key={booth.boothNumber} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{booth.boothNumber}</td>
                  <td className="px-3 py-2">{booth.programName}</td>
                  <td className="px-3 py-2 text-gray-600">{booth.organization}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(booth)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooth(booth.boothNumber)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 편집/추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">
                {editMode === 'add' ? '부스 추가' : '부스 수정'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  부스 번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.boothNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, boothNumber: e.target.value })
                  }
                  placeholder="예: A1, S11, V1, F1"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  프로그램명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.programName}
                  onChange={(e) =>
                    setFormData({ ...formData, programName: e.target.value })
                  }
                  placeholder="예: AI바둑로봇 체험"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  운영기관 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  placeholder="예: 한양대학교 ERICA캠퍼스"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleSaveBooth}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {editMode === 'add' ? '추가' : '수정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}