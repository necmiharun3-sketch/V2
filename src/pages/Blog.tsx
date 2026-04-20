/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { ChevronRight, Calendar, Eye, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { formatDate } from '../lib/utils';

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await dbService.getBlogPosts();
        setBlogPosts(data);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#ffcc00] selection:text-black">
      <Header />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Anasayfa</Link>
          <ChevronRight size={12} className="text-gray-800" />
          <span className="text-[#ffcc00]">Blog</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-[350px] space-y-12">
            <div>
              <div className="border-l-4 border-[#ffcc00] pl-6 mb-8">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Son <span className="text-gray-400">Yazılar</span></h3>
              </div>
              
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="divide-y divide-white/5">
                  {blogPosts.slice(0, 10).map((p) => (
                    <Link 
                      key={p.id} 
                      to={`/blog/${p.slug}`}
                      className="block px-6 py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all hover:bg-white/5"
                    >
                      {p.title}
                    </Link>
                  ))}
                  {blogPosts.length === 0 && <div className="p-6 text-gray-600 italic text-xs uppercase tracking-widest">Yazı bulunamadı</div>}
                </div>
              </div>
            </div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-[#191919]/80 border border-white/5 rounded-[40px] p-8 text-center shadow-2xl relative overflow-hidden group cursor-pointer"
              onClick={() => navigate('/vip')}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#ffcc00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Star size={32} className="text-[#ffcc00]" />
                </div>
                <h4 className="text-xl font-black italic mb-2">Vip Üye Olun</h4>
                <p className="text-gray-500 text-[10px] leading-relaxed font-bold uppercase tracking-widest mb-6">
                  Profesyonel destek ve günlük analizler için VIP Üye olabilirsiniz.
                </p>
                <div className="inline-block px-8 py-3 bg-[#ffcc00] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Katılın
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Blog Grid */}
          <div className="flex-1">
            <div className="border-l-4 border-[#ffcc00] pl-8 mb-12">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                Güncel <span className="text-gray-400 font-bold">Blog</span>
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffcc00]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts.map((post, idx) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 2) * 0.1 }}
                    className="bg-[#0a0a0a] rounded-[40px] overflow-hidden border border-white/5 shadow-2xl group cursor-pointer flex flex-col"
                  >
                    <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                      <div className="h-64 overflow-hidden relative">
                        <img 
                          src={post.image || `https://picsum.photos/seed/${post.id}/600/400`} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
                      </div>
                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 text-[#ffcc00]">
                            <Calendar size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {formatDate(post.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Eye size={14} className="text-[#ffcc00]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{post.views || 0}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 line-clamp-2 leading-tight tracking-tight group-hover:text-[#ffcc00] transition-colors uppercase italic">
                          {post.title}
                        </h3>
                        <p className="text-gray-500 text-xs font-medium line-clamp-3 leading-relaxed mb-6">
                          {post.content?.substring(0, 150)}...
                        </p>
                        <div className="mt-auto pt-4 border-t border-white/5 text-[#ffcc00] text-[10px] font-black uppercase tracking-widest">
                          Devamını Oku
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {blogPosts.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center bg-[#0a0a0a] rounded-[40px] border border-white/5 text-gray-600 uppercase font-black tracking-widest italic">
                        Henüz yazı paylaşılmadı.
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

