'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnnouncements } from '@/lib/utils/storage';
import { Announcement } from '@/lib/types';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadAnnouncements = () => {
      const loaded = getAnnouncements();
      const priorityOrder = ['urgent', 'high', 'normal', 'low'];
      const sorted = loaded.sort((a, b) => 
        priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      );
      setAnnouncements(sorted);
      setIsVisible(sorted.length > 0);
    };

    loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000); // 5초마다 다음 공지로
      
      return () => clearInterval(timer);
    }
  }, [announcements.length]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const getIcon = () => {
    switch (current.priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getBgColor = () => {
    switch (current.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-600';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-12 left-0 right-0 z-40 ${getBgColor()}`}
        >
          <div className="max-w-[380px] mx-auto px-4 py-3 flex items-center gap-3">
            <div className="text-white">
              {getIcon()}
            </div>
            <div className="flex-1 text-white">
              <p className="text-sm font-medium">{current.title}</p>
              {current.content && (
                <p className="text-xs text-white/80 mt-0.5">{current.content}</p>
              )}
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {announcements.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
              <div 
                className="h-full bg-white/30 transition-all duration-[5000ms]"
                style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}