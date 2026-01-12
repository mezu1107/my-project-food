// src/features/notifications/components/NotificationCenter.tsx
// FINAL PRODUCTION — JANUARY 12, 2026
// Modern dropdown with admin-specific links, urgent styling, perfect dark mode

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Volume2, VolumeX, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { useNotificationStore, audioManager } from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types/order.types';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'kitchen';

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getStatusColor = (status: OrderStatus, important = false) => {
    const base = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
      pending_payment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
    }[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

    return important ? `${base} border-l-4 border-l-red-500 dark:border-l-red-400` : base;
  };

  const getLinkPath = (notif: any) =>
    isAdmin && notif.orderId ? `/admin/orders/${notif.orderId}` : `/track/${notif.orderId}`;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative" ref={containerRef}>
        {/* Bell Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "relative p-2.5 rounded-full transition-all duration-200",
                "hover:bg-orange-50 dark:hover:bg-orange-950/30",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2",
                "active:scale-95",
                "aria-label='Notifications'"
              )}
            >
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300 transition-transform" />
              {unreadCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white dark:ring-gray-900">
                  {unreadCount() > 99 ? '99+' : unreadCount()}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            Notifications {unreadCount() > 0 ? `(${unreadCount()} unread)` : '(all caught up)'}
          </TooltipContent>
        </Tooltip>

        {/* Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                "absolute right-0 mt-3 w-96 sm:w-[420px] max-h-[85vh]",
                "bg-white dark:bg-gray-900",
                "rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/70",
                "overflow-hidden backdrop-blur-sm z-50"
              )}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white tracking-tight">
                  {isAdmin ? 'Admin Alerts' : 'Notifications'}
                </h3>

                <div className="flex items-center gap-4">
                  {/* Sound Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          audioManager.toggleMute();
                          toast.info(
                            audioManager.getMuted() ? 'Sounds muted' : 'Sounds enabled',
                            { duration: 2000 }
                          );
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label={audioManager.getMuted() ? "Unmute sounds" : "Mute sounds"}
                      >
                        {audioManager.getMuted() ? (
                          <VolumeX className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Volume2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {audioManager.getMuted() ? 'Unmute' : 'Mute'} notification sounds
                    </TooltipContent>
                  </Tooltip>

                  {/* Mark All Read */}
                  {notifications.length > 0 && unreadCount() > 0 && (
                    <button
                      onClick={() => {
                        markAllAsRead();
                        toast.success('All marked as read', { duration: 2000 });
                      }}
                      className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-2">
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    <Bell className="h-16 w-16 mx-auto mb-6 opacity-40" />
                    <p className="text-lg font-medium">
                      {isAdmin ? 'No new alerts' : 'All caught up!'}
                    </p>
                    <p className="text-sm mt-2 opacity-80">
                      {isAdmin
                        ? 'New orders & alerts will appear here'
                        : 'No new notifications at the moment'}
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <Link
                          to={getLinkPath(notif)}
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "group flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
                            "hover:bg-orange-50/60 dark:hover:bg-orange-950/30",
                            !notif.read && "bg-orange-50/40 dark:bg-orange-950/25 border-l-4 border-l-orange-500",
                            notif.important && "border-l-red-500 dark:border-l-red-400",
                            "border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          )}
                        >
                          {/* Status / Alert Icon */}
                          <div className="mt-2">
                            {notif.important ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-orange-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className={cn(
                                  "font-semibold text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors",
                                  notif.important && "text-red-700 dark:text-red-300"
                                )}
                              >
                                {notif.title}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {notif.message}
                            </p>

                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Order #{notif.shortId}
                            </p>
                          </div>

                          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 text-center">
                  <Link
                    to={isAdmin ? '/admin/orders' : '/orders'}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline transition-colors"
                  >
                    {isAdmin ? 'View All Orders' : 'View All Notifications'} →
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}