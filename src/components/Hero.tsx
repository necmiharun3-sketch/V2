/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative w-full h-[600px] overflow-hidden bg-[#0a0a0a]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 scale-110 hover:scale-100"
        style={{ backgroundImage: 'url("https://picsum.photos/seed/horserace/1920/1080")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto h-full flex items-center px-4">
        {/* Experience Box (Floating left) */}
        <div className="absolute left-4 bottom-20 flex items-center bg-[#ffcc00] rounded-xl overflow-hidden shadow-2xl z-20">
          <div className="flex flex-col items-center justify-center p-6 text-white border-r border-[#d35400]">
            <span className="text-5xl font-black leading-none">18</span>
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Yıllık Deneyim</span>
          </div>
          <div className="flex flex-col p-2 space-y-1">
            <button className="p-2 hover:bg-white/10 rounded transition-colors">
              <ChevronRight size={16} className="text-white" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded transition-colors">
              <ChevronLeft size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl bg-black/40 backdrop-blur-md p-10 rounded-[40px] border border-white/10"
        >
          <span className="inline-block px-4 py-1 bg-[#ffcc00] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 italic">
            ALTILIYAKALATANADAM'dan
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tighter">
            ALTILIYAKALATANADAM'dan Yine Büyük <br />
            <span className="text-white">İkramiye</span> <span className="text-[#ffcc00]">511.589,37 TL</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 font-medium">
            Kazanmanın gidiş hattını takip edin, profesyonel at yarışı tahminleri ile şansınızı artırın.
          </p>
          
          <div className="flex items-center space-x-4">
            <button className="bg-[#ffcc00] hover:bg-white hover:text-black text-black px-8 py-4 rounded-full font-black uppercase tracking-wider text-xs flex items-center space-x-3 transition-all transform hover:scale-105 shadow-xl">
              <span>Hemen Başla</span>
              <ChevronRight size={18} />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all border border-white/20">
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Hero Navigation Dots */}
      <div className="absolute bottom-8 right-8 flex space-x-2">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all ${i === 1 ? 'bg-[#ffcc00] w-8' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </section>
  );
}
