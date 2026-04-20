/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { Calendar, Eye, Heart, ChevronLeft, ChevronRight, Share2, Facebook, Twitter, Mail, MessageCircle, Star } from 'lucide-react';
import { dbService } from '../services/dbService';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { formatDate } from '../lib/utils';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const detail = await dbService.getBlogPostBySlug(slug);
          if (detail) {
            setPost(detail);
            // Increment view count
            updateDoc(doc(db, 'blogs', detail.id), {
              views: increment(1)
            }).catch(e => {
              if (e.code !== 'permission-denied') {
                console.error("View increment failed:", e);
              }
            });
          }
        }
        // Fetch recent posts for sidebar
        const allPosts = await dbService.getBlogPosts();
        setRecentPosts(allPosts.slice(0, 10));
      } catch (err) {
        console.error('Error fetching blog detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

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

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <Header />
        <main className="max-w-7xl mx-auto py-40 px-4 text-center">
          <h2 className="text-3xl font-black italic">Yazı bulunamadı.</h2>
          <Link to="/blog" className="text-[#ffcc00] mt-4 block underline">Blog'a dön</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#ffcc00] selection:text-black">
      <Header />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Anasayfa</Link>
          <ChevronRight size={12} className="text-gray-800" />
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <ChevronRight size={12} className="text-gray-800" />
          <span className="text-[#ffcc00] line-clamp-1">{post.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Left side on desktop */}
          <aside className="w-full lg:w-[350px] order-2 lg:order-1 space-y-12">
            
            {/* Son Yazılar */}
            <div>
              <div className="border-l-4 border-[#ffcc00] pl-6 mb-8">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Son <span className="text-gray-400">Yazılar</span></h3>
              </div>
              
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="divide-y divide-white/5">
                  {recentPosts.map((p) => (
                    <Link 
                      key={p.id} 
                      to={`/blog/${p.slug}`}
                      className={`block px-6 py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5 ${p.slug === slug ? 'text-[#ffcc00] bg-[#222222]/40' : 'text-gray-500 hover:text-white'}`}
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* VIP Member CTA Card */}
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
                  Artan yarış programlarından en verimli bir şekilde istifade ederek profesyonel destek almak istiyorsanız sizler de VIP Üye olabilirsiniz.
                </p>
                <div className="inline-block px-8 py-3 bg-[#ffcc00] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-[#ffcc00]/20">
                  Katılın
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Post Content - Main Area */}
          <div className="flex-1 order-1 lg:order-2">
            <article>
              {/* Featured Image with Title Overlap aesthetic */}
              <div className="relative rounded-[40px] overflow-hidden mb-8 shadow-2xl border border-white/10 group h-[400px] md:h-[500px]">
                <img 
                  src={post.image || `https://picsum.photos/seed/${post.id}/1200/800`} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                   <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center space-x-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                        <Calendar size={12} className="text-[#ffcc00]" />
                        <span>{formatDate(post.createdAt || Date.now(), { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                        <Eye size={12} className="text-[#ffcc00]" />
                        <span>{post.views || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                        <Heart size={12} className="text-[#ffcc00]" />
                        <span>{post.likes || 0}</span>
                      </div>
                   </div>
                   
                   <h1 className="text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter leading-[1.1] mb-2 uppercase drop-shadow-2xl">
                     {post.title}
                   </h1>
                   <p className="text-[#ffcc00] font-bold text-xs uppercase tracking-[0.3em]">Haberler ve Tahminler</p>
                </div>
              </div>

              {/* Content Body */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl">
                <div className="prose prose-invert max-w-none">
                  {/* Rich text container */}
                  <div className="text-gray-300 font-medium leading-loose text-lg space-y-8 whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>

                {/* Social Sharing - Matching screenshot color palette and order */}
                <div className="mt-16 pt-12 border-t border-white/5">
                   <div className="flex flex-wrap gap-2 items-center">
                      <button className="flex items-center space-x-2 bg-[#3b5998] hover:bg-[#3b5998]/90 text-white px-5 py-2 rounded font-bold text-[11px] transition-all">
                        <Facebook size={14} fill="white" />
                        <span>Paylaş</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 bg-black hover:bg-gray-900 border border-white/10 text-white px-5 py-2 rounded font-bold text-[11px] transition-all">
                        <Twitter size={14} fill="white" />
                        <span>Post</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 bg-[#f8f9fa] text-[#333] hover:bg-white px-5 py-2 rounded font-bold text-[11px] transition-all border border-gray-200">
                        <Mail size={14} />
                        <span>E-posta</span>
                      </button>

                      <button className="flex items-center space-x-2 bg-[#25d366] hover:bg-[#25d366]/90 text-white px-5 py-2 rounded font-bold text-[11px] transition-all">
                        <MessageCircle size={14} fill="white" />
                        <span>Paylaş</span>
                      </button>

                      <button className="flex items-center space-x-2 bg-[#25d366] hover:bg-[#25d366]/90 text-white px-5 py-2 rounded font-bold text-[11px] transition-all">
                        <Share2 size={14} />
                        <span>Paylaş</span>
                      </button>
                   </div>
                </div>
              </div>

              {/* Related/Next section indicator if needed */}
              <div className="mt-12 flex justify-between items-center">
                 <Link to="/blog" className="flex items-center space-x-3 text-gray-500 hover:text-[#ffcc00] transition-colors group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Tüm Yazılar</span>
                 </Link>
                 <div className="h-px flex-1 mx-12 bg-white/5 hidden md:block" />
                 <Link to="/vip" className="text-[#ffcc00] text-xs font-black uppercase tracking-widest border-b border-[#ffcc00]/20 pb-1 hover:border-[#ffcc00] transition-all">
                    VIP Kazanmaya Başla
                 </Link>
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

