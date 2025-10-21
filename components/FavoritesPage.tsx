'use client';

import { useState, useEffect } from 'react';
import { Heart, MapPin, Clock, Bell, BellOff } from 'lucide-react';
import { getFavorites, removeFavorite, getBooths } from '@/lib/utils/storage';
import { Booth, Favorite } from '@/lib/types';
import { boothCategoryConfig } from '@/lib/booth-config';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface FavoritesPageProps {
  onBoothSelect: (booth: Booth) => void;
}

export default function FavoritesPage({ onBoothSelect }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteBooths, setFavoriteBooths] = useState<Booth[]>([]);

  useEffect(() => {
    loadFavorites();
    const interval = setInterval(loadFavorites, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadFavorites = () => {
    const favs = getFavorites();
    setFavorites(favs);
    
    const booths = getBooths();
    const favBooths = favs.map(fav => 
      booths.find(b => b.id === fav.boothId)
    ).filter(Boolean) as Booth[];
    
    setFavoriteBooths(favBooths);
  };

  const handleRemoveFavorite = (boothId: string, boothName: string) => {
    removeFavorite(boothId);
    loadFavorites();
    toast.success(`${boothName}을(를) 즐겨찾기에서 제거했습니다`);
  };

  const toggleNotification = (boothId: string) => {
    const fav = favorites.find(f => f.boothId === boothId);
    if (fav) {
      fav.notificationEnabled = !fav.notificationEnabled;
      localStorage.setItem('festival_favorites', JSON.stringify(favorites));
      setFavorites([...favorites]);
      toast.success(fav.notificationEnabled ? '알림을 켰습니다' : '알림을 껐습니다');
    }
  };

  const getCongestionColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very-high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (favoriteBooths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6.5rem)] px-8">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">즐겨찾기가 없습니다</h2>
        <p className="text-sm text-gray-500 text-center">
          관심있는 부스를 즐겨찾기에 추가하고<br />
          빠르게 접근해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] overflow-y-auto pb-4">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-1">즐겨찾기</h1>
        <p className="text-sm text-gray-600 mb-4">{favoriteBooths.length}개의 부스</p>
        
        <div className="space-y-3">
          <AnimatePresence>
            {favoriteBooths.map((booth, index) => {
              const fav = favorites.find(f => f.boothId === booth.id);
              
              return (
                <motion.div
                  key={booth.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => onBoothSelect(booth)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl">
                        {(boothCategoryConfig[booth.category] || boothCategoryConfig.info).icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{booth.name}</h3>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNotification(booth.id);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {fav?.notificationEnabled ? (
                                <Bell className="w-4 h-4 text-blue-500" />
                              ) : (
                                <BellOff className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(booth.id, booth.name);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Heart className="w-4 h-4 text-pink-500 fill-current" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-2">{booth.description}</p>
                        
                        <div className="flex items-center gap-3 text-xs">
                          {booth.congestionLevel && (
                            <span className={`px-2 py-0.5 rounded-full ${getCongestionColor(booth.congestionLevel)}`}>
                              {booth.congestionLevel === 'low' && '여유'}
                              {booth.congestionLevel === 'medium' && '보통'}
                              {booth.congestionLevel === 'high' && '혼잡'}
                              {booth.congestionLevel === 'very-high' && '매우 혼잡'}
                            </span>
                          )}
                          
                          {booth.waitingTime !== undefined && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              {booth.waitingTime > 0 ? `${booth.waitingTime}분` : '대기 없음'}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            지도 보기
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}