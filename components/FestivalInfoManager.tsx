'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFestivalInfo, updateFestivalInfo } from '@/lib/supabase/festival-info-api';
import { FestivalInfo } from '@/lib/types/festival-info';

export default function FestivalInfoManager() {
  const [festivalInfo, setFestivalInfo] = useState<FestivalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    festival_name: '',
    festival_dates: '',
    day1_date: '',
    day1_hours: '',
    day2_date: '',
    day2_hours: '',
    address: '',
    campus_name: '',
    subway_info: '',
    bus_info: '',
    main_contact_label: '',
    main_contact: '',
    support_contact_label: '',
    support_contact: '',
    lost_found_contact_label: '',
    lost_found_contact: '',
  });

  // 데이터 로드
  const loadFestivalInfo = async () => {
    setIsLoading(true);
    try {
      const data = await getFestivalInfo();

      if (data) {
        setFestivalInfo(data);
        setFormData({
          festival_name: data.festival_name,
          festival_dates: data.festival_dates,
          day1_date: data.day1_date,
          day1_hours: data.day1_hours,
          day2_date: data.day2_date,
          day2_hours: data.day2_hours,
          address: data.address,
          campus_name: data.campus_name,
          subway_info: data.subway_info,
          bus_info: data.bus_info,
          main_contact_label: data.main_contact_label,
          main_contact: data.main_contact,
          support_contact_label: data.support_contact_label,
          support_contact: data.support_contact,
          lost_found_contact_label: data.lost_found_contact_label,
          lost_found_contact: data.lost_found_contact,
        });
      } else {
        toast.error('축제 정보가 없습니다. Supabase에 데이터가 있는지 확인해주세요.');
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('축제 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFestivalInfo();
  }, []);

  // festivalInfo가 업데이트되면 formData도 동기화
  useEffect(() => {
    if (festivalInfo) {
      setFormData({
        festival_name: festivalInfo.festival_name,
        festival_dates: festivalInfo.festival_dates,
        day1_date: festivalInfo.day1_date,
        day1_hours: festivalInfo.day1_hours,
        day2_date: festivalInfo.day2_date,
        day2_hours: festivalInfo.day2_hours,
        address: festivalInfo.address,
        campus_name: festivalInfo.campus_name,
        subway_info: festivalInfo.subway_info,
        bus_info: festivalInfo.bus_info,
        main_contact_label: festivalInfo.main_contact_label,
        main_contact: festivalInfo.main_contact,
        support_contact_label: festivalInfo.support_contact_label,
        support_contact: festivalInfo.support_contact,
        lost_found_contact_label: festivalInfo.lost_found_contact_label,
        lost_found_contact: festivalInfo.lost_found_contact,
      });
    }
  }, [festivalInfo]);

  // 저장
  const handleSave = async () => {
    if (!festivalInfo) {
      toast.error('축제 정보를 먼저 불러와주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateFestivalInfo(festivalInfo.id, formData);

      if (result) {
        toast.success('축제 정보가 저장되었습니다!');
        setFestivalInfo(result);
      } else {
        toast.error('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!festivalInfo) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">축제 정보를 불러올 수 없습니다.</p>
          <button
            onClick={loadFestivalInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">축제 정보 관리</h2>
          <p className="text-xs text-gray-500 mt-1">
            사용자 화면의 &quot;정보&quot; 탭에 표시되는 내용을 수정할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* 폼 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 축제 기본 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-blue-600">📌 축제 기본 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  축제 이름
                </label>
                <input
                  type="text"
                  value={formData.festival_name}
                  onChange={(e) => setFormData({ ...formData, festival_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 한양대 ERICA 축제"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  축제 기간
                </label>
                <input
                  type="text"
                  value={formData.festival_dates}
                  onChange={(e) => setFormData({ ...formData, festival_dates: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 2025.11.01 - 11.02"
                />
              </div>
            </div>
          </div>

          {/* 축제 일정 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-blue-600">📅 축제 일정</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    첫째 날 날짜
                  </label>
                  <input
                    type="text"
                    value={formData.day1_date}
                    onChange={(e) => setFormData({ ...formData, day1_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 11월 1일 (토)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    첫째 날 시간
                  </label>
                  <input
                    type="text"
                    value={formData.day1_hours}
                    onChange={(e) => setFormData({ ...formData, day1_hours: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 10:00 - 17:00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    둘째 날 날짜
                  </label>
                  <input
                    type="text"
                    value={formData.day2_date}
                    onChange={(e) => setFormData({ ...formData, day2_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 11월 2일 (일)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    둘째 날 시간
                  </label>
                  <input
                    type="text"
                    value={formData.day2_hours}
                    onChange={(e) => setFormData({ ...formData, day2_hours: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 10:00 - 17:00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 오시는 길 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-blue-600">📍 오시는 길</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  캠퍼스 이름
                </label>
                <input
                  type="text"
                  value={formData.campus_name}
                  onChange={(e) => setFormData({ ...formData, campus_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  지하철 정보
                </label>
                <input
                  type="text"
                  value={formData.subway_info}
                  onChange={(e) => setFormData({ ...formData, subway_info: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 4호선 한대앞역 셔틀버스 이용"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  버스 정보
                </label>
                <input
                  type="text"
                  value={formData.bus_info}
                  onChange={(e) => setFormData({ ...formData, bus_info: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 110, 110-1, 32, 3100번"
                />
              </div>
            </div>
          </div>

          {/* 문의 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-blue-600">📞 문의</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    첫 번째 문의처 이름
                  </label>
                  <input
                    type="text"
                    value={formData.main_contact_label}
                    onChange={(e) => setFormData({ ...formData, main_contact_label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 축제 운영본부"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="text"
                    value={formData.main_contact}
                    onChange={(e) => setFormData({ ...formData, main_contact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 031-400-5114"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    두 번째 문의처 이름
                  </label>
                  <input
                    type="text"
                    value={formData.support_contact_label}
                    onChange={(e) => setFormData({ ...formData, support_contact_label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 학생지원팀"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="text"
                    value={formData.support_contact}
                    onChange={(e) => setFormData({ ...formData, support_contact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 031-400-5115"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    세 번째 문의처 이름
                  </label>
                  <input
                    type="text"
                    value={formData.lost_found_contact_label}
                    onChange={(e) => setFormData({ ...formData, lost_found_contact_label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 분실물센터"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="text"
                    value={formData.lost_found_contact}
                    onChange={(e) => setFormData({ ...formData, lost_found_contact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 031-400-5116"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
