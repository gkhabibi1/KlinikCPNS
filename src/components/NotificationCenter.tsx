'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface NotificationCenterProps {
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationCenter({ onUnreadCountChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    let isMounted = true;
    let channel: any;

    const loadNotifications = async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      if (isMounted) {
        setNotifications(list);

        if (onUnreadCountChange) {
          const unread = list.filter((n: any) => !n.is_read).length;
          onUnreadCountChange(unread);
        }
      }
    };

    const setupNotificationCenter = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        await loadNotifications(user.id);
        if (!isMounted) return;

        const channelName = `notification_center:${user.id}`;
        const existingChannel = supabase.getChannels().find(
          (ch: any) => ch.topic === `realtime:${channelName}` || ch.topic === channelName || ch.name === channelName
        );
        if (existingChannel) {
          await supabase.removeChannel(existingChannel);
        }

        if (!isMounted) return;

        channel = supabase.channel(channelName);
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              if (isMounted) {
                loadNotifications(user.id);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setupNotificationCenter();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications(prev => {
      const next = prev.map((n: any) => (n.id === id ? { ...n, is_read: true } : n));
      if (onUnreadCountChange) {
        onUnreadCountChange(next.filter((n: any) => !n.is_read).length);
      }
      return next;
    });
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => {
      const next = prev.map((n: any) => ({ ...n, is_read: true }));
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
      return next;
    });
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) return;

    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => {
      const next = prev.filter((n: any) => n.id !== id);
      if (onUnreadCountChange) {
        onUnreadCountChange(next.filter((n: any) => !n.is_read).length);
      }
      return next;
    });
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n: any) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⏰';
      case 'error': return '🔒';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';
    switch (type) {
      case 'success': return 'bg-green-50/70 border-green-200 shadow-sm';
      case 'warning': return 'bg-amber-50/70 border-amber-200 shadow-sm';
      case 'error': return 'bg-red-50/70 border-red-200 shadow-sm';
      default: return 'bg-blue-50/70 border-blue-200 shadow-sm';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-slate-500 text-sm font-medium">Memuat notifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            🔔 Pusat Notifikasi
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full animate-pulse">
                {unreadCount} Baru
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0
              ? `Anda memiliki ${unreadCount} notifikasi yang belum dibaca.`
              : 'Semua notifikasi sudah dibaca.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs Filter */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'unread'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* Action Mark All */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* List Notifikasi */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-sm">
          <div className="text-5xl mb-3">🔕</div>
          <p className="text-base font-bold text-slate-700">Tidak Ada Notifikasi</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter === 'unread'
              ? 'Selamat! Anda telah membaca semua notifikasi.'
              : 'Belum ada notifikasi masuk untuk akun Anda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${getNotificationColor(
                notif.type,
                notif.is_read
              )}`}
            >
              <div className="flex items-start gap-3.5">
                <div className="text-2xl flex-shrink-0 pt-0.5 select-none">
                  {getNotificationIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-base font-semibold ${notif.is_read ? 'text-slate-800' : 'text-slate-900'}`}>
                      {notif.title}
                      {!notif.is_read && (
                        <span className="ml-2 inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                      {new Date(notif.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">
                    {notif.message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100/60">
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ✓ Tandai Dibaca
                      </button>
                    )}

                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        Lihat Detail →
                      </Link>
                    )}

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-xs text-slate-400 hover:text-red-600 font-medium ml-auto transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
