'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getKnowledgeAnswer } from '@/lib/knowledgeBase';
import ChatMessageContent from './ChatMessageContent';
import { 
  MessageCircle, 
  X, 
  Send, 
  ExternalLink, 
  Headphones,
  CheckCheck,
  Sparkles,
  User
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

const DEFAULT_WELCOME: SupportMessage = {
  id: 'welcome-init',
  user_id: 'system',
  sender_type: 'bot',
  sender_name: 'Asisten AI Virtual',
  message: `Halo Calon ASN! 👋 Selamat datang di Klinik CPNS.

Saya Asisten Virtual AI siap membantu menjawab pertanyaan Anda seputar materi SKD, aturan 30 Days Challenge, sistem anti-curang, passing grade, atau cara aktivasi paket try out.

Ada yang bisa kami bantu hari ini?`,
  is_read_by_admin: true,
  is_read_by_user: true,
  created_at: new Date().toISOString()
};

export default function LiveChatBubble() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([DEFAULT_WELCOME]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Jangan tampilkan bubble chat jika berada di halaman ujian tryout atau panel admin
  const isExamPage = (pathname === '/tryout' || pathname?.startsWith('/tryout/')) && pathname !== '/tryout-list';
  const isAdminPage = pathname?.startsWith('/admin');

  // 1. Cek Sesi User & Profil
  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        setCurrentUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .maybeSingle();
          if (isMounted && profile) setUserProfile(profile);
          fetchMessages(user.id);
        } else {
          setUserProfile(null);
          setMessages([DEFAULT_WELCOME]);
        }
      } catch (err) {
        console.warn('Error saat cek auth user:', err);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!isMounted) return;
      const user = session?.user || null;
      setCurrentUser(user);

      if (user) {
        fetchMessages(user.id);
      } else {
        setUserProfile(null);
        setMessages([DEFAULT_WELCOME]);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Riwayat Pesan dari Supabase jika user sudah login
  const fetchMessages = async (userId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages(data as SupportMessage[]);
        
        // Hitung pesan yang belum dibaca dari admin atau asisten bot
        const unread = data.filter((m: any) => (m.sender_type === 'admin' || m.sender_type === 'bot') && !m.is_read_by_user).length;
        setUnreadCount(unread);
      } else {
        setMessages([DEFAULT_WELCOME]);
      }
    } catch (err) {
      console.warn('Tabel support_messages belum ada atau gagal dimuat:', err);
      setMessages([DEFAULT_WELCOME]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 3. Realtime Listener untuk User yang Login
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
            if (prev.some(m => m.id === newMsg.id || (m.message === newMsg.message && m.sender_type === newMsg.sender_type))) {
              return prev;
            }
            return [...prev, newMsg];
          });

          if (newMsg.sender_type === 'admin' || newMsg.sender_type === 'bot') {
            if (!isOpen) {
              setUnreadCount(prev => prev + 1);
            } else {
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
  }, [messages, isBotTyping, isOpen]);

  // 5. FUNGSI KIRIM PESAN (BERFUNGSI UNTUK MEMBER MAUPUN GUEST)
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || newMessage).trim();
    if (!textToSend || isSending) return;

    setIsSending(true);

    const isMember = Boolean(currentUser?.id);
    const senderName = userProfile?.full_name || currentUser?.email?.split('@')[0] || (isMember ? 'Member' : 'Tamu');

    const tempId = `temp-${Date.now()}`;
    const optimisticUserMessage: SupportMessage = {
      id: tempId,
      user_id: currentUser?.id || 'guest',
      sender_type: 'user',
      sender_name: senderName,
      message: textToSend,
      is_read_by_admin: false,
      is_read_by_user: true,
      created_at: new Date().toISOString()
    };

    // Tampilkan pesan user langsung di layar
    setMessages(prev => [...prev, optimisticUserMessage]);
    if (!customText) setNewMessage('');

    // A. Jika Member, coba simpan ke Supabase support_messages
    if (isMember) {
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .insert([{
            user_id: currentUser.id,
            user_email: currentUser.email,
            user_name: senderName,
            sender_type: 'user',
            sender_name: senderName,
            message: textToSend,
            is_read_by_admin: false,
            is_read_by_user: true
          }])
          .select()
          .maybeSingle();

        if (!error && data) {
          setMessages(prev => prev.map(m => m.id === tempId ? (data as SupportMessage) : m));
        }
      } catch (dbErr) {
        console.warn('Gagal insert ke Supabase, bot tetap akan membalas:', dbErr);
      }
    }

    // B. Pemicu AI Auto-Responder (Knowledge Base & Gemini)
    setIsBotTyping(true);

    try {
      const response = await fetch('/api/chat/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'guest',
          userEmail: currentUser?.email || 'guest@klinikcpns.com',
          userName: senderName,
          message: textToSend
        })
      });

      let botReplyText = '';

      if (response.ok) {
        const data = await response.json();
        botReplyText = data?.reply || '';
      }

      // Jika API belum mengembalikan balasan, gunakan Smart Knowledge Base client-side fallback
      if (!botReplyText) {
        botReplyText = getKnowledgeAnswer(textToSend) || `Halo ${senderName}! Terima kasih atas pertanyaannya.

Pertanyaan Anda mengenai: *"${textToSend}"* telah kami catat.

💡 Untuk informasi cepat seputar passing grade SKD BKN:
• **TWK:** Minimal 65
• **TIU:** Minimal 80
• **TKP:** Minimal 166

Tim Admin kami juga dapat dihubungi via WhatsApp resmi di [+62 851-9965-5534](${WA_ADMIN_URL}) jika Anda memerlukan panduan lebih lanjut.`;
      }

      const botMessage: SupportMessage = {
        id: `bot-${Date.now()}`,
        user_id: currentUser?.id || 'guest',
        sender_type: 'bot',
        sender_name: 'Asisten AI Virtual',
        message: botReplyText,
        is_read_by_admin: true,
        is_read_by_user: true,
        created_at: new Date().toISOString()
      };

      // Tambahkan balasan bot langsung ke state chat secara instan!
      setMessages(prev => {
        if (prev.some(m => m.message === botReplyText && m.sender_type === 'bot')) return prev;
        return [...prev, botMessage];
      });

    } catch (apiErr) {
      console.warn('Error saat memanggil auto-reply API, menggunakan fallback lokal:', apiErr);
      const fallbackReply = getKnowledgeAnswer(textToSend) || `Halo! Terima kasih atas pertanyaannya. Tim kami siap membantu persiapan tes CPNS & P3K Anda. Silakan hubungi WhatsApp Admin di [+62 851-9965-5534](${WA_ADMIN_URL}) untuk respon langsung.`;

      const botMessage: SupportMessage = {
        id: `bot-fallback-${Date.now()}`,
        user_id: currentUser?.id || 'guest',
        sender_type: 'bot',
        sender_name: 'Asisten AI Virtual',
        message: fallbackReply,
        is_read_by_admin: true,
        is_read_by_user: true,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsBotTyping(false);
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

  const isGuest = !currentUser;

  return (
    <>
      {/* FLOATING CHAT BUBBLE BUTTON */}
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
        <button
          onClick={handleToggleOpen}
          aria-label="Buka Live Chat Support"
          className="relative group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer"
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
        <div className="fixed bottom-40 md:bottom-24 right-3 sm:right-6 z-50 w-[92vw] sm:w-[380px] max-h-[68vh] md:max-h-[82vh] h-[520px] md:h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between shadow-md flex-shrink-0">
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
                  AI Auto-Responder & Admin Online
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CALLOUT BANNER GUEST VS MEMBER */}
          {isGuest ? (
            <div className="bg-blue-50/95 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900 flex-shrink-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-blue-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Mode Tamu (AI Assistant Aktif)
                </span>
                <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Tamu</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug mb-2">
                Tanyakan apa saja ke AI kami! Untuk menyimpan riwayat dan chat dengan Admin di sistem:
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/login?mode=register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg text-center transition shadow-sm"
                >
                  🚀 Buat Akun
                </Link>
                <Link
                  href="/login?mode=login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold py-1 px-2.5 rounded-lg border border-slate-300 text-center transition"
                >
                  🔑 Masuk
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between flex-shrink-0">
              <span className="truncate flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">{userProfile?.full_name || currentUser.email}</strong>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                Member
              </span>
            </div>
          )}

          {/* AREA PESAN CHAT */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {isLoadingMessages && messages.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                Memuat percakapan...
              </div>
            )}

            {/* Render Pesan */}
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
                        isBot ? 'bg-amber-500 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'
                      }`}>
                        {isBot ? 'AI' : 'CS'}
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : isBot
                          ? 'bg-amber-50/90 border border-amber-200 text-amber-950 rounded-tl-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                      }`}
                    >
                      {!isUser && (
                        <p className={`font-bold text-[10px] mb-1 flex items-center gap-1 ${isBot ? 'text-amber-800' : 'text-blue-600'}`}>
                          {isBot && <Sparkles className="w-3 h-3 text-amber-600" />}
                          {isAdmin ? 'Admin Klinik CPNS' : 'Asisten AI Virtual'}
                        </p>
                      )}
                      <ChatMessageContent
                        content={msg.message}
                        variant={isUser ? 'user' : isBot ? 'bot' : 'admin'}
                      />
                      <div
                        className={`flex items-center justify-end gap-1 mt-1.5 text-[9px] ${
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
                  <span className="text-[11px] font-medium">Asisten AI sedang menyusun jawaban...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT PILLS */}
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Bagaimana aturan 30 Days CPNS Challenge?')}
              className="text-[10px] whitespace-nowrap bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer"
            >
              🏆 30 Days Challenge
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Berapa passing grade SKD CPNS?')}
              className="text-[10px] whitespace-nowrap bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer"
            >
              📊 Passing Grade
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Bagaimana aturan anti curang selama ujian?')}
              className="text-[10px] whitespace-nowrap bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer"
            >
              🛡️ Anti-Curang
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Bagaimana garansi uang kembali 100%?')}
              className="text-[10px] whitespace-nowrap bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer"
            >
              💰 Garansi 100%
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Bagaimana cara konfirmasi pembayaran QRIS?')}
              className="text-[10px] whitespace-nowrap bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 px-2.5 py-1 rounded-full transition shadow-xs cursor-pointer"
            >
              💳 Bayar QRIS
            </button>
          </div>

          {/* INPUT FORM BAR */}
          <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isGuest ? "Tanya Asisten AI di sini..." : "Ketik pesan untuk Admin / AI..."}
                className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
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

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>Respon instan oleh Smart AI</span>
              <a
                href={WA_ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-0.5 hover:underline"
              >
                <span>WhatsApp Admin</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
