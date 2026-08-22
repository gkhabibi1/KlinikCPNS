'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import FormattedText from '@/components/FormattedText';

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  subscription_valid_until?: string;
  created_at?: string;
  order_count?: number;
}

interface TryoutPackage {
  id: string;
  name: string;
  description?: string;
  is_premium: boolean;
  is_active?: boolean;
  exam_type?: string;
  show_explanation?: boolean;
  is_challenge?: boolean;
  challenge_day?: number | null;
  created_at?: string;
  question_count?: number;
  question_twk?: number;
  question_tiu?: number;
  question_tkp?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  created_at?: string;
}

interface PromotionalBanner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active?: boolean;
  created_at?: string;
}

interface LatestUpdate {
  id: string;
  title: string;
  category: string;
  content: string;
  published_date: string;
  is_important: boolean;
  display_order?: number;
  created_at?: string;
}

interface VoucherCodeItem {
  code: string;
  type: string;
  value: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
}

// Batas maksimal soal sesuai standar SKD CPNS
const CATEGORY_LIMITS: { [key: string]: number } = {
    TWK: 30,
    TIU: 35,
    TKP: 45
};

export default function AdminCommandCenter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analytics' | 'members' | 'packages' | 'challenge' | 'materials' | 'banners' | 'updates' | 'subscription-packages' | 'transactions' | 'vouchers' | 'blog' | 'resellers'>('analytics');

  // Protect admin route: ensure user is authenticated
  useEffect(() => {
    const verifyUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      }
    };
    verifyUser();
  }, [router]);

  // State Tab 2: Members
  const [members, setMembers] = useState<Profile[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userExamResults, setUserExamResults] = useState<any[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // State untuk 30 Day Challenge
  const [challengeDays, setChallengeDays] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [isSavingChallenge, setIsSavingChallenge] = useState(false);

  // State Tab 3: Paket Try Out
  const [packages, setPackages] = useState<TryoutPackage[]>([]);
  const [packageSearchQuery, setPackageSearchQuery] = useState('');
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    is_premium: true,
    exam_type: 'CPNS',
    show_explanation: true // Tambahkan ini
  });

  // State baru untuk kelola soal
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<any>({
      question_number: 1,
      question_text: '',
      question_image_url: '',
      question_category: 'TWK', // TWK, TIU, atau TKP
      option_a: '',
      option_a_image_url: '',
      option_b: '',
      option_b_image_url: '',
      option_c: '',
      option_c_image_url: '',
      option_d: '',
      option_d_image_url: '',
      option_e: '',
      option_e_image_url: '',
      correct_answer: 'A',
      tkp_score_a: 5, // Untuk soal TKP
      tkp_score_b: 4,
      tkp_score_c: 3,
      tkp_score_d: 2,
      tkp_score_e: 1,
      explanation: ''
  });
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{[key: string]: string}>({});
  const [uploadStatus, setUploadStatus] = useState<{success: boolean, message: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State Tab 4: Pengaturan Harga
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // State Tab 5: Banners
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);

  // State Tab 6: Updates
  const [updates, setUpdates] = useState<LatestUpdate[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);

  // State untuk Materi LMS
  const [materialCategories, setMaterialCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isEditingMaterial, setIsEditingMaterial] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<any>(null);
  const [materialForm, setMaterialForm] = useState({
    category_id: '',
    title: '',
    description: '',
    content: '',
    youtube_url: '',
    thumbnail_url: '',
    reading_time: 5,
    is_premium: false,
    is_published: false
  });

  // Unused tryout package setting states removed
  const [guaranteeFormUrl, setGuaranteeFormUrl] = useState<string>('https://forms.google.com/your-guarantee-form-link');
  const [isSavingGuaranteeUrl, setIsSavingGuaranteeUrl] = useState<boolean>(false);

  const [subscriptionPackages, setSubscriptionPackages] = useState<any[]>([]);
  const [selectedSubPackage, setSelectedSubPackage] = useState<any>(null);
  const [subBenefits, setSubBenefits] = useState<{[key: string]: any[]}>({}); // Object dengan key package_id
  const [newSubBenefit, setNewSubBenefit] = useState('');
  const [showSubPackageModal, setShowSubPackageModal] = useState(false);
  const [showAllBenefitsModal, setShowAllBenefitsModal] = useState(false);
  const [selectedPackageForBenefits, setSelectedPackageForBenefits] = useState<any>(null);
  const [newSubPackage, setNewSubPackage] = useState({
    name: '',
    description: '',
    duration_months: 1,
    price: 0,
    discount_label: ''
  });

  // State untuk Blog
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Umum',
    featured_image: '',
    author_name: '',
    is_published: false
  });

  // State untuk Reseller (REVISI)
  const [resellers, setResellers] = useState<any[]>([]);
  const [showResellerModal, setShowResellerModal] = useState(false);
  const [editingReseller, setEditingReseller] = useState<any>(null);
  const [resellerForm, setResellerForm] = useState({
    email: '',
    password: '',
    full_name: '',
    reseller_code: '',
    token_balance: 0
  });

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBlogPosts(data);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blogForm.title || !blogForm.content) {
      alert('Judul dan konten wajib diisi!');
      return;
    }

    try {
      const blogData = {
        ...blogForm,
        slug: blogForm.slug || blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).substring(2, 8),
        updated_at: new Date().toISOString()
      };

      if (editingBlog) {
        const { error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', editingBlog.id);
        
        if (error) throw error;
        alert('✅ Artikel berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([{ ...blogData, published_at: blogForm.is_published ? new Date().toISOString() : null }]);
        
        if (error) throw error;
        alert('✅ Artikel berhasil dibuat!');
      }

      setShowBlogModal(false);
      setEditingBlog(null);
      setBlogForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Umum',
        featured_image: '',
        author_name: '',
        is_published: false
      });
      fetchBlogPosts();
    } catch (error: any) {
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Hapus artikel ini?')) return;
    
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      alert('✅ Artikel dihapus');
      fetchBlogPosts();
    }
  };

  const handleEditBlog = (post: any) => {
    setEditingBlog(post);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      category: post.category,
      featured_image: post.featured_image || '',
      author_name: post.author_name || '',
      is_published: post.is_published
    });
    setShowBlogModal(true);
  };

  const fetchResellers = async () => {
    const { data, error } = await supabase
      .from('resellers')
      .select(`
        *,
        voucher_codes (id)
      `)
      .order('created_at', { ascending: false });
    
    if (data) {
      // Hitung jumlah voucher per reseller
      const resellersWithCount = data.map((r: any) => ({
        ...r,
        voucher_count: r.voucher_codes?.length || 0
      }));
      setResellers(resellersWithCount);
    }
  };

  const handleSaveReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resellerForm.email || !resellerForm.full_name) {
      alert('Email dan nama wajib diisi!');
      return;
    }

    try {
      // Generate reseller code jika kosong
      const { data: codeData } = await supabase.rpc('generate_reseller_code');
      const finalCode = resellerForm.reseller_code || codeData;

      if (editingReseller) {
        // Update reseller existing
        const { error } = await supabase
          .from('resellers')
          .update({
            full_name: resellerForm.full_name,
            token_balance: resellerForm.token_balance,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReseller.id);
        
        if (error) throw error;
        alert('✅ Reseller berhasil diupdate!');
      } else {
        const res = await fetch('/api/admin/create-reseller', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: resellerForm.email,
            password: resellerForm.password || 'Reseller123!',
            full_name: resellerForm.full_name,
            reseller_code: finalCode,
            token_balance: resellerForm.token_balance
          })
        });

        const resData = await res.json();

        if (!res.ok) {
          throw new Error(resData.message || 'Gagal membuat reseller');
        }

        alert(`✅ Reseller berhasil dibuat!\nKode: ${finalCode}\nEmail: ${resellerForm.email}\nPassword: ${resellerForm.password || 'Reseller123!'}\nToken: ${resellerForm.token_balance}`);
      }

      setShowResellerModal(false);
      setEditingReseller(null);
      setResellerForm({
        email: '',
        password: '',
        full_name: '',
        reseller_code: '',
        token_balance: 0
      });
      fetchResellers();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Gagal menyimpan: ' + error.message);
    }
  };

  const handleDeleteReseller = async (id: string) => {
    if (!confirm('Hapus reseller ini? Semua voucher yang sudah di-generate akan tetap aktif.')) return;
    
    const { error } = await supabase.from('resellers').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      alert('✅ Reseller dihapus');
      fetchResellers();
    }
  };

  const handleEditReseller = (reseller: any) => {
    setEditingReseller(reseller);
    setResellerForm({
      email: reseller.email,
      password: '',
      full_name: reseller.full_name,
      reseller_code: reseller.reseller_code,
      token_balance: reseller.token_balance || 0
    });
    setShowResellerModal(true);
  };

  const handleAddTokens = async (resellerId: string, currentBalance: number, amount: number) => {
    const newBalance = currentBalance + amount;
    
    const { error } = await supabase
      .from('resellers')
      .update({ token_balance: newBalance })
      .eq('id', resellerId);

    if (error) {
      alert('Gagal update token: ' + error.message);
    } else {
      alert(`✅ Berhasil! Token balance sekarang: ${newBalance}`);
      fetchResellers();
    }
  };

  // State untuk Voucher
  const [voucherBatches, setVoucherBatches] = useState<any[]>([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    purpose: '',
    codeType: 'random', // 'custom' atau 'random'
    customCode: '',
    quantity: 1,
    voucherType: 'percent', // 'percent', 'fixed', 'free'
    value: 0,
    maxUses: 1
  });
  const [voucherSearchQuery, setVoucherSearchQuery] = useState('');

  // State untuk Detail Transaksi
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // State untuk Order History Member
  const [selectedMemberOrders, setSelectedMemberOrders] = useState<any[]>([]);
  const [showMemberOrderModal, setShowMemberOrderModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // ================= FUNGSI FETCH DATA =================
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    
    const { data: membersData, error } = await supabase
      .from('profiles')
      .select(`
        *,
        transactions (
          id,
          amount,
          status,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      alert('Gagal memuat member: ' + error.message);
    } else {
      // Hitung jumlah order per member
      const membersWithOrderCount = membersData?.map((member: any) => ({
        ...member,
        order_count: member.transactions?.length || 0
      }));
      
      setMembers(membersWithOrderCount || []);
    }
    
    setIsLoadingMembers(false);
  };

  // Tambahkan fungsi refresh yang bisa dipanggil
  const refreshMembers = () => {
    fetchMembers();
  };

  const fetchUserExamResults = async (userId: string) => {
    setIsLoadingResults(true);
    
    const { data: results, error } = await supabase
      .from('exam_results')
      .select(`
        *,
        tryout_packages (
          name,
          exam_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching results:', error);
      alert('Gagal memuat data nilai');
    } else {
      setUserExamResults(results || []);
    }
    
    setIsLoadingResults(false);
  };

  const fetchChallengeData = async () => {
    // Ambil URL klaim garansi dari system_settings / localStorage
    try {
      const { data: settingData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'guarantee_form_url')
        .single();
      if (settingData?.value) {
        setGuaranteeFormUrl(settingData.value);
      } else {
        const localUrl = localStorage.getItem('guarantee_form_url');
        if (localUrl) setGuaranteeFormUrl(localUrl);
      }
    } catch {
      const localUrl = localStorage.getItem('guarantee_form_url');
      if (localUrl) setGuaranteeFormUrl(localUrl);
    }

    // Ambil konfigurasi challenge
    let { data: days } = await supabase
      .from('challenge_packages')
      .select('*, tryout_packages(id, name, exam_type)')
      .order('day_number', { ascending: true });

    // Jika data challenge kosong atau belum 30 hari, otomatis generate 30 hari
    if (!days || days.length < 30) {
      const existingDays = new Set((days || []).map((d: any) => d.day_number));
      const missingDays = [];
      for (let i = 1; i <= 30; i++) {
        if (!existingDays.has(i)) {
          missingDays.push({ day_number: i, is_active: true });
        }
      }
      if (missingDays.length > 0) {
        await supabase.from('challenge_packages').insert(missingDays);
        const { data: refreshedDays } = await supabase
          .from('challenge_packages')
          .select('*, tryout_packages(id, name, exam_type)')
          .order('day_number', { ascending: true });
        if (refreshedDays) days = refreshedDays;
      }
    }

    if (days) setChallengeDays(days);

    // Ambil semua paket try out yang aktif untuk dropdown
    const { data: pkgs } = await supabase
      .from('tryout_packages')
      .select('id, name, exam_type')
      .eq('is_active', true)
      .order('name');
    
    if (pkgs) setAllPackages(pkgs);
  };

  const handleSaveGuaranteeUrl = async () => {
    if (!guaranteeFormUrl.trim()) {
      alert('URL Form Klaim Garansi tidak boleh kosong');
      return;
    }
    setIsSavingGuaranteeUrl(true);
    try {
      await supabase.from('system_settings').upsert({
        key: 'guarantee_form_url',
        value: guaranteeFormUrl.trim(),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('System settings upsert error, saved to localStorage:', err);
    }
    localStorage.setItem('guarantee_form_url', guaranteeFormUrl.trim());
    setIsSavingGuaranteeUrl(false);
    alert('✅ Link Form Klaim Garansi berhasil disimpan!');
  };

  const fetchPackages = async () => {
    setIsLoadingPackages(true);
    
    // Ambil semua paket
    const { data: pkgData, error } = await supabase
      .from('tryout_packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      alert('Gagal memuat paket: ' + error.message);
    } else {
      // Ambil info challenge untuk semua paket
      const { data: challengeData } = await supabase
        .from('challenge_packages')
        .select('package_id, day_number')
        .eq('is_active', true);
      
      // Ambil seluruh soal dengan pagination untuk mengatasi batas 1000 baris Supabase
      let allQData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: pageData, error: qErr } = await supabase
          .from('questions')
          .select('id, package_id, question_category')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (qErr || !pageData || pageData.length === 0) {
          hasMore = false;
        } else {
          allQData = allQData.concat(pageData);
          if (pageData.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // Map challenge data ke object untuk lookup cepat
      const challengeMap: { [key: string]: number } = {};
      challengeData?.forEach((c: any) => {
        if (c.package_id) {
          challengeMap[c.package_id] = c.day_number;
        }
      });

      // Hitung jumlah soal total dan per kategori untuk setiap package_id
      const questionStats: { [key: string]: { total: number; twk: number; tiu: number; tkp: number } } = {};
      allQData.forEach((q: any) => {
        if (!q.package_id) return;
        if (!questionStats[q.package_id]) {
          questionStats[q.package_id] = { total: 0, twk: 0, tiu: 0, tkp: 0 };
        }
        questionStats[q.package_id].total++;
        const cat = (q.question_category || '').toString().trim().toUpperCase();
        if (cat === 'TWK') questionStats[q.package_id].twk++;
        else if (cat === 'TIU') questionStats[q.package_id].tiu++;
        else if (cat === 'TKP') questionStats[q.package_id].tkp++;
      });
      
      // Tambahkan info challenge & statistik soal ke setiap paket
      const packagesWithStats = (pkgData || []).map((pkg: any) => ({
        ...pkg,
        is_challenge: !!challengeMap[pkg.id],
        challenge_day: challengeMap[pkg.id] || null,
        question_count: questionStats[pkg.id]?.total || 0,
        question_twk: questionStats[pkg.id]?.twk || 0,
        question_tiu: questionStats[pkg.id]?.tiu || 0,
        question_tkp: questionStats[pkg.id]?.tkp || 0
      }));
      
      setPackages(packagesWithStats);
    }
    
    setIsLoadingPackages(false);
  };

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    const { data, error } = await supabase.from('subscription_plans').select('*').order('duration_months', { ascending: true });
    if (data) setPlans(data);
    if (error) console.error("Error fetching plans:", error);
    setIsLoadingPlans(false);
  };

  const fetchVoucherBatches = async () => {
    const { data, error } = await supabase
      .from('voucher_batches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setVoucherBatches(data);
  };

  const generateRandomCode = () => {
    const part1 = Math.random().toString(36).substring(2, 7).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${part1}-${part2}`; // Contoh: TDH45-HFTD7
  };

  const handleGenerateVouchers = async () => {
    if (!voucherForm.purpose) return alert('Keperluan wajib diisi!');
    if (voucherForm.codeType === 'custom' && !voucherForm.customCode) return alert('Kode custom wajib diisi!');
    if (voucherForm.codeType === 'random' && (voucherForm.quantity < 1 || voucherForm.quantity > 200)) {
      return alert('Jumlah generate random harus antara 1 - 200');
    }
    if (voucherForm.value <= 0 && voucherForm.voucherType !== 'free') return alert('Nilai voucher harus > 0');

    setIsGenerating(true);

    try {
      // 1. Buat Batch Record
      const qty = voucherForm.codeType === 'custom' ? 1 : voucherForm.quantity;
      const { data: batch, error: batchError } = await supabase
        .from('voucher_batches')
        .insert([{ purpose: voucherForm.purpose, quantity: qty }])
        .select()
        .single();

      if (batchError) throw batchError;

      // 2. Generate Codes
      const codesToInsert = [];
      for (let i = 0; i < qty; i++) {
        const finalCode = voucherForm.codeType === 'custom' 
          ? voucherForm.customCode.toUpperCase() 
          : generateRandomCode();

        codesToInsert.push({
          batch_id: batch.id,
          code: finalCode,
          type: voucherForm.voucherType,
          value: voucherForm.voucherType === 'free' ? 0 : voucherForm.value,
          max_uses: voucherForm.maxUses,
          current_uses: 0,
          is_active: true
        });
      }

      // 3. Insert Codes ke Database
      const { error: codesError } = await supabase
        .from('voucher_codes')
        .insert(codesToInsert);

      if (codesError) throw codesError;

      alert(`✅ Berhasil generate ${qty} kode voucher!`);
      setShowGenerateModal(false);
      setVoucherForm({ purpose: '', codeType: 'random', customCode: '', quantity: 1, voucherType: 'percent', value: 0, maxUses: 1 });
      fetchVoucherBatches();
    } catch (err: any) {
      alert('Gagal generate: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBatchCSV = async (batchId: string, purpose: string) => {
    const { data: codes, error } = await supabase
      .from('voucher_codes')
      .select('code, type, value, max_uses, current_uses, is_active')
      .eq('batch_id', batchId);

    if (error || !codes) return alert('Gagal mengambil data');

    // Convert to CSV
    const headers = ['Kode Voucher', 'Tipe', 'Nilai', 'Maksimal Pakai', 'Sudah Dipakai', 'Status'];
    const rows = (codes as VoucherCodeItem[]).map((c) => [
      c.code,
      c.type === 'percent' ? `${c.value}%` : c.type === 'fixed' ? `Rp${c.value}` : 'Gratis',
      c.max_uses,
      c.current_uses,
      c.is_active ? 'Aktif' : 'Nonaktif'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Voucher_${purpose.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Legacy tryout pricing and checkout configuration handlers removed

  const fetchSubscriptionPackages = async () => {
    const { data: packages } = await supabase
      .from('subscription_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (packages) {
      setSubscriptionPackages(packages);
      
      // Fetch benefit untuk SEMUA paket sekaligus
      const benefitsMap: {[key: string]: any[]} = {};
      
      for (const pkg of packages) {
        const { data: benefits } = await supabase
          .from('subscription_benefits')
          .select('*')
          .eq('package_id', pkg.id)
          .eq('is_active', true)
          .order('display_order');
        
        if (benefits) {
          benefitsMap[pkg.id] = benefits;
        }
      }
      
      setSubBenefits(benefitsMap);
    }
  };

  const fetchSubPackageDetails = async (packageId: string) => {
    const { data: benefits } = await supabase
      .from('subscription_benefits')
      .select('*')
      .eq('package_id', packageId)
      .eq('is_active', true)
      .order('display_order');
    
    if (benefits) {
      setSubBenefits(prev => ({
        ...prev,
        [packageId]: benefits
      }));
    }
  };

  const addSubPackage = async () => {
    if (!newSubPackage.name.trim() || !newSubPackage.price) {
      alert('Nama paket dan harga wajib diisi!');
      return;
    }

    const { error } = await supabase
      .from('subscription_packages')
      .insert([{
        name: newSubPackage.name,
        description: newSubPackage.description,
        duration_months: newSubPackage.duration_months,
        price: newSubPackage.price,
        discount_label: newSubPackage.discount_label || null,
        display_order: subscriptionPackages.length + 1
      }]);

    if (error) {
      alert('Gagal menambah paket: ' + error.message);
    } else {
      alert('✅ Paket berhasil ditambahkan!');
      setNewSubPackage({
        name: '',
        description: '',
        duration_months: 1,
        price: 0,
        discount_label: ''
      });
      setShowSubPackageModal(false);
      fetchSubscriptionPackages();
    }
  };

  const updateSubPackage = async (packageId: string, field: string, value: any) => {
    const { error } = await supabase
      .from('subscription_packages')
      .update({ [field]: value })
      .eq('id', packageId);

    if (error) {
      alert('Gagal update: ' + error.message);
    } else {
      fetchSubscriptionPackages();
    }
  };

  const deleteSubPackage = async (packageId: string, packageName: string) => {
    // Konfirmasi sebelum menghapus
    if (!confirm(`Apakah Anda yakin ingin menghapus "${packageName}"?\n\nSemua benefit yang terkait juga akan dihapus.`)) {
      return;
    }

    try {
      // 1. Hapus benefit yang terkait (cascade delete seharusnya otomatis)
      const { error: benefitsError } = await supabase
        .from('subscription_benefits')
        .delete()
        .eq('package_id', packageId);

      if (benefitsError) {
        console.error('Error deleting benefits:', benefitsError);
      }

      // 2. Hapus pricing yang terkait
      const { error: pricingError } = await supabase
        .from('subscription_pricing')
        .delete()
        .eq('package_id', packageId);

      if (pricingError) {
        console.error('Error deleting pricing:', pricingError);
      }

      // 3. Hapus paket
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', packageId);

      if (error) {
        alert('Gagal menghapus paket: ' + error.message);
      } else {
        alert('✅ Paket berhasil dihapus!');
        fetchSubscriptionPackages();
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Terjadi kesalahan saat menghapus paket');
    }
  };

  const addSubBenefit = async (packageId: string) => {
    if (!newSubBenefit.trim()) return;

    const { data: newBenefit, error } = await supabase
      .from('subscription_benefits')
      .insert([{
        package_id: packageId,
        benefit_text: newSubBenefit,
        display_order: (subBenefits[packageId]?.length || 0) + 1
      }])
      .select()
      .single();

    if (error) {
      alert('Gagal menambah benefit: ' + error.message);
    } else {
      setNewSubBenefit('');
      // Update state dengan benefit baru
      setSubBenefits(prev => ({
        ...prev,
        [packageId]: [...(prev[packageId] || []), newBenefit]
      }));
    }
  };

  const updateSubBenefit = async (packageId: string, benefitId: string, newText: string) => {
    const { error } = await supabase
      .from('subscription_benefits')
      .update({ benefit_text: newText })
      .eq('id', benefitId);

    if (error) {
      alert('Gagal update benefit: ' + error.message);
    } else {
      // Update state lokal
      setSubBenefits(prev => ({
        ...prev,
        [packageId]: prev[packageId]?.map(b => 
          b.id === benefitId ? { ...b, benefit_text: newText } : b
        ) || []
      }));
    }
  };

  const deleteSubBenefit = async (packageId: string, benefitId: string) => {
    const { error } = await supabase
      .from('subscription_benefits')
      .delete()
      .eq('id', benefitId);

    if (error) {
      alert('Gagal hapus benefit: ' + error.message);
    } else {
      // Update state lokal
      setSubBenefits(prev => ({
        ...prev,
        [packageId]: prev[packageId]?.filter(b => b.id !== benefitId) || []
      }));
    }
  };

  const fetchBanners = async () => {
    setIsLoadingBanners(true);
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setBanners(data);
      if (error && error.code !== 'PGRST205' && !error.message?.includes('Could not find the table')) {
        console.error("Error fetching banners:", error.message || error);
      }
    } catch {
      // Table may not exist in database schema yet
    } finally {
      setIsLoadingBanners(false);
    }
  };

  const fetchUpdates = async () => {
    setIsLoadingUpdates(true);
    try {
      const { data, error } = await supabase
        .from('latest_updates')
        .select('*')
        .order('published_date', { ascending: false });
      if (data) setUpdates(data);
      if (error && error.code !== 'PGRST205' && !error.message?.includes('Could not find the table')) {
        console.error("Error fetching updates:", error.message || error);
      }
    } catch {
      // Table may not exist in database schema yet
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  // Fetch materi
  const fetchMaterials = async () => {
    try {
      const { data: categories, error: catError } = await supabase
        .from('material_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (catError) console.error("Error fetching categories:", catError);
      if (categories) setMaterialCategories(categories);

      const { data: mats, error: matError } = await supabase
        .from('materials')
        .select('*, material_categories(name)')
        .order('created_at', { ascending: false });
      
      if (matError) console.error("Error fetching materials:", matError);
      if (mats) setMaterials(mats);
    } catch (err) {
      console.error("Error in fetchMaterials:", err);
    }
  };

  // Save materi
  const saveMaterial = async () => {
    if (!materialForm.title || !materialForm.category_id) {
      alert('Judul dan kategori wajib diisi!');
      return;
    }

    // Generate slug dari title
    const slug = materialForm.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const materialData = {
      ...materialForm,
      slug,
      updated_at: new Date().toISOString()
    };

    let error;
    if (currentMaterial?.id) {
      // Update
      ({ error } = await supabase
        .from('materials')
        .update(materialData)
        .eq('id', currentMaterial.id));
    } else {
      // Insert
      ({ error } = await supabase
        .from('materials')
        .insert([materialData]));
    }

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      alert('✅ Materi berhasil disimpan!');
      setIsEditingMaterial(false);
      setCurrentMaterial(null);
      setMaterialForm({
        category_id: '',
        title: '',
        description: '',
        content: '',
        youtube_url: '',
        thumbnail_url: '',
        reading_time: 5,
        is_premium: false,
        is_published: false
      });
      fetchMaterials();
    }
  };

  // Delete materi
  const deleteMaterial = async (id: string) => {
    if (!confirm('Hapus materi ini?')) return;
    
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      alert('✅ Materi dihapus!');
      fetchMaterials();
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    
    let query = supabase
      .from('transactions')
      .select(`
        *,
        subscription_packages(name),
        profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (transactionFilter !== 'all') {
      query = query.eq('status', transactionFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }

    setIsLoadingTransactions(false);
  };

  const fetchMemberOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        subscription_packages(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      alert('Gagal memuat riwayat order: ' + error.message);
    } else {
      setSelectedMemberOrders(data || []);
    }
  };

  // Fungsi untuk menghitung ulang masa aktif subscription member secara akurat berdasarkan riwayat transaksi PAID
  const recalculateMemberSubscription = async (userId: string) => {
    if (!userId) return;

    // Ambil seluruh transaksi PAID/SUCCESS milik member
    const { data: userTxs, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user transactions:', error);
      return;
    }

    const validPaidTxs = (userTxs || []).filter((tx: any) =>
      ['paid', 'success', 'settlement'].includes((tx.status || '').toLowerCase())
    );

    // Jika tidak ada transaksi PAID yang tersisa (misal diubah ke failed/expired/cancel)
    if (validPaidTxs.length === 0) {
      await supabase
        .from('profiles')
        .update({
          subscription_valid_until: null,
          subscription_package_id: null
        })
        .eq('id', userId);
      return;
    }

    // Hitung akumulasi tanggal berlaku dari seluruh transaksi PAID
    let validUntil: Date | null = null;
    let lastPackageId: string | null = null;

    for (const tx of validPaidTxs) {
      const txDate = new Date(tx.created_at || Date.now());
      if (!validUntil || validUntil < txDate) {
        validUntil = new Date(txDate);
      }

      const duration = tx.duration || 1;
      if (duration === 999) {
        validUntil.setFullYear(2099);
      } else {
        validUntil.setMonth(validUntil.getMonth() + duration);
      }

      if (tx.package_id) {
        lastPackageId = tx.package_id;
      }
    }

    await supabase
      .from('profiles')
      .update({
        subscription_valid_until: validUntil ? validUntil.toISOString() : null,
        subscription_package_id: lastPackageId
      })
      .eq('id', userId);
  };

  const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
    const finalStatus = newStatus.toLowerCase();

    const { data: tx, error: updateTxErr } = await supabase
      .from('transactions')
      .update({ 
        status: finalStatus,
        paid_at: ['paid', 'success'].includes(finalStatus) ? new Date().toISOString() : null
      })
      .eq('id', transactionId)
      .select('user_id, duration, package_id')
      .single();

    if (updateTxErr) {
      alert('Gagal update status: ' + updateTxErr.message);
      return;
    }

    // Recalculate member subscription status
    if (tx?.user_id) {
      await recalculateMemberSubscription(tx.user_id);
    }

    alert('✅ Status transaksi & profil member berhasil diperbarui!');
    fetchTransactions();
    if (activeTab === 'members') fetchMembers();
    setShowTransactionModal(false);
  };

  const syncAllMemberSubscriptions = async () => {
    try {
      const { data: allProfiles, error: profErr } = await supabase
        .from('profiles')
        .select('id');

      if (profErr) {
        alert('Gagal mengambil data member: ' + profErr.message);
        return;
      }

      let updatedCount = 0;
      for (const p of allProfiles || []) {
        await recalculateMemberSubscription(p.id);
        updatedCount++;
      }

      alert(`✅ Berhasil mensinkronkan ${updatedCount} akun member dengan data transaksi terbaru!`);
      fetchMembers();
      fetchTransactions();
    } catch (err: any) {
      alert('Error sync: ' + err.message);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  // Pemicu Fetch Data
  useEffect(() => {
    if (activeTab === 'members') fetchMembers();
    if (activeTab === 'packages') fetchPackages();
    if (activeTab === 'banners') fetchBanners();
    if (activeTab === 'updates') fetchUpdates();
    if (activeTab === 'materials') fetchMaterials();
    if (activeTab === 'subscription-packages') fetchSubscriptionPackages();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'resellers') fetchResellers();
  }, [activeTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Fungsi untuk fetch questions
  const fetchQuestions = async (packageId: string) => {
      setIsLoadingQuestions(true);
      const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('package_id', packageId)
          .order('question_number', { ascending: true });
      
      if (data) setQuestions(data);
      setIsLoadingQuestions(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Fungsi upload image ke Supabase Storage
  const handleImageUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
      fieldType: string
  ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingImage(fieldType);

      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { data, error } = await supabase
              .storage
              .from('question-images')
              .upload(fileName, file, {
                  cacheControl: '3600',
                  upsert: false
              });

          if (error) throw error;

          // Dapatkan public URL
          const { data: { publicUrl } } = supabase
              .storage
              .from('question-images')
              .getPublicUrl(fileName);

          // Update state newQuestion
          setNewQuestion({
              ...newQuestion,
              [fieldType]: publicUrl
          });

          // Preview image
          setImagePreview({
              ...imagePreview,
              [fieldType]: publicUrl
          });

          alert('✅ Gambar berhasil diupload!');
      } catch (error: any) {
          alert('Gagal upload: ' + error.message);
      } finally {
          setUploadingImage(null);
      }
  };

  // Fungsi hapus image
  const removeImage = (fieldType: string) => {
      setNewQuestion({
          ...newQuestion,
          [fieldType]: ''
      });
      const newPreview = { ...imagePreview };
      delete newPreview[fieldType];
      setImagePreview(newPreview);
  };

  // Fungsi untuk menambah soal
  const handleAddQuestion = async(e: React.FormEvent)=>{
      e.preventDefault();
      if(!editingPackage) return;
      
      // VALIDASI BATAS SOAL
      const currentCount = questions.filter(q => q.question_category === newQuestion.question_category).length;
      if (currentCount >= CATEGORY_LIMITS[newQuestion.question_category]) {
          alert(`Batas soal ${newQuestion.question_category} sudah tercapai (${CATEGORY_LIMITS[newQuestion.question_category]} soal)!`);
          return;
      }
      
      const{ error }= await supabase
          .from('questions')
          .insert([{
              package_id: editingPackage.id,
              question_number: newQuestion.question_number,
              question_text: newQuestion.question_text,
              question_image_url: newQuestion.question_image_url || null,
              question_category: newQuestion.question_category,
              option_a: newQuestion.option_a,
              option_a_image_url: newQuestion.option_a_image_url || null,
              option_b: newQuestion.option_b,
              option_b_image_url: newQuestion.option_b_image_url || null,
              option_c: newQuestion.option_c,
              option_c_image_url: newQuestion.option_c_image_url || null,
              option_d: newQuestion.option_d,
              option_d_image_url: newQuestion.option_d_image_url || null,
              option_e: newQuestion.option_e,
              option_e_image_url: newQuestion.option_e_image_url || null,
              correct_answer: newQuestion.correct_answer,
              // Simpan bobot TKP di kolom explanation atau kolom terpisah
              explanation: newQuestion.question_category === 'TKP' 
                  ? JSON.stringify({
                      a: newQuestion.tkp_score_a,
                      b: newQuestion.tkp_score_b,
                      c: newQuestion.tkp_score_c,
                      d: newQuestion.tkp_score_d,
                      e: newQuestion.tkp_score_e
                  })
                  : newQuestion.explanation,
          }]);
      
      if(!error){
          alert('✅ Soal berhasil ditambahkan!');
          // Reset form
          setNewQuestion({
              question_number: questions.length + 1,
              question_text:'',
              question_image_url:'',
              question_category:'TWK',
              option_a:'',
              option_a_image_url:'',
              option_b:'',
              option_b_image_url:'',
              option_c:'',
              option_c_image_url:'',
              option_d:'',
              option_d_image_url:'',
              option_e:'',
              option_e_image_url:'',
              correct_answer:'A',
              tkp_score_a: 5,
              tkp_score_b: 4,
              tkp_score_c: 3,
              tkp_score_d: 2,
              tkp_score_e: 1,
              explanation:''
          });
          fetchQuestions(editingPackage.id);
          fetchPackages();
      }else{
          alert('Error: '+ error.message);
      }
  };

  // Fungsi untuk hapus soal
  const handleDeleteQuestion = async (questionId: string) => {
      if (!confirm('Hapus soal ini?')) return;
      
      const { error } = await supabase
          .from('questions')
          .delete()
          .eq('id', questionId);
      
      if (!error) {
          alert('✅ Soal dihapus');
          if (editingPackage) {
            fetchQuestions(editingPackage.id);
            fetchPackages();
          }
      }
  };

  // Fungsi parse file TXT
  const handleFileUpload = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const text = await file.text();
      const questionsData = parseQuestionsFromText(text);

      if (questionsData.length === 0) {
        throw new Error('Tidak ada soal yang valid ditemukan. Pastikan format TXT menggunakan pemisah "---" dan format baris (TYPE:, NUMBER:, QUESTION:, A:, B:, C:, D:, E:, CORRECT:)');
      }

      // Insert semua soal ke database
      let successCount = 0;
      let lastErrorMessage = '';
      for (const q of questionsData) {
        const payload: any = {
          package_id: editingPackage.id,
          question_number: q.number,
          question_text: q.question,
          question_category: q.type || 'TWK',
          option_a: q.options.a || '',
          option_b: q.options.b || '',
          option_c: q.options.c || '',
          option_d: q.options.d || '',
          option_e: q.options.e || '',
          correct_answer: q.correct || 'A',
          explanation: q.explanation || ''
        };

        if (q.type === 'TKP') {
          payload.explanation = JSON.stringify({
            a: q.scores?.a || 1,
            b: q.scores?.b || 2,
            c: q.scores?.c || 3,
            d: q.scores?.d || 4,
            e: q.scores?.e || 5
          });
        }

        const { error } = await supabase
          .from('questions')
          .insert([payload]);

        if (error) {
          console.error('Error inserting question:', error);
          lastErrorMessage = error.message;
        } else {
          successCount++;
        }
      }

      if (successCount === 0 && questionsData.length > 0) {
        throw new Error(`Gagal menyimpan soal ke database: ${lastErrorMessage}`);
      }

      setUploadStatus({
        success: true,
        message: `✅ Berhasil mengupload ${successCount} dari ${questionsData.length} soal`
      });

      // Refresh daftar soal & statistik paket
      fetchQuestions(editingPackage.id);
      fetchPackages();

    } catch (error: any) {
      setUploadStatus({
        success: false,
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setIsUploading(false);
      // Reset input file
      e.target.value = '';
    }
  };

  // Fungsi parser TXT ke array soal (Mendukung Multi-line, LaTeX, dan HTML)
  const parseQuestionsFromText = (text: string) => {
    const questionsList: any[] = [];
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalizedText.split(/---+\n?/).filter(block => block.trim());

    for (let bIndex = 0; bIndex < blocks.length; bIndex++) {
      const block = blocks[bIndex];
      const lines = block.split('\n');
      const question: any = {
        type: 'TWK',
        number: null,
        question: '',
        correct: '',
        explanation: '',
        options: {},
        scores: { a: 1, b: 2, c: 3, d: 4, e: 5 }
      };

      let currentField: string | null = null;

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trim();

        if (!line && !currentField) continue;

        if (/^TYPE:\s*/i.test(line)) {
          question.type = line.replace(/^TYPE:\s*/i, '').trim().toUpperCase();
          currentField = null;
        } else if (/^NUMBER:\s*/i.test(line)) {
          const num = parseInt(line.replace(/^NUMBER:\s*/i, '').trim());
          if (!isNaN(num)) question.number = num;
          currentField = null;
        } else if (/^QUESTION:\s*/i.test(line)) {
          question.question = rawLine.replace(/^\s*QUESTION:\s*/i, '');
          currentField = 'question';
        } else if (/^CORRECT:\s*/i.test(line)) {
          question.correct = line.replace(/^CORRECT:\s*/i, '').trim().toUpperCase();
          currentField = null;
        } else if (/^EXPLANATION:\s*/i.test(line)) {
          question.explanation = rawLine.replace(/^\s*EXPLANATION:\s*/i, '');
          currentField = 'explanation';
        } else if (/^([A-E])[:\.\)]\s*/i.test(line)) {
          const match = rawLine.match(/^\s*([A-E])[:\.\)]\s*(.*)$/i);
          if (match) {
            const optKey = match[1].toLowerCase();
            question.options[optKey] = match[2];
            currentField = `option_${optKey}`;
          }
        } else if (/^SCORE_([A-E]):\s*/i.test(line)) {
          const match = line.match(/^SCORE_([A-E]):\s*(\d+)/i);
          if (match) {
            const optKey = match[1].toLowerCase();
            question.scores[optKey] = parseInt(match[2]);
          }
          currentField = null;
        } else {
          // Lanjutan multi-line untuk question, explanation, atau options
          if (currentField === 'question') {
            question.question += (question.question ? '\n' : '') + rawLine;
          } else if (currentField === 'explanation') {
            question.explanation += (question.explanation ? '\n' : '') + rawLine;
          } else if (currentField && currentField.startsWith('option_')) {
            const optKey = currentField.replace('option_', '');
            question.options[optKey] += (question.options[optKey] ? '\n' : '') + rawLine;
          }
        }
      }

      if (!question.number) question.number = bIndex + 1;

      question.question = (question.question || '').trim();
      question.explanation = (question.explanation || '').trim();
      for (const key of ['a', 'b', 'c', 'd', 'e']) {
        if (question.options[key] !== undefined) {
          question.options[key] = question.options[key].trim();
        }
      }

      // Jawaban terbaik untuk TKP jika tidak ditulis CORRECT
      if (question.type === 'TKP' && !question.correct) {
        let maxScore = -1;
        let bestOpt = 'A';
        for (const opt of ['a', 'b', 'c', 'd', 'e']) {
          if ((question.scores[opt] || 0) > maxScore) {
            maxScore = question.scores[opt];
            bestOpt = opt.toUpperCase();
          }
        }
        question.correct = bestOpt;
      }

      const optA = question.options.a !== undefined ? question.options.a : question.options.A;
      const optB = question.options.b !== undefined ? question.options.b : question.options.B;

      if (question.question && optA !== undefined && optB !== undefined) {
        question.options.a = optA || '';
        question.options.b = optB || '';
        question.options.c = question.options.c || question.options.C || '';
        question.options.d = question.options.d || question.options.D || '';
        question.options.e = question.options.e || question.options.E || '';
        if (!question.correct) question.correct = 'A';

        questionsList.push(question);
      }
    }

    return questionsList;
  };

  // Update fungsi handleCreatePackage untuk auto-set question_number
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    const { error } = await supabase
      .from('tryout_packages')
      .insert([{
        name: newPackage.name,
        description: newPackage.description,
        is_premium: newPackage.is_premium,
        exam_type: newPackage.exam_type,
        show_explanation: newPackage.show_explanation !== false // Default true
      }]);
    
    if (error) {
      alert("Gagal membuat paket: " + error.message);
    } else {
      alert("✅ Paket Try Out berhasil dibuat!");
      setNewPackage({ 
        name: '', 
        description: '', 
        is_premium: true,
        exam_type: 'CPNS',
        show_explanation: true // Reset ke default
      });
      fetchPackages();
    }
    setIsCreating(false);
  };

  // Fungsi menangani ketikan angka di input harga
  const handlePriceChange = (id: string, newPrice: string) => {
    setPlans(plans.map(plan => plan.id === id ? { ...plan, price: Number(newPrice) } : plan));
  };

  // Fungsi menyimpan harga baru ke Database
  const savePrice = async (id: string, newPrice: number) => {
    setSavingId(id);
    const { error } = await supabase.from('subscription_plans').update({ price: newPrice }).eq('id', id);
    if (error) {
      alert("Gagal menyimpan harga: " + error.message);
    } else {
      alert("✅ Harga berhasil diperbarui!");
    }
    setSavingId(null);
  };

  // Fungsi untuk banner
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const { error } = await supabase.from('promotional_banners').insert([{
      title: formData.get('title') as string,
      image_url: formData.get('image_url') as string,
      link_url: formData.get('link_url') as string || null,
      display_order: parseInt(formData.get('display_order') as string || '0', 10),
      is_active: true
    }]);
    
    if (error) {
      alert('Gagal menambahkan banner: ' + error.message);
    } else {
      alert('✅ Banner berhasil ditambahkan');
      fetchBanners();
      form.reset();
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return;
    const { error } = await supabase.from('promotional_banners').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus banner: ' + error.message);
    } else {
      fetchBanners();
    }
  };

  // Fungsi untuk updates
  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const { error } = await supabase.from('latest_updates').insert([{
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      content: formData.get('content') as string,
      published_date: formData.get('published_date') as string,
      is_important: formData.get('is_important') === 'on'
    }]);
    
    if (error) {
      alert('Gagal menambahkan info: ' + error.message);
    } else {
      alert('✅ Info berhasil ditambahkan');
      fetchUpdates();
      form.reset();
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    if (!confirm('Hapus info ini?')) return;
    const { error } = await supabase.from('latest_updates').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus info: ' + error.message);
    } else {
      fetchUpdates();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* ================= SIDEBAR ADMIN ================= */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="font-extrabold text-xl tracking-tight">Admin<span className="text-blue-500 font-light">Panel</span></div>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Menu Utama</div>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>📊 Analitik & Omset</button>
            <button onClick={() => setActiveTab('members')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>👥 Data Member</button>
            <button onClick={() => setActiveTab('packages')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'packages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>📝 Paket Try Out</button>
            <button 
              onClick={() => { setActiveTab('challenge'); fetchChallengeData(); }} 
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'challenge' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              30 Day Challenge
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('materials'); fetchMaterials(); }} 
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'materials' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              Materi Pembelajaran
            </button>
            <button onClick={() => setActiveTab('banners')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'banners' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>🎨 Banner Promosi</button>
            <button onClick={() => setActiveTab('updates')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'updates' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>📢 Info Terbaru</button>
            <button 
              onClick={() => { setActiveTab('subscription-packages'); fetchSubscriptionPackages(); }} 
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'subscription-packages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
              </svg>
              Paket Subscribe
            </button>
            <button 
              onClick={() => { setActiveTab('transactions'); fetchTransactions(); }} 
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Detail Transaksi
            </button>
            <button 
              onClick={() => { setActiveTab('vouchers'); fetchVoucherBatches(); }} 
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'vouchers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Manajemen Voucher
            </button>
            <button 
              onClick={() => { setActiveTab('blog'); fetchBlogPosts(); }} 
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'blog' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-2-1H5m8 0V5a2 2 0 012-2h2a2 2 0 012 2v1" />
              </svg>
              Blog
            </button>
            <button 
              onClick={() => { setActiveTab('resellers'); fetchResellers(); }} 
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'resellers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Manajemen Reseller
            </button>
            </nav>
            <button onClick={handleLogout} className="mt-2 w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
              <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 11-4 0v-1m0-8V7a2 2 0 114 0v1" />
              </svg>
              Logout
            </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {activeTab === 'analytics' && 'Ringkasan Pendapatan'}
            {activeTab === 'members' && 'Manajemen Customer'}
            {activeTab === 'packages' && 'Bank Soal & Paket'}
            {activeTab === 'challenge' && 'Pengaturan 30 Day Challenge'}
            {activeTab === 'materials' && 'Materi Pembelajaran'}
            {activeTab === 'banners' && 'Banner Promosi'}
            {activeTab === 'updates' && 'Info Terbaru'}
            {activeTab === 'subscription-packages' && 'Paket Subscribe'}
            {activeTab === 'transactions' && 'Detail Transaksi'}
            {activeTab === 'vouchers' && 'Manajemen Voucher'}
            {activeTab === 'blog' && 'Kelola Blog'}
            {activeTab === 'resellers' && 'Manajemen Reseller'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            
            {activeTab === 'analytics' && <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">Grafik omset akan ditambahkan setelah ada transaksi.</div>}

            {/* 2. TAB DATA MEMBER */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                {(() => {
                  const filteredMembers = members.filter((member) => {
                    if (!memberSearchQuery.trim()) return true;
                    const q = memberSearchQuery.toLowerCase().trim();
                    return (
                      (member.full_name || '').toLowerCase().includes(q) ||
                      (member.email || '').toLowerCase().includes(q) ||
                      (member.id || '').toLowerCase().includes(q)
                    );
                  });

                  return (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">Daftar Member</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Menampilkan {filteredMembers.length} dari {members.length} member
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Search Bar Member */}
                          <div className="relative min-w-[280px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={memberSearchQuery}
                              onChange={(e) => setMemberSearchQuery(e.target.value)}
                              placeholder="Cari nama, email, atau ID member..."
                              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
                            />
                            {memberSearchQuery && (
                              <button
                                onClick={() => setMemberSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                                title="Hapus pencarian"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <button
                            onClick={refreshMembers}
                            className="text-sm bg-white border border-slate-300 text-blue-600 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium flex items-center gap-1 flex-shrink-0 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {isLoadingMembers ? (
                          <div className="text-center py-10 text-slate-500 font-medium">Memuat data member...</div>
                        ) : filteredMembers.length === 0 ? (
                          <div className="text-center py-10 flex flex-col items-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <div className="text-slate-700 font-bold text-base">Member tidak ditemukan</div>
                            <p className="text-xs text-slate-500 mt-1">
                              Tidak ada member yang cocok dengan kata kunci &quot;<span className="font-semibold">{memberSearchQuery}</span>&quot;
                            </p>
                            <button
                              onClick={() => setMemberSearchQuery('')}
                              className="mt-3 px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Reset Pencarian
                            </button>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-sm font-semibold text-slate-600">Email / ID Pengguna</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Masa Aktif Berakhir</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredMembers.map((member) => {
                                const validUntilDate = new Date(member.subscription_valid_until || 0);
                                const isExpired = !member.subscription_valid_until || validUntilDate < new Date(); 
                                
                                return (
                                  <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4">
                                      <div className="font-bold text-slate-800">{member.full_name || 'Tanpa Nama'}</div>
                                      <div className="text-xs text-slate-500 mt-1">{member.email || member.id.substring(0,12)+'...'}</div>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm font-medium">
                                      {member.subscription_valid_until 
                                        ? validUntilDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                                        : '-'}
                                    </td>
                                    <td className="p-4">
                                      {isExpired ? (
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">EXPIRED</span>
                                      ) : (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">AKTIF</span>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={async () => {
                                            setSelectedUser(member);
                                            await fetchUserExamResults(member.id);
                                            setShowScoreModal(true);
                                          }}
                                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                        >
                                          Detail Nilai
                                        </button>
                                        
                                        {/* TOMBOL BARU: Riwayat Order */}
                                        <button
                                          onClick={async () => {
                                            setSelectedMember(member);
                                            await fetchMemberOrders(member.id);
                                            setShowMemberOrderModal(true);
                                          }}
                                          className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                                        >
                                          Riwayat Order ({member.order_count || 0})
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === 'packages' && (
              <div className="space-y-8">
                {/* Form Buat Paket Baru */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Buat Paket Try Out Baru</h3>
                  <form onSubmit={handleCreatePackage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Nama Paket</label>
                      <input
                        type="text"
                        required
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Misal: SKD Platinum 02"
                      />
                    </div>
                    
                    {/* Tambahkan kolom Tipe Ujian */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Tipe Ujian</label>
                      <select
                        value={newPackage.exam_type}
                        onChange={(e) => setNewPackage({ ...newPackage, exam_type: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="CPNS">CPNS (Calon Pegawai Negeri Sipil)</option>
                        <option value="P3K">P3K (Pegawai Pemerintah dengan Perjanjian Kerja)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Tipe Akses</label>
                      <select
                        value={newPackage.is_premium ? 'true' : 'false'}
                        onChange={(e) => setNewPackage({ ...newPackage, is_premium: e.target.value === 'true' })}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="true">Premium (Berbayar/ Harus Langganan)</option>
                        <option value="false">Gratis (Free Trial untuk Semua)</option>
                      </select>
                    </div>
                    
                    {/* Tambahkan Toggle Pembahasan */}
                    <div className="md:col-span-2">
                       <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                         <input
                           type="checkbox"
                           checked={newPackage.show_explanation !== false}
                           onChange={(e) => setNewPackage({ ...newPackage, show_explanation: e.target.checked })}
                           className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                         />
                         <div>
                           <div className="font-semibold text-slate-800">Tampilkan Pembahasan di Hasil Ujian</div>
                           <div className="text-xs text-slate-600 mt-1">
                             Jika dicentang, peserta akan melihat kunci jawaban dan penjelasan setelah selesai ujian.
                             Jika tidak, hanya skor yang ditampilkan (mode simulasi ujian serius).
                           </div>
                         </div>
                       </label>
                     </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Deskripsi Singkat</label>
                      <input
                        type="text"
                        value={newPackage.description}
                        onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Misal: Fokus pada tes figural dan deret angka"
                      />
                    </div>
                    
                    <div className="md:col-span-2 mt-2">
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                      >
                        {isCreating ? 'Menyimpan...' : '+ Simpan Paket Baru'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Daftar Paket yang Sudah Ada */}
                <div>
                  {(() => {
                    const filteredPackages = packages.filter((pkg) => {
                      if (!packageSearchQuery.trim()) return true;
                      const query = packageSearchQuery.toLowerCase().trim();
                      return (
                        (pkg.name || '').toLowerCase().includes(query) ||
                        (pkg.description || '').toLowerCase().includes(query) ||
                        (pkg.exam_type || '').toLowerCase().includes(query)
                      );
                    });

                    return (
                      <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">Daftar Paket Tersedia</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Menampilkan {filteredPackages.length} dari {packages.length} paket
                            </p>
                          </div>

                          {/* Input Search Paket Try Out */}
                          <div className="relative min-w-[280px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={packageSearchQuery}
                              onChange={(e) => setPackageSearchQuery(e.target.value)}
                              placeholder="Cari nama paket, tipe, atau deskripsi..."
                              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
                            />
                            {packageSearchQuery && (
                              <button
                                onClick={() => setPackageSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                                title="Hapus pencarian"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {isLoadingPackages ? (
                          <div className="text-center py-6 text-slate-500">Memuat data paket...</div>
                        ) : filteredPackages.length === 0 ? (
                          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                            <div className="text-4xl mb-2">🔍</div>
                            <p className="font-bold text-slate-700 text-base">Paket Try Out tidak ditemukan</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Tidak ada paket yang cocok dengan kata kunci &quot;<span className="font-semibold">{packageSearchQuery}</span>&quot;
                            </p>
                            <button
                              onClick={() => setPackageSearchQuery('')}
                              className="mt-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Reset Pencarian
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredPackages.map((pkg) => {
                              const isActive = pkg.is_active !== false; // Default true jika null
                              
                              return (
                                  <div key={pkg.id} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col transition-opacity ${
                                      !isActive ? 'opacity-60 border-dashed border-slate-300' : 'border-slate-200'
                                  }`}>
                                      <div className="flex justify-between items-start mb-2">
                                          <div>
                                              <h3 className="font-bold text-lg">{pkg.name}</h3>
                                              <p className="text-xs text-slate-500 mt-1 font-semibold">
                                                  {pkg.exam_type === 'CPNS' ? 'Ujian CPNS' : 'Ujian P3K'}
                                              </p>
                                              <p className="text-slate-500 text-sm mt-1">{pkg.description || 'Tidak ada deskripsi'}</p>
                                          </div>
                                          <div className="flex flex-col gap-1 items-end">
                                               <div className="flex gap-1.5">
                                                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                       pkg.is_premium ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                                   }`}>
                                                       {pkg.is_premium ? 'Premium' : 'Gratis'}
                                                   </span>
                                                   {/* Badge Status Aktif */}
                                                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                       isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                   }`}>
                                                       {isActive ? 'AKTIF' : 'NONAKTIF'}
                                                   </span>
                                               </div>
                                               {/* Badge Pembahasan */}
                                               <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                   pkg.show_explanation !== false
                                                       ? 'bg-green-100 text-green-700'
                                                       : 'bg-slate-100 text-slate-500'
                                               }`}>
                                                   {pkg.show_explanation !== false ? '📝 Ada Pembahasan' : '🔒 Tanpa Pembahasan'}
                                               </span>

                                               {/* BADGE CHALLENGE */}
                                               {pkg.is_challenge && (
                                                 <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 mt-1">
                                                   🏆 Challenge Hari {pkg.challenge_day}
                                                 </span>
                                               )}
                                           </div>
                                      </div>
                                      
                                      {/* BADGE STATISTIK JUMLAH SOAL */}
                                      <div className="mt-3 mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-base">📝</span>
                                          <div>
                                            <div className="text-xs font-bold text-slate-800">
                                              {pkg.question_count || 0} Total Soal
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-medium">
                                              {(pkg.question_count || 0) > 0 ? (
                                                <>TWK: <span className="font-semibold text-slate-700">{pkg.question_twk || 0}</span> | TIU: <span className="font-semibold text-slate-700">{pkg.question_tiu || 0}</span> | TKP: <span className="font-semibold text-slate-700">{pkg.question_tkp || 0}</span></>
                                              ) : (
                                                'Belum ada soal'
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                          (pkg.question_count || 0) >= 110
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : (pkg.question_count || 0) > 0
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                          {(pkg.question_count || 0) >= 110 ? 'Lengkap' : (pkg.question_count || 0) > 0 ? 'Parsial' : 'Kosong'}
                                        </span>
                                      </div>

                                      <div className="mt-auto pt-3 border-t flex flex-wrap gap-2">
                                          <button
                                              onClick={() => {
                                                  setEditingPackage(pkg);
                                                  fetchQuestions(pkg.id);
                                              }}
                                              className="flex-1 min-w-[130px] bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg font-semibold text-sm transition-colors text-center"
                                          >
                                              ⚙️ Kelola Soal ({pkg.question_count || 0})
                                          </button>

                                          {/* Tombol Set Challenge */}
                                          <button
                                            onClick={async () => {
                                              const dayInput = prompt(`Set paket "${pkg.name}" untuk Challenge Hari ke Berapa? (Masukkan angka 1-30):`);
                                              if (dayInput) {
                                                const dayNumber = parseInt(dayInput);
                                                if (dayNumber >= 1 && dayNumber <= 30) {
                                                  const { data: dayExists } = await supabase
                                                    .from('challenge_packages')
                                                    .select('id')
                                                    .eq('day_number', dayNumber)
                                                    .single();
                                                  
                                                  if (dayExists) {
                                                    if (!confirm(`Hari ke-${dayNumber} sudah ada paketnya. Ganti dengan paket ini?`)) return;
                                                    await supabase.from('challenge_packages').delete().eq('id', dayExists.id);
                                                  }
                                                  
                                                  const { error } = await supabase
                                                    .from('challenge_packages')
                                                    .insert([{ day_number: dayNumber, package_id: pkg.id, is_active: true }]);
                                                  
                                                  if (error) {
                                                    alert('Error: ' + error.message);
                                                  } else {
                                                    alert(`✅ Paket "${pkg.name}" berhasil diset untuk Hari ke-${dayNumber} di 30 Day Challenge`);
                                                    fetchPackages();
                                                  }
                                                } else {
                                                  alert('Nomor hari tidak valid (harus 1-30)');
                                                }
                                              }
                                            }}
                                            className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 flex items-center justify-center"
                                            title="Set untuk 30 Day Challenge"
                                          >
                                            🏆
                                          </button>

                                          {/* Toggle Aktif/Nonaktif */}
                                          <button
                                              onClick={async () => {
                                                  const newStatus = !isActive;
                                                  const { error } = await supabase
                                                      .from('tryout_packages')
                                                      .update({ is_active: newStatus })
                                                      .eq('id', pkg.id);
                                                  
                                                  if (!error) {
                                                      alert(`✅ Paket ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
                                                      fetchPackages();
                                                  } else {
                                                      alert('Gagal: ' + error.message);
                                                  }
                                              }}
                                              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                                  isActive 
                                                      ? 'border-orange-200 text-orange-700 hover:bg-orange-50' 
                                                      : 'border-green-200 text-green-700 hover:bg-green-50'
                                              }`}
                                              title={isActive ? 'Nonaktifkan paket' : 'Aktifkan paket'}
                                          >
                                              {isActive ? '🔴' : '🟢'}
                                          </button>
                                          
                                          {/* Tombol Hapus */}
                                          <button
                                              onClick={async () => {
                                                  if (confirm('Hapus paket ini? Semua soal di dalamnya juga akan terhapus.')) {
                                                      await supabase.from('tryout_packages').delete().eq('id', pkg.id);
                                                      fetchPackages();
                                                  }
                                              }}
                                              className="px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center"
                                              title="Hapus paket"
                                          >
                                              🗑
                                          </button>
                                      </div>
                                  </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Modal/Form Kelola Soal */}
                {editingPackage && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">Kelola Soal - {editingPackage.name}</h3>
                          <p className="text-sm text-slate-500">Total {questions.length} soal</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingPackage(null);
                            setQuestions([]);
                            fetchPackages();
                          }}
                          className="text-slate-400 hover:text-slate-600 text-2xl"
                        >
                          ×
                        </button>
                      </div>

                      {(() => {
                          const counts = {
                              TWK: questions.filter(q => q.question_category === 'TWK').length,
                              TIU: questions.filter(q => q.question_category === 'TIU').length,
                              TKP: questions.filter(q => q.question_category === 'TKP').length,
                          };
                          const totalSoal = counts.TWK + counts.TIU + counts.TKP;
                          
                          const isCategoryFull = counts[newQuestion.question_category as keyof typeof counts] >= CATEGORY_LIMITS[newQuestion.question_category as keyof typeof CATEGORY_LIMITS];
                          const isTotalFull = totalSoal >= 110;

                          return (
                              <>
                                  {/* Form Upload Soal dari File */}
                                  <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 mb-2">📤 Upload Soal dari File TXT</h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                      Upload file TXT dengan format yang sudah ditentukan. 
                                      <a href="/contoh-soal.txt" className="underline ml-1" download>
                                        Download contoh format
                                      </a>
                                    </p>
                                    <input
                                      type="file"
                                      accept=".txt"
                                      onChange={handleFileUpload}
                                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                    />
                                    {uploadStatus && (
                                      <div className={`mt-2 text-sm ${uploadStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {uploadStatus.message}
                                      </div>
                                    )}
                                  </div>

                                  <div className="mb-6 bg-slate-50 p-4 rounded-lg">
                                      <div className="flex justify-between items-center mb-3">
                                          <h4 className="font-semibold">Tambah Soal Baru</h4>
                                          <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                                              Total Soal: {totalSoal} / 110
                                          </span>
                                      </div>

                                      <div className="grid grid-cols-3 gap-3 mb-4">
                                          {Object.keys(CATEGORY_LIMITS).map((cat) => (
                                              <div key={cat} className={`p-2 rounded-lg border text-center text-xs font-medium ${
                                                  counts[cat as keyof typeof counts] >= CATEGORY_LIMITS[cat as keyof typeof CATEGORY_LIMITS] 
                                                      ? 'bg-red-50 border-red-200 text-red-700' 
                                                      : 'bg-white border-slate-200 text-slate-600'
                                              }`}>
                                                  {cat}: {counts[cat as keyof typeof counts]}/{CATEGORY_LIMITS[cat as keyof typeof CATEGORY_LIMITS]}
                                                  {counts[cat as keyof typeof counts] >= CATEGORY_LIMITS[cat as keyof typeof CATEGORY_LIMITS] && ' (Penuh)'}
                                              </div>
                                          ))}
                                      </div>

                                      <form onSubmit={(e) => {
                                          e.preventDefault();
                                          if (isCategoryFull || isTotalFull) {
                                              alert('Batas soal untuk kategori ini sudah tercapai!');
                                              return;
                                          }
                                          handleAddQuestion(e);
                                      }} className="space-y-4">
                                          
                                          <div className="grid grid-cols-3 gap-4">
                                              <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                                  Nomor Soal
                                                </label>
                                                <input
                                                  type="number"
                                                  value={newQuestion.question_number}
                                                  onChange={(e) => setNewQuestion({ ...newQuestion, question_number: parseInt(e.target.value) })}
                                                  className="w-full border border-slate-300 rounded-lg p-2"
                                                  min="1"
                                                />
                                              </div>
                                              
                                              <div>
                                                  <label className="block text-sm font-medium text-slate-600 mb-1">
                                                      Kategori Soal *
                                                  </label>
                                                  <select
                                                      value={newQuestion.question_category}
                                                      onChange={(e) => setNewQuestion({ ...newQuestion, question_category: e.target.value })}
                                                      className="w-full border border-slate-300 rounded-lg p-2 disabled:bg-slate-100 disabled:text-slate-400"
                                                  >
                                                      <option value="TWK" disabled={counts.TWK >= CATEGORY_LIMITS.TWK}>
                                                          TWK - Wawasan Kebangsaan ({counts.TWK}/{CATEGORY_LIMITS.TWK})
                                                      </option>
                                                      <option value="TIU" disabled={counts.TIU >= CATEGORY_LIMITS.TIU}>
                                                          TIU - Intelegensi Umum ({counts.TIU}/{CATEGORY_LIMITS.TIU})
                                                      </option>
                                                      <option value="TKP" disabled={counts.TKP >= CATEGORY_LIMITS.TKP}>
                                                          TKP - Karakteristik Pribadi ({counts.TKP}/{CATEGORY_LIMITS.TKP})
                                                      </option>
                                                  </select>
                                              </div>

                                              <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                                  Kunci Jawaban
                                                </label>
                                                <select
                                                  value={newQuestion.correct_answer}
                                                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                                                  className="w-full border border-slate-300 rounded-lg p-2"
                                                >
                                                  <option value="A">A</option>
                                                  <option value="B">B</option>
                                                  <option value="C">C</option>
                                                  <option value="D">D</option>
                                                  <option value="E">E</option>
                                                </select>
                                              </div>
                                          </div>

                                          {newQuestion.question_category === 'TKP' && (
                                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
                                              <strong>Soal TKP:</strong> Tidak ada jawaban salah. Setiap pilihan memiliki bobot 1-5. 
                                              Tentukan bobot nilai untuk setiap pilihan jawaban di bawah.
                                            </div>
                                          )}

                                          <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                              Pertanyaan <span className="text-xs text-slate-400">(Support LaTeX & HTML)</span>
                                            </label>
                                            <textarea
                                              value={newQuestion.question_text}
                                              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                                              className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
                                              rows={4}
                                              placeholder="Contoh: Hitunglah nilai dari $x^2 + 3x - 4 = 0$"
                                              required
                                            />
                                            <div className="mt-2">
                                              {imagePreview.question_image_url ? (
                                                <div className="relative inline-block mt-2">
                                                  <img src={imagePreview.question_image_url} alt="Preview" className="max-h-32 rounded border" />
                                                  <button
                                                    type="button"
                                                    onClick={() => removeImage('question_image_url')}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              ) : (
                                                <label className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer mt-2">
                                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                  </svg>
                                                  Upload Gambar Soal
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'question_image_url')}
                                                    className="hidden"
                                                  />
                                                </label>
                                              )}
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {['a', 'b', 'c', 'd', 'e'].map((opt) => (
                                              <div key={opt} className="border border-slate-200 rounded-lg p-3 bg-white">
                                                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center justify-between">
                                                  <span>Pilihan {opt.toUpperCase()}</span>
                                                  <span className="text-[10px] text-slate-400 font-normal">(LaTeX & HTML)</span>
                                                </label>
                                                <input
                                                  type="text"
                                                  value={newQuestion[`option_${opt}` as keyof typeof newQuestion]}
                                                  onChange={(e) => setNewQuestion({ ...newQuestion, [`option_${opt}`]: e.target.value })}
                                                  className="w-full border border-slate-300 rounded-lg p-2 mb-2 font-mono text-sm"
                                                  required
                                                />
                                                
                                                {newQuestion.question_category === 'TKP' && (
                                                  <div className="mt-2">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                                      Bobot Nilai (1-5)
                                                    </label>
                                                    <input
                                                      type="number"
                                                      min="1"
                                                      max="5"
                                                      value={newQuestion[`tkp_score_${opt}` as keyof typeof newQuestion] || 1}
                                                      onChange={(e) => setNewQuestion({ ...newQuestion, [`tkp_score_${opt}`]: parseInt(e.target.value) })}
                                                      className="w-full border border-slate-300 rounded-lg p-1 text-sm"
                                                    />
                                                  </div>
                                                )}
                                                
                                                <div className="mt-2">
                                                  {imagePreview[`option_${opt}_image_url` as keyof typeof imagePreview] ? (
                                                    <div className="relative inline-block">
                                                      <img src={imagePreview[`option_${opt}_image_url` as keyof typeof imagePreview]} alt={`Preview ${opt.toUpperCase()}`} className="max-h-20 rounded border" />
                                                      <button
                                                        type="button"
                                                        onClick={() => removeImage(`option_${opt}_image_url`)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                                      >
                                                        ×
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <label className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                      </svg>
                                                      Upload Gambar
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, `option_${opt}_image_url`)}
                                                        className="hidden"
                                                      />
                                                    </label>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>

                                          <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                              Pembahasan <span className="text-xs text-slate-400">(Opsional)</span>
                                            </label>
                                            <textarea
                                              value={newQuestion.explanation}
                                              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                              className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
                                              rows={3}
                                            />
                                          </div>

                                          <button
                                              type="submit"
                                              disabled={isCategoryFull || isTotalFull}
                                              className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                                  isCategoryFull || isTotalFull
                                                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                      : 'bg-green-600 text-white hover:bg-green-700'
                                              }`}
                                          >
                                              {isTotalFull 
                                                  ? '🚫 Total Soal Sudah 110 (Paket Penuh)' 
                                                  : isCategoryFull 
                                                      ? `🚫 Kategori ${newQuestion.question_category} Sudah Penuh` 
                                                      : '+ Tambah Soal'}
                                          </button>
                                      </form>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-3">Daftar Soal</h4>
                                    {isLoadingQuestions ? (
                                      <div className="text-center py-4 text-slate-500">Memuat soal...</div>
                                    ) : questions.length === 0 ? (
                                      <div className="text-center py-4 text-slate-400">Belum ada soal</div>
                                    ) : (
                                      <div className="space-y-3">
                                        {questions.map((q) => (
                                          <div key={q.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                                            <div className="flex justify-between items-start mb-2">
                                              <div className="flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                  No. {q.question_number}
                                                </span>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                  Jawaban: {q.correct_answer}
                                                </span>
                                              </div>
                                              <button
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                              >
                                                Hapus
                                              </button>
                                            </div>
                                            <div className="text-slate-800 mb-2 font-medium">
                                              <FormattedText text={q.question_text} inline={false} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                              <div>A. <FormattedText text={q.option_a} /></div>
                                              <div>B. <FormattedText text={q.option_b} /></div>
                                              <div>C. <FormattedText text={q.option_c} /></div>
                                              <div>D. <FormattedText text={q.option_d} /></div>
                                              {q.option_e && <div>E. <FormattedText text={q.option_e} /></div>}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                              </>
                          );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            )}



            {activeTab === 'subscription-packages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Paket Subscribe</h2>
                    <p className="text-slate-500">Kelola paket langganan member dengan benefit dan harga</p>
                  </div>
                  <button
                    onClick={() => setShowSubPackageModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Paket Baru
                  </button>
                </div>

                {/* List Paket Subscribe */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptionPackages.map(pkg => {
                    const durationText = pkg.duration_months === 999 
                      ? 'Lifetime' 
                      : `${pkg.duration_months} Bulan`;
                    
                    // Ambil benefit untuk paket ini
                    const packageBenefits = subBenefits[pkg.id] || [];
                    
                    return (
                      <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                          <h3 className="font-bold text-lg">{pkg.name}</h3>
                          <p className="text-blue-100 text-sm mt-1">{pkg.description}</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                          {/* Info Durasi & Harga */}
                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-600">Durasi:</span>
                              <span className="font-bold text-slate-800">{durationText}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-600">Harga:</span>
                              <span className="font-bold text-blue-600 text-lg">
                                Rp {pkg.price?.toLocaleString('id-ID')}
                              </span>
                            </div>
                            {pkg.discount_label && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Diskon:</span>
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                  {pkg.discount_label}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Benefit - PAKET INI SAJA */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-2 text-sm">Benefit:</h4>
                            <ul className="space-y-1 text-sm text-slate-600">
                              {packageBenefits.slice(0, 3).map(b => (
                                <li key={b.id} className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{b.benefit_text}</span>
                                </li>
                              ))}
                              {packageBenefits.length === 0 && (
                                <li className="text-slate-400 italic text-xs">Belum ada benefit</li>
                              )}
                              {packageBenefits.length > 3 && (
                                <li className="text-xs text-blue-600 font-medium mt-2 cursor-pointer hover:underline"
                                    onClick={() => {
                                      setSelectedPackageForBenefits(pkg);
                                      setShowAllBenefitsModal(true);
                                    }}>
                                  +{packageBenefits.length - 3} manfaat lainnya
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Tombol Aksi */}
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setSelectedSubPackage(pkg);
                                fetchSubPackageDetails(pkg.id);
                              }}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Kelola Benefit & Harga
                            </button>

                            {/* TOMBOL HAPUS - BARU */}
                            <button
                              onClick={() => deleteSubPackage(pkg.id, pkg.name)}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus Paket
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Modal Kelola Detail Paket */}
                {selectedSubPackage && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8">
                      
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-white">Kelola: {selectedSubPackage.name}</h3>
                          <p className="text-amber-100 text-sm">Atur benefit, durasi, dan harga langganan</p>
                        </div>
                        <button
                          onClick={() => setSelectedSubPackage(null)}
                          className="text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
                        >
                          ×
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                        
                        {/* Pengaturan Durasi & Harga - SATU SAJA */}
                        <div>
                          <h4 className="font-bold text-slate-800 mb-3">⏱️ Durasi & Harga Langganan</h4>
                          <p className="text-sm text-slate-500 mb-4">
                            Pilih satu durasi untuk paket ini. Member hanya akan melihat opsi ini.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Pilihan Durasi */}
                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Durasi</label>
                              <select
                                value={selectedSubPackage.duration_months || 1}
                                onChange={async (e) => {
                                  const value = parseInt(e.target.value);
                                  await updateSubPackage(selectedSubPackage.id, 'duration_months', value);
                                  setSelectedSubPackage({...selectedSubPackage, duration_months: value});
                                }}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              >
                                <option value={1}>1 Bulan</option>
                                <option value={2}>2 Bulan</option>
                                <option value={3}>3 Bulan</option>
                                <option value={6}>6 Bulan</option>
                                <option value={9}>9 Bulan</option>
                                <option value={12}>12 Bulan</option>
                                <option value={999}>Lifetime (Selamanya)</option>
                              </select>
                            </div>

                            {/* Input Harga */}
                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
                              <input
                                type="number"
                                value={selectedSubPackage.price || 0}
                                onChange={async (e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  await updateSubPackage(selectedSubPackage.id, 'price', value);
                                  setSelectedSubPackage({...selectedSubPackage, price: value});
                                }}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                                placeholder="0"
                              />
                            </div>

                            {/* Label Diskon */}
                            <div className="md:col-span-1">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Label Diskon (Opsional)</label>
                              <input
                                type="text"
                                value={selectedSubPackage.discount_label || ''}
                                onChange={async (e) => {
                                  const value = e.target.value;
                                  await updateSubPackage(selectedSubPackage.id, 'discount_label', value || null);
                                  setSelectedSubPackage({...selectedSubPackage, discount_label: value || null});
                                }}
                                placeholder="Contoh: Hemat 20%"
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              />
                            </div>
                          </div>

                          {/* Preview */}
                          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-sm text-blue-800 font-medium mb-2">Preview Tampilan:</div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-bold text-slate-800">
                                {selectedSubPackage.duration_months === 999 
                                  ? 'Lifetime' 
                                  : `${selectedSubPackage.duration_months} Bulan`}
                              </span>
                              <span className="text-slate-400">|</span>
                              <span className="font-bold text-blue-600 text-lg">
                                Rp {(selectedSubPackage.price || 0).toLocaleString('id-ID')}
                              </span>
                              {selectedSubPackage.discount_label && (
                                <>
                                  <span className="text-slate-400">|</span>
                                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                    {selectedSubPackage.discount_label}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Kelola Benefit */}
                        <div>
                          <h4 className="font-bold text-slate-800 mb-3">📋 Manfaat yang Didapatkan</h4>
                          
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={newSubBenefit}
                              onChange={(e) => setNewSubBenefit(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addSubBenefit(selectedSubPackage.id)}
                              placeholder="Tambah benefit baru..."
                              className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm"
                            />
                            <button
                              onClick={() => addSubBenefit(selectedSubPackage.id)}
                              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                              Tambah
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(subBenefits[selectedSubPackage.id] || []).map((benefit, index) => (
                              <div key={benefit.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-slate-500 w-6">{index + 1}</span>
                                <input
                                  type="text"
                                  value={benefit.benefit_text}
                                  onChange={(e) => updateSubBenefit(selectedSubPackage.id, benefit.id, e.target.value)}
                                  className="flex-1 bg-transparent border-none text-sm focus:ring-0"
                                />
                                <button
                                  onClick={() => deleteSubBenefit(selectedSubPackage.id, benefit.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Hapus
                                </button>
                              </div>
                            ))}
                            {(subBenefits[selectedSubPackage.id] || []).length === 0 && (
                              <p className="text-sm text-slate-500 italic text-center py-4">
                                Belum ada benefit. Tambahkan di atas.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Tambah Paket Baru */}
                {showSubPackageModal && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">Tambah Paket Subscribe Baru</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Paket *</label>
                          <input
                            type="text"
                            value={newSubPackage.name}
                            onChange={(e) => setNewSubPackage({...newSubPackage, name: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg p-2.5"
                            placeholder="Contoh: Paket Gold"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                          <textarea
                            value={newSubPackage.description}
                            onChange={(e) => setNewSubPackage({...newSubPackage, description: e.target.value})}
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg p-2.5"
                            placeholder="Deskripsi singkat paket..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Durasi *</label>
                          <select
                            value={newSubPackage.duration_months}
                            onChange={(e) => setNewSubPackage({...newSubPackage, duration_months: parseInt(e.target.value)})}
                            className="w-full border border-slate-300 rounded-lg p-2.5"
                          >
                            <option value={1}>1 Bulan</option>
                            <option value={3}>3 Bulan</option>
                            <option value={6}>6 Bulan</option>
                            <option value={12}>12 Bulan</option>
                            <option value={999}>Lifetime (Selamanya)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp) *</label>
                          <input
                            type="number"
                            value={newSubPackage.price || ''}
                            onChange={(e) => setNewSubPackage({...newSubPackage, price: parseInt(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded-lg p-2.5"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Label Diskon (Opsional)</label>
                          <input
                            type="text"
                            value={newSubPackage.discount_label}
                            onChange={(e) => setNewSubPackage({...newSubPackage, discount_label: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg p-2.5"
                            placeholder="Contoh: Hemat 20%"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowSubPackageModal(false)}
                          className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                        >
                          Batal
                        </button>
                        <button
                          onClick={addSubPackage}
                          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB BANNER */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                <form onSubmit={handleAddBanner} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Tambah Banner Baru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Judul Banner</label>
                      <input name="title" placeholder="Judul Banner" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">URL Gambar</label>
                      <input name="image_url" placeholder="URL Gambar" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Link Tujuan (opsional)</label>
                      <input name="link_url" placeholder="Link Tujuan" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Urutan Tampilan</label>
                      <input name="display_order" type="number" placeholder="Urutan Tampilan" defaultValue="0" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">+ Tambah Banner</button>
                </form>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-800">Daftar Banner Aktif</h3>
                  {isLoadingBanners ? (
                    <div className="text-center py-6 text-slate-500">Memuat data banner...</div>
                  ) : banners.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">Belum ada banner promosi.</div>
                  ) : (
                    <div className="space-y-4">
                      {banners.map(banner => (
                        <div key={banner.id} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 items-center shadow-sm">
                          <img src={banner.image_url} alt={banner.title} className="w-48 h-24 object-cover rounded-lg border border-slate-200" />
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">{banner.title}</h4>
                            {banner.link_url && <p className="text-sm text-blue-600 hover:underline">{banner.link_url}</p>}
                            <p className="text-xs text-slate-400 mt-1">Urutan: {banner.display_order}</p>
                          </div>
                          <button onClick={() => handleDeleteBanner(banner.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Hapus Banner">
                            🗑️ Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB INFO TERBARU */}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                <form onSubmit={handleAddUpdate} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Tambah Info Terbaru</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Judul Info</label>
                      <input name="title" placeholder="Judul Info" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Kategori</label>
                        <select name="category" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                          <option value="CPNS">CPNS</option>
                          <option value="P3K">P3K</option>
                          <option value="Umum">Umum</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal Publikasi</label>
                        <input name="published_date" type="date" required className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" defaultValue={new Date().toISOString().substring(0,10)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Konten Info</label>
                      <textarea name="content" placeholder="Konten Info" rows={3} className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input name="is_important" type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Tandai sebagai penting</span>
                    </label>
                  </div>
                  <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">+ Tambah Info</button>
                </form>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-800">Daftar Info</h3>
                  {isLoadingUpdates ? (
                    <div className="text-center py-6 text-slate-500">Memuat info terbaru...</div>
                  ) : updates.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">Belum ada info terbaru.</div>
                  ) : (
                    <div className="space-y-3">
                      {updates.map(update => (
                        <div key={update.id} className={`bg-white p-4 rounded-xl border shadow-sm transition-all ${update.is_important ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  update.category === 'CPNS' ? 'bg-blue-100 text-blue-700' :
                                  update.category === 'P3K' ? 'bg-green-100 text-green-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {update.category}
                                </span>
                                {update.is_important && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                    PENTING
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-slate-800 mt-2">{update.title}</h4>
                              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{update.content}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                📅 {new Date(update.published_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <button onClick={() => handleDeleteUpdate(update.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Hapus Info">
                              🗑️ Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 30 DAY CHALLENGE */}
            {activeTab === 'challenge' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                  <h2 className="text-2xl font-bold mb-2">🏆 Pengaturan 30 Day Challenge</h2>
                  <p className="text-amber-100 text-sm">
                    Tetapkan paket soal khusus untuk setiap hari. User akan ditantang menyelesaikan 30 try out 
                    dengan target nilai yang meningkat setiap 10 hari.
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="font-bold text-lg">Hari 1-10</div>
                      <div>Minimal Passing Grade</div>
                      <div className="text-amber-200 mt-1">(TWK≥65, TIU≥80, TKP≥166)</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="font-bold text-lg">Hari 11-20</div>
                      <div>Minimal Total 400</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                      <div className="font-bold text-lg">Hari 21-30</div>
                      <div>Minimal Total 460</div>
                    </div>
                  </div>
                </div>

                {/* Form Link Klaim Garansi */}
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2 text-base">
                    🔗 Link Form Klaim Garansi (Google Form)
                  </h3>
                  <p className="text-amber-800 text-xs mb-3">
                    Link ini akan digunakan pada tombol <strong>Klaim Garansi</strong> di dashboard member saat user berhasil menyelesaikan seluruh 30 hari tantangan.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      value={guaranteeFormUrl}
                      onChange={(e) => setGuaranteeFormUrl(e.target.value)}
                      placeholder="https://forms.google.com/..."
                      className="flex-1 border border-amber-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-black"
                    />
                    <button
                      onClick={handleSaveGuaranteeUrl}
                      disabled={isSavingGuaranteeUrl}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSavingGuaranteeUrl ? 'Memproses...' : '💾 Simpan Link Garansi'}
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <strong>💡 Sistem Anti-Duplikasi Otomatis:</strong>
                      <p className="mt-1">
                        Paket try out yang sudah dipilih untuk 30 Day Challenge <strong>otomatis tidak akan muncul</strong> di menu Try Out biasa. 
                        Ini mencegah user mengerjakan soal yang sama 2 kali.
                      </p>
                      <p className="mt-2 text-xs text-blue-700">
                        <strong>Cara menggunakan:</strong> Klik tombol 🏆 di card paket pada tab "Paket Try Out", atau pilih langsung dari dropdown di halaman ini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid 30 Hari */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Paket Per Hari</h3>
                    <button
                      onClick={fetchChallengeData}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      🔄 Refresh Data
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-2">
                    {challengeDays.map((day) => {
                      const phase = day.day_number <= 10 ? 1 : day.day_number <= 20 ? 2 : 3;
                      const phaseColors = ['blue', 'purple', 'orange'];
                      const phaseLabels = ['Passing Grade', 'Min. 400', 'Min. 500'];
                      
                      return (
                        <div 
                          key={day.id} 
                          className={`border-2 rounded-xl p-4 transition-all ${
                            day.is_active 
                              ? `border-${phaseColors[phase-1]}-300 bg-${phaseColors[phase-1]}-50` 
                              : 'border-slate-200 bg-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className={`font-bold text-lg text-${phaseColors[phase-1]}-700`}>
                              Hari ke-{day.day_number}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={day.is_active}
                                onChange={async () => {
                                  const newStatus = !day.is_active;
                                  await supabase
                                    .from('challenge_packages')
                                    .update({ is_active: newStatus })
                                    .eq('id', day.id);
                                  fetchChallengeData();
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                          
                          <select
                            value={day.package_id || ''}
                            onChange={async (e) => {
                              await supabase
                                .from('challenge_packages')
                                .update({ package_id: e.target.value || null })
                                .eq('id', day.id);
                              fetchChallengeData();
                            }}
                            className="w-full text-sm border border-slate-300 rounded-lg p-2 mb-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={!day.is_active}
                          >
                            <option value="">-- Pilih Paket Soal --</option>
                            {allPackages.map(pkg => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} ({pkg.exam_type})
                              </option>
                            ))}
                          </select>
                          
                          <div className="text-xs text-slate-600 mt-2 bg-white/50 rounded p-2">
                            <div className="font-semibold">Target: {phaseLabels[phase-1]}</div>
                            {day.tryout_packages && (
                              <div className="mt-1 text-slate-500">
                                Paket: {day.tryout_packages.name}
                              </div>
                            )}
                            {/* INFO: Paket ini tidak akan muncul di menu Try Out */}
                            {day.package_id && (
                              <div className="mt-1 text-amber-700 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Hidden dari menu Try Out
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info Tambahan */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <strong>💡 Tips:</strong> Buat paket soal khusus untuk challenge ini di tab "Paket Try Out" 
                  dengan tipe akses "Premium". Pastikan soal-soal berkualitas dan sesuai dengan tingkat kesulitan 
                  yang meningkat setiap 10 hari.
                </div>
              </div>
            )}

            {/* TAB MATERI PEMBELAJARAN (LMS) */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">📚 Manajemen Materi Pembelajaran</h2>
                    <p className="text-slate-500">Kelola materi CPNS & P3K untuk member</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingMaterial(true);
                      setCurrentMaterial(null);
                      setMaterialForm({
                        category_id: '',
                        title: '',
                        description: '',
                        content: '',
                        youtube_url: '',
                        thumbnail_url: '',
                        reading_time: 5,
                        is_premium: false,
                        is_published: false
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Materi Baru
                  </button>
                </div>

                {/* Form Edit/Create */}
                {isEditingMaterial && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-800">
                        {currentMaterial ? 'Edit Materi' : 'Tambah Materi Baru'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsEditingMaterial(false);
                          setCurrentMaterial(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
                        <select
                          value={materialForm.category_id}
                          onChange={(e) => setMaterialForm({...materialForm, category_id: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih Kategori</option>
                          {materialCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Judul Materi *</label>
                        <input
                          type="text"
                          value={materialForm.title}
                          onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                          placeholder="Contoh: Pancasila sebagai Dasar Negara"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                      <textarea
                        value={materialForm.description}
                        onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
                        rows={2}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                        placeholder="Deskripsi singkat materi..."
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Konten Materi (Support HTML & LaTeX)
                      </label>
                      <div className="text-xs text-slate-500 mb-2">
                        Gunakan <code className="bg-slate-100 px-2 py-1 rounded">$...$</code> untuk LaTeX inline, 
                        <code className="bg-slate-100 px-2 py-1 rounded">$$...$$</code> untuk LaTeX block
                      </div>
                      <textarea
                        value={materialForm.content}
                        onChange={(e) => setMaterialForm({...materialForm, content: e.target.value})}
                        rows={10}
                        className="w-full border border-slate-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="<h2>Pengertian Pancasila</h2><p>Pancasila adalah...</p>$$x^2 + y^2 = z^2$$"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL YouTube (Opsional)</label>
                        <input
                          type="url"
                          value={materialForm.youtube_url}
                          onChange={(e) => setMaterialForm({...materialForm, youtube_url: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2.5"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL Thumbnail</label>
                        <input
                          type="url"
                          value={materialForm.thumbnail_url}
                          onChange={(e) => setMaterialForm({...materialForm, thumbnail_url: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg p-2.5"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estimasi Baca (menit)</label>
                        <input
                          type="number"
                          value={materialForm.reading_time}
                          onChange={(e) => setMaterialForm({...materialForm, reading_time: parseInt(e.target.value) || 5})}
                          className="w-full border border-slate-300 rounded-lg p-2.5"
                          min="1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_premium"
                          checked={materialForm.is_premium}
                          onChange={(e) => setMaterialForm({...materialForm, is_premium: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="is_premium" className="text-sm font-medium text-slate-700">
                          Materi Premium (Berbayar)
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_published"
                          checked={materialForm.is_published}
                          onChange={(e) => setMaterialForm({...materialForm, is_published: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="is_published" className="text-sm font-medium text-slate-700">
                          Publikasikan Sekarang
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setIsEditingMaterial(false);
                          setCurrentMaterial(null);
                        }}
                        className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={saveMaterial}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        💾 Simpan Materi
                      </button>
                    </div>
                  </div>
                )}

                {/* List Materi */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">Daftar Materi ({materials.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {materials.map((material) => (
                      <div key={material.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              material.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {material.is_published ? '✓ Published' : 'Draft'}
                            </span>
                            {material.is_premium && (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">
                                👑 Premium
                              </span>
                            )}
                            <span className="text-xs text-slate-500">
                              {material.material_categories?.name}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-800">{material.title}</h4>
                          <p className="text-sm text-slate-500 mt-1">{material.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>⏱ {material.reading_time} menit</span>
                            <span>👁 {material.view_count || 0} views</span>
                            <span>📅 {new Date(material.created_at).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCurrentMaterial(material);
                              setMaterialForm({
                                category_id: material.category_id,
                                title: material.title,
                                description: material.description || '',
                                content: material.content || '',
                                youtube_url: material.youtube_url || '',
                                thumbnail_url: material.thumbnail_url || '',
                                reading_time: material.reading_time || 5,
                                is_premium: material.is_premium,
                                is_published: material.is_published
                              });
                              setIsEditingMaterial(true);
                            }}
                            className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteMaterial(material.id)}
                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
                          >
                            🗑 Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                    {materials.length === 0 && (
                      <div className="p-8 text-center text-slate-500">
                        Belum ada materi. Klik "Tambah Materi Baru" untuk memulai.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB DETAIL TRANSAKSI */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                {(() => {
                  const filteredTransactions = transactions.filter((tx) => {
                    if (!transactionSearchQuery.trim()) return true;
                    const q = transactionSearchQuery.toLowerCase().trim();
                    return (
                      (tx.unique_id || '').toLowerCase().includes(q) ||
                      (tx.customer_name || '').toLowerCase().includes(q) ||
                      (tx.customer_email || '').toLowerCase().includes(q) ||
                      (tx.customer_phone || '').toLowerCase().includes(q) ||
                      (tx.profiles?.full_name || '').toLowerCase().includes(q) ||
                      (tx.profiles?.email || '').toLowerCase().includes(q) ||
                      (tx.subscription_packages?.name || '').toLowerCase().includes(q) ||
                      (tx.status || '').toLowerCase().includes(q)
                    );
                  });

                  return (
                    <>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-1">Detail Transaksi</h2>
                          <p className="text-slate-500 text-xs md:text-sm">
                            Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Search Input Transaksi */}
                          <div className="relative min-w-[260px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={transactionSearchQuery}
                              onChange={(e) => setTransactionSearchQuery(e.target.value)}
                              placeholder="Cari Order ID, customer, email, paket..."
                              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
                            />
                            {transactionSearchQuery && (
                              <button
                                onClick={() => setTransactionSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                                title="Hapus pencarian"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <select
                            value={transactionFilter}
                            onChange={(e) => setTransactionFilter(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
                          >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="expired">Expired</option>
                          </select>

                          <button
                            onClick={fetchTransactions}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                          >
                            🔄 Refresh
                          </button>
                          <button
                            onClick={syncAllMemberSubscriptions}
                            className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                            title="Sinkronkan status subscription member dengan transaksi PAID"
                          >
                            ⚡ Sync Subscription Member
                          </button>
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <div className="text-sm text-slate-500 mb-1">Total Transaksi</div>
                          <div className="text-2xl font-bold text-slate-800">{transactions.length}</div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <div className="text-sm text-slate-500 mb-1">Pending</div>
                          <div className="text-2xl font-bold text-amber-600">
                            {transactions.filter(t => (t.status || '').toLowerCase() === 'pending').length}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <div className="text-sm text-slate-500 mb-1">Paid</div>
                          <div className="text-2xl font-bold text-green-600">
                            {transactions.filter(t => ['paid', 'success', 'settlement'].includes((t.status || '').toLowerCase())).length}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <div className="text-sm text-slate-500 mb-1">Total Pendapatan</div>
                          <div className="text-2xl font-bold text-blue-600">
                            Rp {transactions
                              .filter(t => ['paid', 'success', 'settlement'].includes((t.status || '').toLowerCase()))
                              .reduce((sum, t) => sum + (t.amount || 0), 0)
                              .toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>

                      {/* Tabel Transaksi */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Unique ID</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Tanggal</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Customer</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Paket</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Durasi</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Harga</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Status</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-600">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                  <td className="p-4">
                                    <div className="font-mono text-xs font-semibold text-blue-600">{tx.unique_id}</div>
                                  </td>
                                  <td className="p-4 text-sm text-slate-600">
                                    {new Date(tx.created_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="p-4">
                                    <div className="text-sm font-medium text-slate-800">
                                      {tx.profiles?.full_name || tx.customer_name || '-'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {tx.profiles?.email || tx.customer_email || '-'}
                                    </div>
                                  </td>
                                  <td className="p-4 text-sm text-slate-800">
                                    {tx.subscription_packages?.name || '-'}
                                  </td>
                                  <td className="p-4 text-sm text-slate-600">
                                    {tx.duration === 999 ? 'Lifetime' : `${tx.duration} Bulan`}
                                  </td>
                                  <td className="p-4">
                                    <div className="font-semibold text-slate-800">
                                      Rp {(tx.amount || 0).toLocaleString('id-ID')}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      ['paid', 'success', 'settlement'].includes((tx.status || '').toLowerCase()) ? 'bg-green-100 text-green-700' :
                                      (tx.status || '').toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                                      ['failed', 'expired', 'cancel'].includes((tx.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' :
                                      'bg-slate-100 text-slate-700'
                                    }`}>
                                      {tx.status?.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <button
                                      onClick={() => {
                                        setSelectedTransaction(tx);
                                        setShowTransactionModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      Detail
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {filteredTransactions.length === 0 && (
                                <tr>
                                  <td colSpan={8} className="p-8 text-center text-slate-500">
                                    {transactionSearchQuery ? (
                                      <div>
                                        <div className="text-3xl mb-2">🔍</div>
                                        <div className="font-semibold text-slate-700">Transaksi tidak ditemukan</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                          Tidak ada transaksi yang cocok dengan &quot;<span className="font-medium">{transactionSearchQuery}</span>&quot;
                                        </div>
                                        <button
                                          onClick={() => setTransactionSearchQuery('')}
                                          className="mt-3 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100"
                                        >
                                          Reset Pencarian
                                        </button>
                                      </div>
                                    ) : (
                                      'Belum ada transaksi'
                                    )}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Modal Detail Transaksi */}
                {showTransactionModal && selectedTransaction && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8">
                      
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-white">Detail Transaksi</h3>
                          <p className="text-blue-100 text-sm font-mono">{selectedTransaction.unique_id}</p>
                        </div>
                        <button
                          onClick={() => setShowTransactionModal(false)}
                          className="text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
                        >
                          ×
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
                        
                        {/* Info Utama */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-xs text-slate-500 mb-1">Tanggal Transaksi</div>
                            <div className="font-semibold text-slate-800">
                              {new Date(selectedTransaction.created_at).toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-xs text-slate-500 mb-1">Status</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                              ['paid', 'success', 'settlement'].includes((selectedTransaction.status || '').toLowerCase()) ? 'bg-green-100 text-green-700' :
                              (selectedTransaction.status || '').toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {selectedTransaction.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Info Customer */}
                        <div className="border-t border-slate-200 pt-4">
                          <h4 className="font-bold text-slate-800 mb-3">👤 Informasi Customer</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Nama:</span>
                              <span className="font-medium">{selectedTransaction.customer_name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Email:</span>
                              <span className="font-medium">{selectedTransaction.customer_email || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">No. HP:</span>
                              <span className="font-medium">{selectedTransaction.customer_phone || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Info Paket */}
                        <div className="border-t border-slate-200 pt-4">
                          <h4 className="font-bold text-slate-800 mb-3"> Detail Paket</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Paket:</span>
                              <span className="font-medium">{selectedTransaction.subscription_packages?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Durasi:</span>
                              <span className="font-medium">
                                {selectedTransaction.duration === 999 ? 'Lifetime' : `${selectedTransaction.duration} Bulan`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Harga:</span>
                              <span className="font-bold text-blue-600">
                                Rp {(selectedTransaction.amount || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Midtrans Response */}
                        {selectedTransaction.midtrans_response && (
                          <div className="border-t border-slate-200 pt-4">
                            <h4 className="font-bold text-slate-800 mb-3">💳 Response Midtrans</h4>
                            <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-auto max-h-40">
                              {JSON.stringify(selectedTransaction.midtrans_response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Footer - Update Status */}
                      <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-2">
                        {!['paid', 'success', 'settlement'].includes((selectedTransaction.status || '').toLowerCase()) && (
                          <button
                            onClick={() => updateTransactionStatus(selectedTransaction.id, 'paid')}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                          >
                            ✓ Tandai Paid
                          </button>
                        )}
                        {!['failed', 'expired', 'cancel'].includes((selectedTransaction.status || '').toLowerCase()) && (
                          <button
                            onClick={() => updateTransactionStatus(selectedTransaction.id, 'failed')}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700"
                          >
                            ✗ Tandai Failed
                          </button>
                        )}
                        <button
                          onClick={() => setShowTransactionModal(false)}
                          className="flex-1 border border-slate-300 py-2 rounded-lg font-medium hover:bg-slate-100"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB MANAJEMEN VOUCHER */}
            {activeTab === 'vouchers' && (
              <div className="space-y-6">
                {(() => {
                  const filteredVoucherBatches = voucherBatches.filter((batch) => {
                    if (!voucherSearchQuery.trim()) return true;
                    const q = voucherSearchQuery.toLowerCase().trim();
                    return (
                      (batch.purpose || '').toLowerCase().includes(q) ||
                      (batch.id || '').toLowerCase().includes(q)
                    );
                  });

                  return (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-1">Manajemen Voucher</h2>
                          <p className="text-slate-500 text-xs md:text-sm">
                            Menampilkan {filteredVoucherBatches.length} dari {voucherBatches.length} batch voucher
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Search Bar Voucher */}
                          <div className="relative min-w-[260px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={voucherSearchQuery}
                              onChange={(e) => setVoucherSearchQuery(e.target.value)}
                              placeholder="Cari keperluan promo atau Batch ID..."
                              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
                            />
                            {voucherSearchQuery && (
                              <button
                                onClick={() => setVoucherSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                                title="Hapus pencarian"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => setShowGenerateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Generate Voucher Baru
                          </button>
                        </div>
                      </div>

                      {/* List Riwayat Generate */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="p-4 text-left text-xs font-semibold text-slate-600">Tanggal Generate</th>
                              <th className="p-4 text-left text-xs font-semibold text-slate-600">Keperluan / Ranah</th>
                              <th className="p-4 text-center text-xs font-semibold text-slate-600">Jumlah Kode</th>
                              <th className="p-4 text-left text-xs font-semibold text-slate-600">Unique ID Batch</th>
                              <th className="p-4 text-center text-xs font-semibold text-slate-600">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredVoucherBatches.map((batch) => (
                              <tr key={batch.id} className="hover:bg-slate-50">
                                <td className="p-4 text-sm text-slate-600">
                                  {new Date(batch.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="p-4 text-sm font-medium text-slate-800">{batch.purpose}</td>
                                <td className="p-4 text-center">
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{batch.quantity} Kode</span>
                                </td>
                                <td className="p-4 text-xs font-mono text-slate-500">{batch.id}</td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => downloadBatchCSV(batch.id, batch.purpose)}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 mx-auto"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download CSV
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {filteredVoucherBatches.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                  {voucherSearchQuery ? (
                                    <div>
                                      <div className="text-3xl mb-2">🔍</div>
                                      <div className="font-semibold text-slate-700">Batch Voucher tidak ditemukan</div>
                                      <div className="text-xs text-slate-500 mt-1">
                                        Tidak ada batch yang cocok dengan kata kunci &quot;<span className="font-medium">{voucherSearchQuery}</span>&quot;
                                      </div>
                                      <button
                                        onClick={() => setVoucherSearchQuery('')}
                                        className="mt-3 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100"
                                      >
                                        Reset Pencarian
                                      </button>
                                    </div>
                                  ) : (
                                    'Belum ada riwayat generate voucher'
                                  )}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}

                {/* Modal Generate */}
                {showGenerateModal && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">Generate Voucher Baru</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Keperluan / Ranah Generate *</label>
                          <input type="text" value={voucherForm.purpose} onChange={e => setVoucherForm({...voucherForm, purpose: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="Contoh: Promo Lebaran 2026" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Kode</label>
                            <select value={voucherForm.codeType} onChange={e => setVoucherForm({...voucherForm, codeType: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm">
                              <option value="random">Random (Acak)</option>
                              <option value="custom">Custom (Spesifik)</option>
                            </select>
                          </div>
                          {voucherForm.codeType === 'custom' ? (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Kode Custom *</label>
                              <input type="text" value={voucherForm.customCode} onChange={e => setVoucherForm({...voucherForm, customCode: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm uppercase" placeholder="HARIRAYA2026" />
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Generate (1-200) *</label>
                              <input type="number" min="1" max="200" value={voucherForm.quantity} onChange={e => setVoucherForm({...voucherForm, quantity: parseInt(e.target.value) || 1})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Voucher *</label>
                            <select value={voucherForm.voucherType} onChange={e => setVoucherForm({...voucherForm, voucherType: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm">
                              <option value="percent">Diskon Persentase (%)</option>
                              <option value="fixed">Diskon Rupiah (Rp)</option>
                              <option value="free">Kelas Gratis (Full Access)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Voucher *</label>
                            <input type="number" min="0" value={voucherForm.value} onChange={e => setVoucherForm({...voucherForm, value: parseInt(e.target.value) || 0})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder={voucherForm.voucherType === 'percent' ? '20' : '50000'} disabled={voucherForm.voucherType === 'free'} />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Batas Maksimal Penggunaan per Kode *</label>
                          <select value={voucherForm.maxUses} onChange={e => setVoucherForm({...voucherForm, maxUses: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm">
                            <option value={1}>1 Kali Pakai (Single Use)</option>
                            <option value={10}>10 Kali Pakai</option>
                            <option value={50}>50 Kali Pakai</option>
                            <option value={100}>100 Kali Pakai</option>
                            <option value={9999}>Unlimited (Tanpa Batas)</option>
                          </select>
                          <p className="text-xs text-slate-500 mt-1">Jika 50, maka 1 kode yang sama bisa dipakai oleh 50 user berbeda.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowGenerateModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Batal</button>
                        <button onClick={handleGenerateVouchers} disabled={isGenerating} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                          {isGenerating ? 'Sedang Generate...' : 'Generate Voucher'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 11. TAB KELOLA BLOG */}
            {activeTab === 'blog' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Kelola Blog</h2>
                    <p className="text-slate-500">Buat artikel untuk meningkatkan SEO dan memberikan informasi</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBlog(null);
                      setBlogForm({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        category: 'Umum',
                        featured_image: '',
                        author_name: '',
                        is_published: false
                      });
                      setShowBlogModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tulis Artikel
                  </button>
                </div>

                {/* List Blog Posts */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 text-left text-xs font-semibold text-slate-600">Judul</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-600">Kategori</th>
                        <th className="p-4 text-center text-xs font-semibold text-slate-600">Status</th>
                        <th className="p-4 text-center text-xs font-semibold text-slate-600">Views</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-600">Tanggal</th>
                        <th className="p-4 text-center text-xs font-semibold text-slate-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blogPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <div className="font-medium text-slate-800">{post.title}</div>
                            <div className="text-xs text-slate-500">{post.slug}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              post.category === 'CPNS' ? 'bg-blue-100 text-blue-700' :
                              post.category === 'P3K' ? 'bg-green-100 text-green-700' :
                              post.category === 'Tips' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {post.category}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              post.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {post.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-center text-sm text-slate-600">{post.views || 0}</td>
                          <td className="p-4 text-sm text-slate-600">
                            {new Date(post.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditBlog(post)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(post.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {blogPosts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            Belum ada artikel. Klik "Tulis Artikel" untuk membuat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Modal Form Blog */}
                {showBlogModal && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">
                          {editingBlog ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                        </h3>
                        <button
                          onClick={() => setShowBlogModal(false)}
                          className="text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
                        >
                          ×
                        </button>
                      </div>

                      <form onSubmit={handleSaveBlog} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Judul Artikel *</label>
                            <input
                              type="text"
                              value={blogForm.title}
                              onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              placeholder="Contoh: Panduan Lengkap CPNS 2024"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                            <input
                              type="text"
                              value={blogForm.slug}
                              onChange={(e) => setBlogForm({...blogForm, slug: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              placeholder="panduan-lengkap-cpns-2024"
                            />
                            <p className="text-xs text-slate-500 mt-1">Kosongkan untuk auto-generate</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                            <select
                              value={blogForm.category}
                              onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                            >
                              <option value="Umum">Umum</option>
                              <option value="CPNS">CPNS</option>
                              <option value="P3K">P3K</option>
                              <option value="Tips">Tips</option>
                              <option value="Info">Info</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Penulis</label>
                            <input
                              type="text"
                              value={blogForm.author_name}
                              onChange={(e) => setBlogForm({...blogForm, author_name: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              placeholder="Nama penulis"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt (Ringkasan)</label>
                            <textarea
                              value={blogForm.excerpt}
                              onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})}
                              rows={2}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              placeholder="Ringkasan singkat artikel (untuk SEO dan preview)"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar Featured</label>
                            <input
                              type="text"
                              value={blogForm.featured_image}
                              onChange={(e) => setBlogForm({...blogForm, featured_image: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Konten Artikel *</label>
                            <textarea
                              value={blogForm.content}
                              onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                              rows={12}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                              placeholder="Tulis konten artikel di sini... (Support HTML)"
                              required
                            />
                            <p className="text-xs text-slate-500 mt-1">Anda bisa menggunakan tag HTML untuk formatting</p>
                          </div>

                          <div className="col-span-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_published"
                              checked={blogForm.is_published}
                              onChange={(e) => setBlogForm({...blogForm, is_published: e.target.checked})}
                              className="rounded border-slate-300"
                            />
                            <label htmlFor="is_published" className="text-sm font-medium text-slate-700">
                              Publish artikel sekarang (jika dicentang)
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                          <button
                            type="button"
                            onClick={() => setShowBlogModal(false)}
                            className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                          >
                            {editingBlog ? 'Update Artikel' : 'Simpan Artikel'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resellers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Manajemen Reseller</h2>
                    <p className="text-slate-500">Kelola reseller dan token mereka</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingReseller(null);
                      setResellerForm({
                        email: '',
                        password: '',
                        full_name: '',
                        reseller_code: '',
                        token_balance: 0
                      });
                      setShowResellerModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Reseller
                  </button>
                </div>

                {/* List Reseller */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 text-left text-xs font-semibold text-slate-600">Kode</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-600">Nama</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-600">Email</th>
                        <th className="p-4 text-center text-xs font-semibold text-slate-600">Token</th>
                        <th className="p-4 text-center text-xs font-semibold text-slate-600">Voucher Dibuat</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-600">Link Checkout</th>
                        <th className="p-4 text-center text-xs font-semibold text-slate-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resellers.map((reseller) => (
                        <tr key={reseller.id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <div className="font-mono font-bold text-purple-600 text-lg">{reseller.reseller_code}</div>
                            <div className="text-xs text-slate-500">
                              klinikcpns.com/r/{reseller.reseller_code}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-800">{reseller.full_name}</td>
                          <td className="p-4 text-sm text-slate-600">{reseller.email}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`font-bold text-lg ${
                                reseller.token_balance > 10 ? 'text-green-600' : 
                                reseller.token_balance > 0 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {reseller.token_balance}
                              </span>
                              <button
                                onClick={() => {
                                  const amount = prompt(`Tambah token untuk ${reseller.full_name}:\n(Masukkan angka positif untuk tambah, negatif untuk kurangi)`);
                                  if (amount !== null && !isNaN(parseInt(amount))) {
                                    handleAddTokens(reseller.id, reseller.token_balance, parseInt(amount));
                                  }
                                }}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                title="Tambah/Kurang Token"
                              >
                                ±
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">
                              {reseller.voucher_count}
                            </span>
                          </td>
                          <td className="p-4">
                            {reseller.checkout_link ? (
                              <a 
                                href={reseller.checkout_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline truncate block max-w-[200px]"
                              >
                                {reseller.checkout_link}
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum diset</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditReseller(reseller)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReseller(reseller.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {resellers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            Belum ada reseller
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Modal Tambah/Edit Reseller */}
                {showResellerModal && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">
                          {editingReseller ? 'Edit Reseller' : 'Tambah Reseller Baru'}
                        </h3>
                        <button
                          onClick={() => setShowResellerModal(false)}
                          className="text-white/80 hover:text-white text-2xl"
                        >
                          ×
                        </button>
                      </div>

                      <form onSubmit={handleSaveReseller} className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                          <input
                            type="text"
                            value={resellerForm.full_name}
                            onChange={(e) => setResellerForm({...resellerForm, full_name: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                          <input
                            type="email"
                            value={resellerForm.email}
                            onChange={(e) => setResellerForm({...resellerForm, email: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                            required
                            disabled={!!editingReseller}
                          />
                        </div>

                        {!editingReseller && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                            <input
                              type="password"
                              value={resellerForm.password}
                              onChange={(e) => setResellerForm({...resellerForm, password: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                              placeholder="Minimal 6 karakter"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Kode Reseller (5 karakter)</label>
                          <input
                            type="text"
                            value={resellerForm.reseller_code}
                            onChange={(e) => setResellerForm({...resellerForm, reseller_code: e.target.value.toUpperCase().slice(0, 5)})}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                            placeholder="Auto-generate jika kosong"
                            maxLength={5}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Token Balance *</label>
                          <input
                            type="number"
                            min="0"
                            value={resellerForm.token_balance}
                            onChange={(e) => setResellerForm({...resellerForm, token_balance: parseInt(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                            placeholder="0"
                          />
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                          <button
                            type="button"
                            onClick={() => setShowResellerModal(false)}
                            className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                          >
                            {editingReseller ? 'Update Reseller' : 'Buat Reseller'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MODAL DETAIL NILAI USER */}
      {showScoreModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white"> Detail Nilai User</h3>
                <p className="text-blue-100 text-sm mt-1">{selectedUser.full_name || selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowScoreModal(false)}
                className="text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
              >
                ×
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {isLoadingResults ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Memuat riwayat ujian...
                </div>
              ) : userExamResults.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-lg font-medium">User belum pernah mengerjakan try out</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                      <div className="text-3xl font-bold text-blue-700">{userExamResults.length}</div>
                      <div className="text-xs text-blue-600 mt-1">Total Ujian</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <div className="text-3xl font-bold text-green-700">
                        {userExamResults.filter(r => r.is_passed).length}
                      </div>
                      <div className="text-xs text-green-600 mt-1">Lulus</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                      <div className="text-3xl font-bold text-red-700">
                        {userExamResults.filter(r => !r.is_passed).length}
                      </div>
                      <div className="text-xs text-red-600 mt-1">Belum Lulus</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                      <div className="text-3xl font-bold text-purple-700">
                        {userExamResults.length > 0 
                          ? Math.round(userExamResults.reduce((acc, r) => acc + (r.skor_total || 0), 0) / userExamResults.length)
                          : 0
                        }
                      </div>
                      <div className="text-xs text-purple-600 mt-1">Rata-rata Skor</div>
                    </div>
                  </div>

                  {/* Table Hasil Ujian */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-left text-xs font-semibold text-slate-600">Paket Try Out</th>
                          <th className="p-3 text-left text-xs font-semibold text-slate-600">Tanggal</th>
                          <th className="p-3 text-center text-xs font-semibold text-slate-600">TWK</th>
                          <th className="p-3 text-center text-xs font-semibold text-slate-600">TIU</th>
                          <th className="p-3 text-center text-xs font-semibold text-slate-600">TKP</th>
                          <th className="p-3 text-center text-xs font-semibold text-slate-600">Total</th>
                          <th className="p-3 text-center text-xs font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userExamResults.map((result, index) => (
                          <tr key={result.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <div className="text-sm font-medium text-slate-800">
                                {result.tryout_packages?.name || 'Unknown Package'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {result.tryout_packages?.exam_type || '-'}
                              </div>
                            </td>
                            <td className="p-3 text-sm text-slate-600">
                              {new Date(result.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-sm font-semibold ${
                                (result.skor_twk || 0) >= 65 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.skor_twk || 0}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-sm font-semibold ${
                                (result.skor_tiu || 0) >= 80 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.skor_tiu || 0}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-sm font-semibold ${
                                (result.skor_tkp || 0) >= 166 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.skor_tkp || 0}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-sm font-bold text-blue-700">
                                {result.skor_total || 0}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                result.is_passed
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {result.is_passed ? '✓ LULUS' : 'BELUM LULUS'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowScoreModal(false)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Riwayat Order Member */}
      {showMemberOrderModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8">
            
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Riwayat Order</h3>
                <p className="text-green-100 text-sm">{selectedMember.full_name || selectedMember.email}</p>
              </div>
              <button
                onClick={() => setShowMemberOrderModal(false)}
                className="text-white/80 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedMemberOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-6xl mb-4">📭</div>
                  <p>Member ini belum pernah melakukan order</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-slate-800">{selectedMemberOrders.length}</div>
                      <div className="text-xs text-slate-500">Total Order</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {selectedMemberOrders.filter(o => ['paid', 'success', 'settlement'].includes((o.status || '').toLowerCase())).length}
                      </div>
                      <div className="text-xs text-green-600">Paid</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        Rp {selectedMemberOrders
                          .filter(o => ['paid', 'success', 'settlement'].includes((o.status || '').toLowerCase()))
                          .reduce((sum, o) => sum + (o.amount || 0), 0)
                          .toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-blue-600">Total Spend</div>
                    </div>
                  </div>

                  {/* List Order */}
                  <div className="space-y-2">
                    {selectedMemberOrders.map(order => (
                      <div key={order.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-mono text-xs text-blue-600 font-semibold">{order.unique_id}</div>
                            <div className="font-semibold text-slate-800 mt-1">
                              {order.subscription_packages?.name || 'Unknown Package'}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            ['paid', 'success', 'settlement'].includes((order.status || '').toLowerCase()) ? 'bg-green-100 text-green-700' :
                            (order.status || '').toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                          <div>
                            <div className="text-slate-500">Tanggal</div>
                            <div className="font-medium">
                              {new Date(order.created_at).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500">Durasi</div>
                            <div className="font-medium">
                              {order.duration === 999 ? 'Lifetime' : `${order.duration} Bulan`}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500">Harga</div>
                            <div className="font-bold text-blue-600">
                              Rp {(order.amount || 0).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowMemberOrderModal(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Semua Manfaat */}
      {showAllBenefitsModal && selectedPackageForBenefits && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{selectedPackageForBenefits.name}</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedPackageForBenefits.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowAllBenefitsModal(false)}
                  className="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <h4 className="font-semibold text-slate-800 mb-4">Semua Manfaat yang Didapatkan:</h4>
              <ul className="space-y-3">
                {(subBenefits[selectedPackageForBenefits.id] || []).map((benefit, index) => (
                  <li key={benefit.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700 pt-0.5">
                      {index + 1}. {benefit.benefit_text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowAllBenefitsModal(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
