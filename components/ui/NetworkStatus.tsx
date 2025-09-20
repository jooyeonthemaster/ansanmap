'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/useRealtimeData';

export default function NetworkStatus() {
  const isOnline = useNetworkStatus();
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
    } else {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-12 left-0 right-0 z-50 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div className="max-w-[380px] mx-auto px-4 py-2 flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-white" />
                <span className="text-sm text-white">연결됨</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-white" />
                <span className="text-sm text-white">오프라인 - 일부 기능이 제한됩니다</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}