'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Phone, Trophy, Award, Users, TrendingUp, Activity } from 'lucide-react';
import { getTotalPoints, getVisitedBooths, getCheckIns } from '@/lib/utils/storage';
import { motion } from 'framer-motion';

export default function InfoPage() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [visitedCount, setVisitedCount] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'rewards'>('info');

  useEffect(() => {
    setTotalPoints(getTotalPoints());
    setVisitedCount(getVisitedBooths().length);
    setCheckInCount(getCheckIns().length);
  }, []);

  const rewards = [
    { points: 50, name: '축제 스티커', claimed: totalPoints >= 50 },
    { points: 100, name: '기념품 에코백', claimed: totalPoints >= 100 },
    { points: 200, name: '축제 티셔츠', claimed: totalPoints >= 200 },
    { points: 300, name: '특별 기념품 세트', claimed: totalPoints >= 300 },
  ];

  const stats = [
    { icon: Trophy, label: '총 포인트', value: `${totalPoints}P`, color: 'text-yellow-500' },
    { icon: MapPin, label: '방문한 부스', value: `${visitedCount}개`, color: 'text-blue-500' },
    { icon: Activity, label: '체크인 횟수', value: `${checkInCount}회`, color: 'text-green-500' },
    { icon: Award, label: '획득 뱃지', value: '3개', color: 'text-purple-500' },
  ];

  return (
    <div className="h-[calc(100vh-6.5rem)] overflow-y-auto bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">안산 사이언스밸리 축제</h1>
        <p className="text-white/80 text-sm">2024.10.25 - 10.27</p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <Users className="w-5 h-5 mb-1" />
            <p className="text-xs opacity-80">현재 방문자</p>
            <p className="text-lg font-bold">1,234명</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-3">
            <TrendingUp className="w-5 h-5 mb-1" />
            <p className="text-xs opacity-80">오늘 방문자</p>
            <p className="text-lg font-bold">5,678명</p>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'info' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            축제 정보
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'stats' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            내 활동
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'rewards' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            리워드
          </button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="p-4">
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                축제 일정
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">10월 25일 (금)</span>
                  <span className="font-medium">17:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">10월 26일 (토)</span>
                  <span className="font-medium">10:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">10월 27일 (일)</span>
                  <span className="font-medium">10:00 - 20:00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                오시는 길
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                경기도 안산시 상록구 광덕1로 375<br />
                안산 문화광장
              </p>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">지하철:</span> 4호선 한대앞역 2번 출구 도보 10분</p>
                <p><span className="font-medium">버스:</span> 10, 10-1, 22, 30번</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                문의
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">축제 운영본부:</span> 031-123-4567</p>
                <p><span className="font-medium">의료지원:</span> 031-123-4568</p>
                <p><span className="font-medium">분실물센터:</span> 031-123-4569</p>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">활동 타임라인</h3>
              <div className="space-y-3">
                {getCheckIns().slice(0, 5).map((checkIn, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">부스 체크인</p>
                      <p className="text-xs text-gray-500">
                        {new Date(checkIn.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-green-600">+{checkIn.points}P</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">내 포인트</h3>
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{totalPoints}P</p>
              <p className="text-xs text-gray-600 mt-1">다음 리워드까지 {Math.max(0, 50 - (totalPoints % 50))}P</p>
              
              <div className="w-full bg-yellow-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((totalPoints % 50) * 2, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${
                    reward.claimed 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{reward.name}</h4>
                      <p className="text-sm text-gray-600">{reward.points} 포인트 필요</p>
                    </div>
                    {reward.claimed ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        교환 가능
                      </div>
                    ) : (
                      <div className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-sm">
                        {reward.points - totalPoints}P 부족
                      </div>
                    )}
                  </div>
                  
                  {reward.claimed && (
                    <button className="w-full mt-3 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors">
                      운영본부에서 수령
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 포인트 획득 방법</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• 부스 체크인: +10P</li>
                <li>• 이벤트 참여: +20P</li>
                <li>• SNS 공유: +5P</li>
                <li>• 스탬프 미션 완료: +50P</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}