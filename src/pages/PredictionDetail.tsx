/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Comments from '../components/Comments';
import { motion } from 'motion/react';
import { Calendar, ThumbsUp, Heart, Eye, Lock, MessageCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function PredictionDetail() {
  const { slug } = useParams();
  const { profile } = useAuth();
  const [prediction, setPrediction] = useState<any>(null);
  const [sidebarTahminler, setSidebarTahminler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const detail = await dbService.getPredictionBySlug(slug);
          if (detail) {
            setPrediction(detail);
            // Increment view count (non-blocking)
            updateDoc(doc(db, 'predictions', detail.id), {
              views: increment(1)
            }).catch(e => {
              // Silently ignore permission errors for view increments
              if (e.code !== 'permission-denied') {
                console.error("View increment failed:", e);
              }
            });
          }
        }
        const current = await dbService.getPredictions('current');
        setSidebarTahminler(current);
      } catch (err) {
        console.error('Error fetching prediction detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const isVip = profile?.isVip || profile?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <Header />
        <main className="max-w-7xl mx-auto py-40 px-4 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffcc00]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <Header />
        <main className="max-w-7xl mx-auto py-40 px-4 text-center">
          <h2 className="text-3xl font-black italic">Tahmin bulunamadı.</h2>
          <Link to="/tahminler" className="text-[#ffcc00] mt-4 block underline">Tüm tahminlere dön</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const showContent = prediction.isPublic || isVip || prediction.type === 'success';

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar: Nav & Prediction List */}
          <aside className="w-full lg:w-1/4 space-y-8">
            <div className="flex flex-col items-center p-6 bg-[#0a0a0a] border border-white/5 rounded-3xl">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-[#ffcc00]">
                <img 
                    src={prediction.image || "https://i.pravatar.cc/300?u=altili"} 
                    alt="Author" 
                    className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-black uppercase text-center">{prediction.authorName || 'ALTILIYAKALATANADAM'}</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center mt-1">At Yarışı Tahmincisi & Yazarı</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 bg-black/20 text-xs font-black uppercase tracking-widest text-center">Güncel Tahminler</div>
              <div className="divide-y divide-white/5">
                {sidebarTahminler.map((t, i) => (
                  <Link 
                    key={i} 
                    to={`/tahmin/${t.slug}`}
                    className="block px-6 py-4 text-xs font-bold text-gray-400 hover:text-[#ffcc00] hover:bg-white/5 transition-all"
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content: Detail */}
          <div className="flex-1 bg-[#0a0a0a]/50 border border-white/5 p-6 md:p-10 rounded-3xl shadow-2xl">
             <div className="flex items-center space-x-4 mb-6 text-xs text-gray-500 font-bold">
                 <div className="flex items-center space-x-1">
                    <Calendar size={14} className="text-[#ffcc00]" />
                    <span>{prediction.createdAt?.toDate ? prediction.createdAt.toDate().toLocaleDateString('tr-TR') : '...'}</span>
                 </div>
                 <div className="flex items-center space-x-1">
                    <Eye size={14} className="text-[#ffcc00]" />
                    <span>{prediction.views || 0}</span>
                 </div>
             </div>

             <h1 className="text-2xl md:text-3xl font-black italic mb-8 uppercase leading-tight">
               {prediction.title}
             </h1>

             {prediction.subTitle && (
                <div className="bg-[#ffcc00]/10 border-l-4 border-[#ffcc00] text-sm p-4 mb-8 font-bold italic">
                   {prediction.subTitle}
                </div>
             )}

             <div className="relative">
                <div className={`text-sm md:text-base text-gray-300 leading-relaxed ${!showContent ? 'blur font-mono opacity-30 select-none' : ''}`}>
                    
                    {/* Show Horse Race Features if any */}
                    {showContent && prediction.ayaklar && prediction.ayaklar.length > 0 && (
                      <div className="mb-8 w-full overflow-x-auto rounded-xl border border-[#ffcc00] relative bg-[#000000] custom-scrollbar">
                        {/* Background Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03] overflow-hidden">
                           <span className="text-white font-black text-6xl md:text-8xl -rotate-12 whitespace-nowrap">ALTILIYAKALATANADAM.COM</span>
                        </div>

                        <div className="relative z-10">
                          <div className="bg-[#191919] flex flex-col justify-center items-center py-3 border-b border-[#ffcc00]/30">
                            <span className="text-[#ffcc00] font-black tracking-widest text-lg md:text-xl uppercase">ALTILIYAKALATANADAM</span>
                            <span className="text-white font-bold tracking-widest text-xs md:text-sm uppercase mt-1">
                              {prediction.track ? `${prediction.track} ` : ''}AGF TABLOSU
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-[#ffcc00]/30 text-center min-w-full md:min-w-[500px]">
                            {prediction.ayaklar.slice(0, 6).map((a: string, i: number) => {
                              const horseLines = typeof a === 'string' ? a.split('\n').map(line => line.trim()).filter(Boolean) : [];
                              return (
                                <div key={i} className="flex flex-col">
                                  <div className="bg-[#ffcc00] text-black text-center py-1 text-xs md:text-sm font-black border-b border-[#191919]">
                                    {i + 1}. AYAK
                                  </div>
                                  <div className="bg-[#191919] text-white text-center py-0.5 text-[10px] md:text-xs font-bold shadow-inner border-b border-white/5">
                                    AT NO
                                  </div>
                                  <div className="flex flex-col p-2 space-y-2 flex-1 bg-transparent">
                                    {horseLines.map((line, idx) => (
                                      <div key={idx} className="flex items-center space-x-2 text-xs md:text-sm relative z-20">
                                        <span className="font-bold text-white w-4 text-right shrink-0">{idx + 1}</span>
                                        <span className={`font-bold tabular-nums truncate ${idx === 0 ? 'text-[#ffcc00]' : 'text-gray-300'}`}>{line}</span>
                                      </div>
                                    ))}
                                    {horseLines.length === 0 && (
                                      <div className="text-gray-600 text-xs text-center italic py-2 relative z-20">Belirtilmedi</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {showContent && prediction.fiyat && (
                      <div className="mb-8 p-4 bg-[#ffcc00]/20 border border-[#ffcc00]/50 rounded-xl inline-block">
                         <span className="text-xs font-black uppercase text-[#ffcc00]">Şablon Tutarı: </span>
                         <span className="font-black text-white italic ml-2">{prediction.fiyat}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap break-all text-gray-300 leading-relaxed min-h-[100px]">{prediction.content}</div>
                </div>

                {!showContent && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="bg-black/90 p-8 rounded-2xl border border-[#ffcc00]/20 text-center">
                        <Lock size={40} className="text-[#ffcc00] mx-auto mb-4" />
                        <h4 className="font-bold mb-2">İçerik Kilitli</h4>
                        <a href="https://wa.me/905336711463" target="_blank" rel="noreferrer" className="text-[#ffcc00] font-black underline text-sm uppercase">VIP Üye Ol</a>
                    </div>
                  </div>
                )}
             </div>

             {/* Comments Section - Only if enabled by admin */}
             {prediction.commentsEnabled !== false && (
                <div className="mt-12 pt-8 border-t border-white/5">
                   <h3 className="text-xl font-black italic uppercase mb-8 flex items-center space-x-3">
                      <MessageCircle size={24} className="text-[#ffcc00]" />
                      <span>Kullanıcı Yorumları</span>
                   </h3>
                   <Comments predictionId={prediction.id} />
                </div>
             )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
