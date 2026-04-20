/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { APP_LOGO_URL } from '../constants';
import { ChevronRight, ChevronLeft, Eye, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';

export default function Predictions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await dbService.getPredictions('current');
        setPredictions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const isVip = profile?.isVip || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto py-20 px-4">
        {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-l-4 border-[#ffcc00] pl-8 gap-6">
            <div className="flex items-center space-x-6">
              <img 
                src={APP_LOGO_URL} 
                alt="Güncel Tahminler" 
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">
                  Güncel <span className="text-gray-400">Tahminler</span>
                </h1>
              </div>
            </div>
            <div className="max-w-md text-xs md:text-sm text-gray-500 font-medium">
              At yarışı tutkunları için en güncel analizler, ALTILIYAKALATANADAM tahminleri ve yarış öncesi stratejiler için VIP üye olmayı unutmayın!
            </div>
          </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffcc00]"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {predictions.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-[#0a0a0a] rounded-[40px] border border-white/5">
                  <p className="text-gray-500 italic">Henüz güncel tahmin bulunmuyor.</p>
                </div>
              ) : (
                predictions.map((pred, idx) => (
                  <motion.div 
                    key={pred.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (idx % 2) * 0.1 }}
                    onClick={() => navigate(`/tahmin/${pred.slug}`)}
                    className="bg-[#0a0a0a] rounded-3xl md:rounded-[40px] p-6 border border-white/5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center group cursor-pointer hover:border-[#ffcc00]/30 transition-all relative overflow-hidden"
                  >
                    {!pred.isPublic && !isVip && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <Lock size={32} className="text-[#ffcc00] mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffcc00]">VIP Kilitli</span>
                          </div>
                      </div>
                    )}
                    <div className="w-full sm:w-1/3 overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-0 sm:mr-8 relative aspect-square sm:aspect-auto">
                      <img 
                        src={pred.image || 'https://picsum.photos/seed/horse/300/300'} 
                        alt={pred.authorName || 'ALTILIYAKALATANADAM'} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="w-full sm:w-2/3 flex flex-col justify-center">
                      <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-[#ffcc00] tracking-widest mb-3">
                        <Eye size={12} />
                        <span>{pred.views || 0} Görüntülenme</span>
                      </div>
                      <h3 className="text-xl font-black italic mb-3 leading-tight tracking-tight group-hover:text-[#ffcc00] transition-colors uppercase">
                        {pred.title}
                      </h3>
                      <p className="text-[#ffcc00] text-xs font-black italic mb-6">
                        {pred.subTitle}
                      </p>

                      {pred.ayaklar && pred.ayaklar.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                           {pred.ayaklar.slice(0, 4).map((a: string, i: number) => (
                             <div key={i} className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg flex items-center space-x-1">
                               <span className="text-[7px] font-black text-[#ffcc00] uppercase">{i + 1}.A:</span>
                               <span className="text-[9px] font-bold text-gray-300 truncate max-w-[30px]">{a}</span>
                             </div>
                           ))}
                           {pred.ayaklar.length > 4 && (
                             <div className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                               <span className="text-[8px] font-black text-gray-500">+{pred.ayaklar.length - 4}</span>
                             </div>
                           )}
                        </div>
                      )}

                      <div className="flex flex-col border-t border-white/5 pt-4">
                        <span className="text-sm font-black italic uppercase tracking-tight">{pred.authorName || 'ALTILIYAKALATANADAM'}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">At Yarışı Tahmincisi & Yarış Yazarı</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
