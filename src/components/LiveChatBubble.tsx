'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Sparkles, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Headphones,
  CheckCheck
} from 'lucide-react';

interface SupportMessage {
  id: string;
  user_id: string;
  sender_type: 'user' | 'admin' | 'bot';
  sender_name?: string;
  message: string;
  is_read_by_admin: boolean;
  is_read_by_user: boolean;
  created_at: string;
}

const WA_ADMIN_URL = 'https://wa.me/6285199655534?text=Halo%20Admin%20KlinikCPNS,%20saya%20ingin%20bertanya%20seputar%20layanan%20Klinik%20CPNS.';

export default function LiveChatBubble() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Jangan tampilkan bubble chat jika berada di halaman ujian tryout atau panel admin
  const isExamPage = (pathname === '/tryout' || pathname?.startsWith('/tryout/')) && pathname !== '/tryout-list';
  const isAdminPage = pathname?.startsWith('/admin');

  // 1. Cek User & Profil
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        if (profile) setUserProfile(profile);
      } else {
        setUserProfile(null);
        setMessages([]);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setMessages([]);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Riwayat Pesan jika user login
  const fetchMessages = async (userId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as SupportMessage[]);
        
        // Hitung pesan yang belum dibaca dari admin atau asisten bot
        const unread = data.filter((m: any) => (m.sender_type === 'admin' || m.sender_type === 'bot') && !m.is_read_by_user).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Tabel support_messages belum dibuat atau belum ada data:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchMessages(currentUser.id);
    }
  }, [currentUser?.id]);

  // 3. Setup Realtime Subscription untuk Pesan Baru
  useEffect(() => {
    if (!currentUser?.id) return;

    const channelName = `user_chat_${currentUser.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload: any) => {
          const newMsg = payload.new as SupportMessage;
          setMessages(prev => {
            // Hindari duplikasi jika sudah ditambahkan optimistik
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_type === 'admin' || newMsg.sender_type === 'bot') {
            if (!isOpen) {
              setUnreadCount(prev => prev + 1);
            } else {
              // Jika sedang terbuka, langsung tandai telah dibaca
              markMessagesAsRead(currentUser.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, isOpen]);

  // 4. Tandai pesan sebagai dibaca saat chat dibuka
  const markMessagesAsRead = async (userId: string) => {
    try {
      await supabase
        .from('support_messages')
        .update({ is_read_by_user: true })
        .eq('user_id', userId)
        .in('sender_type', ['admin', 'bot'])
        .eq('is_read_by_user', false);

      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && currentUser?.id) {
      markMessagesAsRead(currentUser.id);
    }
  };

  // Scroll otomatis ke pesan terbawah
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 5. Fungsi Kirim Pesan oleh User
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || newMessage.trim();
    if (!textToSend || !currentUser) return;

    setIsSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: SupportMessage = {
      id: tempId,
      user_id: currentUser.id,
      sender_type: 'user',
      sender_name: userProfile?.full_name || currentUser.email?.split('@')[0],
      message: textToSend,
      is_read_by_admin: false,
      is_read_by_user: true,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    if (!customText) setNewMessage('');

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert([{
          user_id: currentUser.id,
          user_email: currentUser.email,
          user_name: userProfile?.full_name || currentUser.email?.split('@')[0],
          sender_type: 'user',
          sender_name: userProfile?.full_name || currentUser.email?.split('@')[0],
          message: textToSend,
          is_read_by_admin: false,
          is_read_by_user: true
        }])
        .select()
        .single();

      if (!error && data) {
        // Ganti ID sementara dengan ID resmi dari database
        setMessages(prev => prev.map(m => m.id === tempId ? (data as SupportMessage) : m));
      }

      // Pemicu AI Auto-Responder (Knowledge Base & Gemini)
      setIsBotTyping(true);
      fetch('/api/chat/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: userProfile?.full_name || currentUser.email?.split('@')[0],
          message: textToSend
        })
      })
      .then(res => res.json())
      .catch(err => console.warn('Auto-reply fetch info:', err))
      .finally(() => {
        setIsBotTyping(false);
      });
    } catch (err) {
      console.error('Gagal mengirim pesan chat:', err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isExamPage || isAdminPage) {
    return null;
  }

  return (
    <>
      {/* FLOATING CHAT BUBBLE BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggleOpen}
          aria-label="Buka Live Chat Support"
          className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform transform rotate-0 hover:rotate-90 duration-200" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 animate-pulse" />
              {/* Badge pesan belum terbaca */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-md animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </>
          )}

          {/* Tooltip Hover saat tertutup */}
          {!isOpen && (
            <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-medium rounded-xl whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
              {currentUser ? 'Tanya Admin / Support' : 'Butuh Bantuan? Chat Kami'}
            </span>
          )}
        </button>
      </div>

      {/* CHAT WINDOW BOX */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-h-[82vh] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold border border-white/30">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Customer Care Klinik CPNS
                </h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  Admin Online • Respon Cepat
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ================= KONDISI 1: SEBELUM LOGIN ================= */}
          {!currentUser ? (
            <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-between bg-gradient-to-b from-slate-50 to-white">
              <div className="space-y-4">
                {/* Greeting Bubble */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                    CS
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-700 shadow-sm space-y-2 leading-relaxed">
                    <p className="font-semibold text-slate-900 text-sm">
                      Halo Calon ASN! 👋
                    </p>
                    <p>
                      Selamat datang di <strong>Klinik CPNS</strong>. Ada yang bisa kami bantu seputar pendaftaran, paket Try Out SKD, atau tantangan 30 Days Challenge?
                    </p>
                  </div>
                </div>

                {/* Callout Info: Buat Akun */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Layanan Live Chat Terhubung ke Admin</span>
                  </div>
                  <p className="text-slate-600 leading-normal">
                    Untuk dapat mengirim pesan pertanyaan dan menerima balasan langsung dari Admin kami di sistem, <strong>silakan buat akun atau masuk terlebih dahulu</strong> agar riwayat percakapan Anda tersimpan aman.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Link
                  href="/login?mode=register"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  🚀 Buat Akun Baru (Gratis)
                </Link>

                <Link
                  href="/login?mode=login"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs border border-slate-300 flex items-center justify-center gap-2 transition-all"
                >
                  🔑 Masuk ke Akun Saya
                </Link>

                <div className="text-center pt-2">
                  <a
                    href={WA_ADMIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>💬 Butuh respon cepat via WhatsApp? Chat Admin</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* ================= KONDISI 2: SETELAH LOGIN (USER AKTIF) ================= */
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
              
              {/* Info Bar User */}
              <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="truncate">
                  Akun: <strong className="text-slate-700">{userProfile?.full_name || currentUser.email}</strong>
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Member
                </span>
              </div>

              {/* Area Pesan Chat */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                
                {/* Initial Welcome Message */}
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    CS
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm text-xs text-slate-700 shadow-sm leading-relaxed">
                    <p className="font-semibold text-slate-800 mb-1">Admin Klinik CPNS</p>
                    Halo! Ada yang bisa kami bantu hari ini? Tuliskan pertanyaan Anda di bawah ini dan Admin kami akan segera membalasnya.
                  </div>
                </div>

                {isLoadingMessages && messages.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Memuat riwayat percakapan...
                  </div>
                )}

                {/* Message Bubbles */}
                {messages.map((msg) => {
                  const isUser = msg.sender_type === 'user';
                  const isAdmin = msg.sender_type === 'admin';
                  const isBot = msg.sender_type === 'bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[85%]">
                        {!isUser && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            isBot ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                          }`}>
                            {isBot ? 'AI' : 'CS'}
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : isBot
                              ? 'bg-amber-50 border border-amber-200 text-amber-950 rounded-tl-sm'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                          }`}
                        >
                          {!isUser && (
                            <p className="font-bold text-[10px] text-blue-600 mb-1">
                              {isAdmin ? 'Admin Klinik CPNS' : 'Asisten AI Virtual'}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isUser ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            <span>{formatTime(msg.created_at)}</span>
                            {isUser && <CheckCheck className="w-3 h-3 text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator Asisten AI */}
                {isBotTyping && (
                  <div className="flex items-end gap-1.5 max-w-[85%] animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-sm">
                      AI
                    </div>
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs flex items-center gap-2 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      <span className="text-[11px] font-medium">Asisten AI sedang memproses jawaban...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Rekomendasi Pertanyaan Cepat (Bila belum ada chat dari user) */}
              {messages.filter(m => m.sender_type === 'user').length === 0 && (
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendMessage(undefined, 'Bagaimana cara mengikuti 30 Days CPNS Challenge?')}
                    className="text-[10px] bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded-full transition-colors"
                  >
                    💡 Info 30 Days Challenge
                  </button>
                  <button
                    onClick={() => handleSendMessage(undefined, 'Bagaimana cara konfirmasi pembayaran atau aktivasi paket?')}
                    className="text-[10px] bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 px-2.5 py-1 rounded-full transition-colors"
                  >
                    💳 Konfirmasi Pembayaran
                  </button>
                </div>
              )}

              {/* INPUT BAR */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pertanyaan Anda di sini..."
                  className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow transition-all cursor-pointer"
                  aria-label="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
