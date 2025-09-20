'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Clock } from 'lucide-react';
import { Booth } from '@/lib/types';
import { boothCategoryConfig, BoothCategory } from '@/lib/booth-config';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchAndFilterProps {
  booths: Booth[];
  onFilter: (filtered: Booth[]) => void;
  onBoothSelect: (booth: Booth) => void;
}

export default function SearchAndFilter({ booths, onFilter, onBoothSelect }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<BoothCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [congestionFilter, setCongestionFilter] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<Booth[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let filtered = booths;

    // 검색어 필터링
    if (searchQuery) {
      filtered = filtered.filter(booth => 
        booth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booth.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booth.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 카테고리 필터링
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(booth => 
        selectedCategories.includes(booth.category)
      );
    }

    // 혼잡도 필터링
    if (congestionFilter !== 'all') {
      filtered = filtered.filter(booth => booth.congestionLevel === congestionFilter);
    }

    // 활성화된 부스만
    filtered = filtered.filter(booth => booth.isActive);

    setSearchResults(filtered);
    onFilter(filtered);
    setShowResults(searchQuery.length > 0);
  }, [searchQuery, selectedCategories, congestionFilter, booths, onFilter]);

  const toggleCategory = (category: BoothCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getCongestionColor = (level?: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'very-high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative z-20">
      {/* 검색 바 */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="부스 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 필터 패널 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg border rounded-b-lg p-4"
          >
            <div className="space-y-3">
              {/* 카테고리 필터 */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">카테고리</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(boothCategoryConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => toggleCategory(key as BoothCategory)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedCategories.includes(key as BoothCategory)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      <span className="mr-1">{config.icon}</span>
                      {config.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 혼잡도 필터 */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">혼잡도</p>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: '전체' },
                    { value: 'low', label: '여유' },
                    { value: 'medium', label: '보통' },
                    { value: 'high', label: '혼잡' },
                    { value: 'very-high', label: '매우 혼잡' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setCongestionFilter(option.value)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        congestionFilter === option.value
                          ? getCongestionColor(option.value === 'all' ? undefined : option.value)
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 결과 */}
      <AnimatePresence>
        {showResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg border rounded-b-lg max-h-64 overflow-y-auto"
          >
            {searchResults.map(booth => (
              <button
                key={booth.id}
                onClick={() => {
                  onBoothSelect(booth);
                  setSearchQuery('');
                  setShowResults(false);
                }}
                className="w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{boothCategoryConfig[booth.category].icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-sm">{booth.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {booth.congestionLevel && (
                        <span className={`px-2 py-0.5 rounded-full ${getCongestionColor(booth.congestionLevel)}`}>
                          {booth.congestionLevel === 'low' && '여유'}
                          {booth.congestionLevel === 'medium' && '보통'}
                          {booth.congestionLevel === 'high' && '혼잡'}
                          {booth.congestionLevel === 'very-high' && '매우 혼잡'}
                        </span>
                      )}
                      {booth.waitingTime && booth.waitingTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booth.waitingTime}분 대기
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <MapPin className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}