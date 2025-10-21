'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, AlertCircle, Info } from 'lucide-react';
import { Announcement, AnnouncementPriority, CreateAnnouncementDto } from '@/lib/types';
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive
} from '@/lib/actions/announcements';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAnnouncementDto>({
    title: '',
    content: '',
    priority: 'normal',
    is_active: true
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getAllAnnouncements();
    setAnnouncements(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('제목과 내용을 입력해주세요');
      return;
    }

    if (editingId) {
      // 수정
      const result = await updateAnnouncement(editingId, formData);
      if (result) {
        toast.success('공지사항이 수정되었습니다');
        resetForm();
        loadAnnouncements();
      } else {
        toast.error('수정에 실패했습니다');
      }
    } else {
      // 생성
      const result = await createAnnouncement(formData);
      if (result) {
        toast.success('공지사항이 등록되었습니다');
        resetForm();
        loadAnnouncements();
      } else {
        toast.error('등록에 실패했습니다');
      }
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      is_active: announcement.is_active
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const success = await deleteAnnouncement(id);
    if (success) {
      toast.success('공지사항이 삭제되었습니다');
      loadAnnouncements();
    } else {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleToggleActive = async (id: string) => {
    const result = await toggleAnnouncementActive(id);
    if (result) {
      toast.success(result.is_active ? '공지사항이 활성화되었습니다' : '공지사항이 비활성화되었습니다');
      loadAnnouncements();
    } else {
      toast.error('상태 변경에 실패했습니다');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      is_active: true
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <Megaphone className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          실시간 공지 관리
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 공지
          </button>
        )}
      </div>

      {/* 공지사항 작성/수정 폼 */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border p-4"
          >
            <h3 className="font-semibold mb-3">{editingId ? '공지사항 수정' : '새 공지사항'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="공지사항 제목"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">내용</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="공지사항 내용"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">우선순위</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as AnnouncementPriority })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">낮음</option>
                  <option value="normal">보통</option>
                  <option value="high">높음</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">즉시 활성화</label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingId ? '수정' : '등록'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 공지사항 목록 */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>등록된 공지사항이 없습니다</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-xl border p-4 ${
                !announcement.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getPriorityIcon(announcement.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority === 'urgent' && '긴급'}
                        {announcement.priority === 'high' && '높음'}
                        {announcement.priority === 'normal' && '보통'}
                        {announcement.priority === 'low' && '낮음'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(announcement.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleToggleActive(announcement.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                    announcement.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {announcement.is_active ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      활성
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      비활성
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleEdit(announcement)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
