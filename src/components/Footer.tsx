/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Facebook, Twitter, Youtube, Instagram, Star, CreditCard, Send, Apple, Smartphone, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_LOGO_URL } from '../constants';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#191919] relative border-t border-white/5">
      {/* Top Yellow Section (Main Content) */}
      <div className="bg-[#ffcc00] pt-12 pb-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-black">
            {/* Column 1: ALTILIYAKALATANADAM */}
            <div className="bg-black/10 p-8 rounded-[32px] border border-black/5 flex flex-col">
              <h4 className="text-lg font-black text-black italic mb-8 border-b-2 border-black/20 inline-block pb-2 pr-4 uppercase">ALTILIYAKALATANADAM</h4>
              <ul className="space-y-4">
                <li><Link to="/kurumsal/hakkimizda" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">Hakkında</Link></li>
                <li><Link to="/tahminler" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">Güncel Tahminler</Link></li>
                <li><Link to="/basarili-tahminler" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">Başarılı Tahminler</Link></li>
                <li><Link to="/blog" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">Blog</Link></li>
              </ul>
            </div>

            {/* Column 2: Destek */}
            <div className="bg-black/10 p-8 rounded-[32px] border border-black/5 flex flex-col">
              <h4 className="text-lg font-black text-black italic mb-8 border-b-2 border-black/20 inline-block pb-2 pr-4 uppercase">Destek</h4>
              <ul className="space-y-4">
                <li><Link to="/vip" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">Nasıl Vip Üye Olurum?</Link></li>
                <li><Link to="/kurumsal/reklam" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">Reklam</Link></li>
                <li><Link to="/kurumsal/yardim" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">Yardım</Link></li>
                <li><Link to="/iletisim" className="text-black/60 hover:text-black transition-colors text-xs font-black uppercase">İletişim</Link></li>
              </ul>
            </div>

            {/* Column 3: Üyelik */}
            <div className="bg-black/10 p-8 rounded-[32px] border border-black/5 flex flex-col">
              <h4 className="text-lg font-black text-black italic mb-8 border-b-2 border-black/20 inline-block pb-2 pr-4 uppercase">Üyelik</h4>
              <div className="space-y-4">
                <Link to="/vip" className="flex items-start space-x-3 bg-black/5 p-4 rounded-2xl border border-black/5 hover:bg-black/10 transition-all group">
                  <Star size={16} className="text-black group-hover:scale-125 transition-transform" />
                  <div className="flex flex-col">
                    <span className="text-black text-xs font-black italic">Vip Üyelik</span>
                    <span className="text-[9px] text-black/60 font-bold uppercase tracking-tight">Hemen Üye Olun</span>
                  </div>
                </Link>
                <Link to="/odeme-bildirimi" className="flex items-start space-x-3 bg-black/5 p-4 rounded-2xl border border-black/5 hover:bg-black/10 transition-all group">
                  <CreditCard size={16} className="text-black group-hover:scale-125 transition-transform" />
                  <div className="flex flex-col">
                    <span className="text-black text-xs font-black italic">Ödeme Bildirimi</span>
                    <span className="text-[10px] text-black/60 font-bold uppercase tracking-tight">Formu Doldurun</span>
                  </div>
                </Link>
                <a href="https://wa.me/905336711463" target="_blank" rel="noreferrer" className="flex items-start space-x-3 bg-black/5 p-4 rounded-2xl border border-black/5 hover:bg-black/10 transition-all group">
                  <Send size={16} className="text-black group-hover:scale-125 transition-transform" />
                  <div className="flex flex-col">
                    <span className="text-black text-xs font-black italic">WhatsApp Destek</span>
                    <span className="text-[9px] text-black/60 font-bold tracking-tight">90 533 671 14 63</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Column 4: Sosyal Medya */}
            <div className="bg-black/10 p-8 rounded-[32px] border border-black/5 flex flex-col">
              <h4 className="text-lg font-black text-black italic mb-8 border-b-2 border-black/20 inline-block pb-2 pr-4 uppercase">Sosyal Medya</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center space-x-4 text-black/60 hover:text-black transition-colors group">
                    <Facebook size={18} className="group-hover:scale-110 transition-all" />
                    <span className="text-xs font-black uppercase">Facebook</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center space-x-4 text-black/60 hover:text-black transition-colors group">
                    <Twitter size={18} className="group-hover:scale-110 transition-all" />
                    <span className="text-xs font-black uppercase">Twitter</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center space-x-4 text-black/60 hover:text-black transition-colors group">
                    <Youtube size={18} className="group-hover:scale-110 transition-all" />
                    <span className="text-xs font-black uppercase">Youtube</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center space-x-4 text-black/60 hover:text-black transition-colors group">
                    <Instagram size={18} className="group-hover:scale-110 transition-all" />
                    <span className="text-xs font-black uppercase">Instagram</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dark Section (Copyright & Stores) */}
      <div className="bg-[#191919] py-12 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-full p-[2px] overflow-hidden flex items-center justify-center bg-black">
                {/* Subtle Rotating Neon Overlay */}
                <div className="absolute w-[200%] h-[200%] bg-[conic-gradient(transparent,#ffcc00,#ff3300,#00ffcc,transparent_30%)] animate-neon-rotate opacity-50"></div>
                
                {/* Image Container */}
                <div className="relative z-10 w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={APP_LOGO_URL} 
                    alt="Logo" 
                    className="w-[80%] h-[80%] object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center md:text-left">
                Copyright © 2026 Tüm hakları saklıdır ALTILIYAKALATANADAM.com
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                <Apple size={24} className="text-white" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[6px] font-bold text-gray-500">Download on the</span>
                  <span className="text-xs font-black text-white tracking-tighter">App Store</span>
                </div>
              </a>
              <a href="#" className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                <Smartphone size={24} className="text-white" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[6px] font-bold text-gray-500">GET IT ON</span>
                  <span className="text-xs font-black text-white tracking-tighter">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-[10px] font-black uppercase text-gray-600 tracking-widest">
            <Link to="/yasal/kvkk-politikasi-10" className="hover:text-[#ffcc00] transition-colors">KVKK Politikası</Link>
            <Link to="/yasal/gizlilik-ilkesi-6" className="hover:text-[#ffcc00] transition-colors">Gizlilik İlkeleri</Link>
            <Link to="/yasal/iade-sartlari-7" className="hover:text-[#ffcc00] transition-colors">İade Şartları</Link>
            <Link to="/yasal/kullanim-kosullari-8" className="hover:text-[#ffcc00] transition-colors">Kullanım Koşulları</Link>
            <Link to="/yasal/satis-sozlesmesi-9" className="hover:text-[#ffcc00] transition-colors">Satış Sözleşmesi</Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button 
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 bg-[#ffcc00] text-black hover:bg-white p-3 rounded-xl shadow-2xl transition-all transform hover:-translate-y-2 group z-30"
      >
        <ArrowUp size={20} className="group-hover:animate-bounce" />
      </button>
    </footer>
  );
}
