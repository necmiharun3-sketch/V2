/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { formatDate } from '../lib/utils';

export default function LatestPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await dbService.getBlogPosts();
        setPosts(data.slice(0, 3)); // show top 3
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <section className="relative py-32 px-4 overflow-hidden bg-[#0a0a0a]">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url("https://picsum.photos/seed/horseracingjockey/1920/1080?blur=2")' }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
          y: [0, -10, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0f0f0f]/80 to-[#0f0f0f]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-l-4 border-[#ffcc00] pl-8">
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 underline decoration-[#ffcc00] decoration-4 underline-offset-8">
              Son <span className="text-gray-400">Yazılar</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-gray-400 text-sm font-medium">
              At yarışı tutkunları için en güncel analizler ve ALTILIYAKALATANADAM hakkında tüm merak ettikleriniz!
            </p>
          </div>
        </div>

        {loading ? (
           <div className="text-center py-20 text-gray-500 italic">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.length === 0 ? (
               <div className="col-span-3 text-center text-gray-500 italic">Henüz blog yazısı bulunmuyor.</div>
            ) : (
              posts.map((post, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl border border-white/5 group cursor-pointer"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src={post.image || `https://picsum.photos/seed/${post.id}/600/400`} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center space-x-2 text-[#ffcc00] mb-4">
                        <Calendar size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                           {formatDate(post.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white mb-4 line-clamp-2 leading-tight tracking-tight group-hover:text-[#ffcc00] transition-colors uppercase italic">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-sm font-medium line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {post.content?.substring(0, 100)}...
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}

