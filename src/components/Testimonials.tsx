/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Testimonials() {
  return (
    <section className="bg-[#0f0f0f] py-32 px-4 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative text-center">
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-3xl p-8 relative">
            <Quote size={64} className="text-[#ffcc00] opacity-20 absolute -top-4 -left-4" />
            <span className="text-8xl font-black text-white/5 absolute -bottom-8 -right-8 leading-none">99</span>
            <div className="relative z-10">
              <h4 className="text-[#ffcc00] text-xs font-black uppercase tracking-[0.4em] mb-4">Serkan Malkoç</h4>
              <p className="text-2xl font-black text-[#0f0f0f] italic leading-relaxed tracking-tight">
                Radyo'da, YouTube'da, Kitap'ta her daim öncüydünüz. <br />
                Web sitesinde de yine öncüsünüz, yine başı <br />
                çekiyorsunuz, tebrikler.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation / Avatars */}
        <div className="flex items-center justify-center space-x-12">
          <button className="text-white/30 hover:text-[#ffcc00] transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex -space-x-4 items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`w-14 h-14 rounded-full border-4 border-[#0f0f0f] overflow-hidden transition-all duration-500 cursor-pointer ${i === 3 ? 'scale-125 z-10 border-[#ffcc00]' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
              >
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>

          <button className="text-white/30 hover:text-[#ffcc00] transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
