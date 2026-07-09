'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Fixed, unobtrusive bottom banner shown only while the browser is offline.
 * Reduced motion is handled globally by MotionConfig, so a plain motion.div
 * is sufficient here.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-lg">
            <WifiOff className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            You’re offline — changes may not be saved
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
