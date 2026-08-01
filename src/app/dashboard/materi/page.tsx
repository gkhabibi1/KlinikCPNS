'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import MemberLayout from '../../../components/MemberLayout';

const supabase = createClient();

export default function MateriPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        const { data: catData } = await supabase
          .from('material_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        if (catData) setCategories(catData);

        const { data: matData } = await supabase
          .from('materials')
          .select('*, material_categories(name)')
          .eq('is_published', true)
          .order('display_order');
        
        if (matData) setMaterials(matData);

        const { data: progressData } = await supabase
          .from('user_material_progress')
          .select('material_id, is_completed')
          .eq('user_id', user.id);
        
        if (progressData) {
          const progressMap: Record<string, boolean> = {};
          progressData.forEach((p: { material_id: string; is_completed: boolean }) => {
            progressMap[p.material_id] = p.is_completed;
          });
          setUserProgress(progressMap);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const markAsCompleted = async (materialId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_material_progress')
      .upsert({
        user_id: user.id,
        material_id: materialId,
        is_completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,material_id' });

    setUserProgress((prev: Record<string, boolean>) => ({ ...prev, [materialId]: true }));
  };

  const filteredMaterials = materials.filter(mat => {
    const matchCategory = !selectedCategory || mat.category_id === selectedCategory;
    const matchSearch = !searchQuery || 
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Materi Pembelajaran</h1>
        <p className="text-slate-600 text-sm">Pelajari materi lengkap untuk persiapan CPNS & P3K</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Cari materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua ({materials.length})
        </button>
        
        {categories.map(cat => {
          const count = materials.filter(m => m.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(
                selectedCategory === cat.id ? null : cat.id
              )}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid Materi */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">Tidak ada materi yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map(material => (
            <div
              key={material.id}
              onClick={() => {
                setSelectedMaterial(material);
                setShowDetailModal(true);
              }}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {material.thumbnail_url ? (
                  <img 
                    src={material.thumbnail_url} 
                    alt={material.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {material.is_premium && (
                    <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                  {userProgress[material.id] && (
                    <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      Selesai
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {material.material_categories?.name || 'Umum'}
                </div>
                
                <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm">
                  {material.title}
                </h3>
                
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                  {material.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{material.reading_time || 5} menit baca</span>
                  <span>{material.view_count || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Materi */}
      {showDetailModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl my-8">
            
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {selectedMaterial.material_categories?.name || 'Umum'}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{selectedMaterial.title}</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 transition"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Info */}
              <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
                <span>{selectedMaterial.reading_time || 5} menit baca</span>
                <span>{selectedMaterial.view_count || 0} views</span>
                {selectedMaterial.is_premium && (
                  <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 font-semibold">
                    Premium
                  </span>
                )}
                {userProgress[selectedMaterial.id] && (
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                    Selesai
                  </span>
                )}
              </div>

              {/* YouTube */}
              {selectedMaterial.youtube_url && (
                <div className="aspect-video bg-slate-900 rounded-lg mb-6 overflow-hidden">
                  <iframe
                    src={selectedMaterial.youtube_url.replace('watch?v=', 'embed/')}
                    title={selectedMaterial.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Deskripsi */}
              {selectedMaterial.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">Deskripsi</h4>
                  <p className="text-slate-600 text-sm">{selectedMaterial.description}</p>
                </div>
              )}

              {/* Konten */}
              {selectedMaterial.content && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 text-sm">Konten Materi</h4>
                  <div className="bg-slate-50 rounded-lg p-6 text-sm">
                    <Latex>{selectedMaterial.content}</Latex>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-sm"
              >
                Tutup
              </button>
              
              {!userProgress[selectedMaterial.id] ? (
                <button
                  onClick={() => {
                    markAsCompleted(selectedMaterial.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Tandai Selesai
                </button>
              ) : (
                <span className="text-green-600 font-medium text-sm">Sudah Selesai</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </MemberLayout>
  );
}
