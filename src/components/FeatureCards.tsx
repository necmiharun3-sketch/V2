/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Apple, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_LOGO_URL } from '../constants';

export default function FeatureCards() {
  const cards = [
    {
      title: "Vip Üye Olun",
      desc: "Türkiye'nin En İyi At Yarışı Sitesi ALTILIYAKALATANADAM.com'a Hemen Üye Olun",
      image: APP_LOGO_URL,
      hasRightArrow: true,
      hasBottomYellow: false,
    },
    {
      title: "Cazip Bankoları Alın",
      desc: "Banko Tahminleri Alın Sıradışı Teklerle Ayrıcalığı Yaşayın",
      image: APP_LOGO_URL,
      hasRightArrow: false,
      hasBottomYellow: true,
    },
    {
      title: "ALTILIYAKALATANADAM",
      desc: "ALTILIYAKALATANADAM.com Farkı İle Altılı Ganyanı Yakalama Oranınızı Artırın",
      image: APP_LOGO_URL,
      hasRightArrow: false,
      hasBottomYellow: false,
    }
  ];

  return (
    <section className="relative bg-[#0f0f0f] pt-24 pb-12 px-4 overflow-hidden">
      {/* Background Horse Image fading to right */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-full md:w-1/2 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"
        style={{ 
          backgroundImage: 'url("https://picsum.photos/seed/horseraceaction/1920/1080")',
          maskImage: 'linear-gradient(to right, black 10%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 10%, transparent 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title and Description Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8 lg:gap-16">
          <div className="flex items-center whitespace-nowrap">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex items-end">
              <span className="font-extrabold relative pb-1 mr-2 inline-block">
                Kazanmanın
                {/* Yellow underline just under "Kazanmanın" */}
                <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#ffcc00]"></span>
              </span>
              <span className="font-light">Gidiş Hattı</span>
            </h2>
          </div>
          <div className="flex-1 border-l-[3px] border-[#ffcc00]/30 pl-8 h-full flex items-center md:max-w-xl">
            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed">
              Deneyimli at yarışı uzmanlarının tahminlerini takip edin ve kazanma şansınızı artırın.
            </p>
          </div>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {cards.map((card, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="relative flex flex-col items-center text-center px-6 py-12 bg-[#0c121c] rounded-2xl shadow-2xl group border border-transparent hover:border-white/5 transition-all"
            >
              {/* Optional Right Arrow Element (CSS Triangle) */}
              {card.hasRightArrow && (
                <div className="hidden md:block absolute -right-7 top-1/2 -translate-y-1/2 z-20">
                  <div className="w-0 h-0 border-t-[24px] border-t-transparent border-l-[28px] border-l-[#09355c] border-b-[24px] border-b-transparent drop-shadow-md"></div>
                </div>
              )}

              {/* Optional Bottom Right Yellow Triangle */}
              {card.hasBottomYellow && (
                <div className="absolute right-0 bottom-0 z-20 rounded-br-2xl overflow-hidden">
                  <div className="w-0 h-0 border-b-[36px] border-b-[#ffcc00] border-l-[36px] border-l-transparent"></div>
                </div>
              )}

              {/* Irregular Blob Image Mask */}
              <div className="relative w-40 h-40 mb-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-500 shadow-inner" 
                style={{ borderRadius: '48% 52% 43% 57% / 46% 51% 49% 54%' }}
              >
                <img 
                  src={card.image} 
                  alt={card.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight">{card.title}</h3>
              <p className="text-gray-400 text-xs md:text-sm max-w-[240px] leading-relaxed font-medium">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* App Links (Right Aligned, Bottom) */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4">
          <a href="#" className="flex items-center space-x-3 bg-black/50 hover:bg-black/80 px-5 py-3 rounded-xl border border-white/10 transition-all hover:scale-105 group">
            <Apple size={24} className="text-white group-hover:text-[#ffcc00] transition-colors" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-400 font-medium">Download on the</span>
              <span className="text-sm font-bold text-white leading-tight">App Store</span>
            </div>
          </a>
          <a href="#" className="flex items-center space-x-3 bg-black/50 hover:bg-black/80 px-5 py-3 rounded-xl border border-white/10 transition-all hover:scale-105 group">
            <Smartphone size={24} className="text-white group-hover:text-[#ffcc00] transition-colors" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-gray-400 font-medium">GET IT ON</span>
              <span className="text-sm font-bold text-white leading-tight">Google Play</span>
            </div>
          </a>
          
          {/* Scroll Up Button Placeholder (as seen on the far right in screenshot) */}
          <button className="hidden sm:flex ml-4 w-10 h-10 bg-[#0a0f18] hover:bg-[#222222] border border-white/10 rounded-full items-center justify-center transition-colors">
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 7L7 1L13 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
