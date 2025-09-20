'use client';

import { useState } from 'react';
import { QrCode, X, Check, Trophy } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { addCheckIn, getTotalPoints, getVisitedBooths } from '@/lib/utils/storage';
import toast from 'react-hot-toast';

interface QRCheckInProps {
  boothId: string;
  boothName: string;
  onClose: () => void;
}

export default function QRCheckIn({ boothId, boothName, onClose }: QRCheckInProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [points] = useState(10); // 기본 포인트

  const handleCheckIn = () => {
    // 실제로는 QR 스캔 후 서버 검증
    setTimeout(() => {
      addCheckIn(boothId, points);
      setIsCheckedIn(true);
      toast.success(`${boothName} 체크인 완료! +${points}P`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  const totalPoints = getTotalPoints();
  const visitedCount = getVisitedBooths().length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">QR 체크인</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isCheckedIn ? (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-center text-sm text-gray-600 mb-4">
                  부스에서 이 QR코드를 스캔해주세요
                </p>
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <QRCodeCanvas
                    value={`festival-checkin:${boothId}:${Date.now()}`}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="text-center text-lg font-semibold mt-4">{boothName}</p>
              </div>

              <button
                onClick={() => {
                  setIsScanning(true);
                  handleCheckIn();
                }}
                disabled={isScanning}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    체크인 중...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    체크인하기
                  </>
                )}
              </button>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">체크인 완료!</h3>
              <p className="text-gray-600 mb-4">+{points} 포인트를 획득했습니다</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">총 포인트</span>
                  <span className="font-semibold">{totalPoints}P</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">방문한 부스</span>
                  <span className="font-semibold">{visitedCount}개</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 리워드 정보 */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>10개 부스 방문 시 특별 기념품 증정!</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}