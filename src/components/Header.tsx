/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, LayoutGrid, LogIn, UserPlus, CreditCard, ChevronDown, User, Star, MessageSquare, LogOut, Settings, Tv, Menu, X, Bell, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_LOGO_URL } from '../constants';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const getDaysRemaining = (expiryStr?: string) => {
  if (!expiryStr) return null;
  const days = Math.ceil((new Date(expiryStr).getTime() - new Date().getTime()) / 86400000);
  return days > 0 ? days : 0;
};

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { label: 'Güncel Tahminler', path: '/tahminler' },
    { label: 'Başarılı Tahminler', path: '/basarili-tahminler' },
    { label: 'Nasıl Vip Üye Olurum?', path: '/vip' },
    { label: 'Blog', path: '/blog' },
    { label: 'İletişim', path: '/iletisim' }
  ];

  return (
    <header className="w-full flex flex-col font-sans sticky top-0 z-50">
      {/* Nesine Style Top Bar */}
      <div className={`bg-[#ffcc00] py-2 px-4 border-b border-[#000]/5 transition-all duration-300 ${scrolled ? 'shadow-md py-1' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 rounded-full p-[2px] overflow-hidden flex items-center justify-center bg-black shadow-lg shadow-black/20">
              {/* Rotating Neon Overlay */}
              <div className="absolute w-[200%] h-[200%] bg-[conic-gradient(transparent,#ffcc00,#ff3300,#00ffcc,transparent_30%)] animate-neon-rotate opacity-80"></div>
              
              {/* Image Container */}
              <div className="relative z-10 w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img 
                  src={APP_LOGO_URL} 
                  alt="ALTILIYAKALATANADAM Logo" 
                  className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-xl font-black text-black italic tracking-tighter uppercase leading-none">
                ALTILIYAKALA<span className="text-gray-900 opacity-60">TANADAM</span>
              </span>
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mt-0.5 hidden sm:block">Türkiye'nin En İyisi</span>
            </div>
          </Link>

          {/* Right Section (Help, Login, Register) */}
          <div className="hidden lg:flex items-center space-x-3">
            {user && (
               <div className="relative">
                 <button 
                   onClick={() => setNotifOpen(!notifOpen)}
                   className="relative p-2 text-black hover:scale-110 transition-all mr-2 cursor-pointer group"
                 >
                   <Bell size={20} className={notifOpen ? 'text-red-600' : 'text-black'} />
                   {announcements.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-[#ffcc00] animate-pulse"></span>
                   )}
                 </button>

                 <AnimatePresence>
                   {notifOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-[#1c1c1c] border border-white/10 rounded-[24px] shadow-2xl z-[100] overflow-hidden"
                      >
                         <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffcc00]">BİLDİRİMLER</h4>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{announcements.length} Yeni</span>
                         </div>
                         <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {announcements.length > 0 ? announcements.map((notif) => (
                              <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default">
                                 <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                       <Bell size={14} className="text-[#ffcc00]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center justify-between mb-1">
                                          <span className="text-[9px] font-black text-[#ffcc00] uppercase tracking-widest">{notif.badge || 'Duyuru'}</span>
                                          <span className="text-[8px] text-gray-600 uppercase font-bold">Az Önce</span>
                                       </div>
                                       <h5 className="text-xs font-bold text-white mb-1 line-clamp-1">{notif.title}</h5>
                                       <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{notif.content}</p>
                                    </div>
                                 </div>
                              </div>
                            )) : (
                              <div className="p-10 text-center">
                                 <Bell size={32} className="mx-auto text-gray-700 mb-4 opacity-20" />
                                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Henüz bildirim yok</p>
                              </div>
                            )}
                         </div>
                         <div className="p-4 bg-black/40 text-center">
                            <button onClick={() => setNotifOpen(false)} className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Kapat</button>
                         </div>
                      </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            )}
            {/* Yardım */}
            <Link to="/kurumsal/yardim" className="flex items-center space-x-1 text-black text-[11px] font-black uppercase tracking-tight hover:opacity-70 mr-2">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <HelpCircle size={12} className="text-[#ffcc00]" />
              </div>
              <span className="!text-black uppercase">YARDIM</span>
            </Link>

            {!user ? (
               <div className="flex items-center space-x-2">
                  {/* Pseudo Login Fields for Nesine Look */}
                  <div className="flex bg-white rounded-md border border-gray-300 overflow-hidden h-9">
                    <div className="flex items-center px-2 bg-gray-100 border-r border-gray-300">
                      <User size={14} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="E-posta veya Telefon No" 
                      className="px-3 text-[10px] w-44 focus:outline-none text-black"
                    />
                  </div>
                  <div className="flex bg-white rounded-md border border-gray-300 overflow-hidden h-9">
                    <div className="flex items-center px-2 bg-gray-100 border-r border-gray-300">
                      <X size={14} className="text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Şifre" 
                      className="px-3 text-[10px] w-24 focus:outline-none text-black"
                    />
                    <Link 
                      to="/giris-yap" 
                      state={{ showReset: true }}
                      className="bg-gray-700 text-white text-[9px] px-2 font-bold hover:bg-black transition-colors flex items-center"
                    >
                      Unuttum
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-black px-1">
                    <input type="checkbox" id="remember" className="w-3 h-3 border-gray-300 rounded" />
                    <label htmlFor="remember">Beni Hatırla</label>
                  </div>

                  <button 
                    onClick={() => navigate('/giris-yap')}
                    className="h-9 px-4 bg-black text-[#ffcc00] font-black text-xs rounded-md shadow-sm hover:opacity-90 transition-all flex items-center space-x-1"
                  >
                    <span>GİRİŞ</span>
                    <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-[#ffcc00] ml-1"></div>
                  </button>

                  <Link 
                    to="/kayit-ol" 
                    className="h-9 px-4 bg-[#23a317] text-white font-black text-[11px] rounded-md shadow-sm flex items-center justify-center hover:opacity-90 transition-all"
                  >
                    HEMEN ÜYE OL
                  </Link>
               </div>
            ) : (
              <div className="flex items-center space-x-4">
                 <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold !text-black uppercase tracking-tight">Hoşgeldiniz</span>
                   <span className="text-xs font-black !text-black">{profile?.fullName || user?.email}</span>
                 </div>
                 
                 {profile?.isVip && (
                   <div className="bg-black text-[#ffcc00] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center space-x-1">
                     <Star size={10} className="fill-[#ffcc00]" />
                     <span>VIP</span>
                   </div>
                 )}

                 <div className="flex items-center space-x-2">
                    {profile?.role === 'admin' && (
                      <Link to="/admin" className="p-2 bg-black text-[#ffcc00] rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-1">
                        <LayoutGrid size={16} />
                        <span className="text-[10px] font-black uppercase tracking-tight hidden sm:inline">Panel</span>
                      </Link>
                    )}
                    <Link to="/bilgilerim" className="p-0.5 bg-white border-2 border-black rounded-lg hover:border-gray-600 transition-all flex items-center justify-center overflow-hidden w-10 h-10 shadow-lg">
                       {profile?.role === 'admin' ? (
                          <img 
                            src={APP_LOGO_URL} 
                            className="w-full h-full object-contain"
                            alt="Admin"
                            referrerPolicy="no-referrer"
                          />
                       ) : (
                          <div className="text-black"><User size={24} /></div>
                       )}
                    </Link>
                    <button onClick={handleSignOut} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <LogOut size={16} />
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button Section */}
          <div className="lg:hidden flex items-center space-x-2">
            {!user && (
              <Link to="/giris-yap" className="bg-black text-[#ffcc00] px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest">Giriş</Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-black p-2 bg-black/5 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Nesine Style Sub Nav (Bottom Bar) */}
      <div className="bg-[#191919] border-b border-white/5 py-1 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ul className="flex items-center space-x-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link 
                  to={item.path} 
                  className="px-6 py-3 text-[11px] font-black text-white hover:text-[#ffcc00] uppercase tracking-tighter transition-all block relative group"
                >
                  {item.label}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ffcc00] transition-all group-hover:w-full"></div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center space-x-3 mr-4">
            <Link to="/program" className="flex items-center space-x-2 bg-[#ffcc00] text-black px-4 py-2 rounded-md font-black text-[10px] tracking-widest hover:bg-white transition-all">
              <Tv size={14} />
              <span>YARIŞ PROGRAMLARI</span>
            </Link>
            <Link to="/odeme-bildirimi" className="flex items-center space-x-2 bg-white/5 text-gray-400 px-4 py-2 rounded-md font-black text-[10px] tracking-widest hover:bg-white/10 border border-white/10 transition-all">
              <CreditCard size={14} />
              <span>ÖDEME BİLDİRİMİ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-[#191919] overflow-hidden"
          >
            <ul className="flex flex-col space-y-2 p-6 text-sm font-black text-white uppercase tracking-tight">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 border-b border-white/5 hover:text-[#ffcc00] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 space-y-3">
                <Link 
                  to="/program"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 bg-[#ffcc00] text-black px-4 py-3 rounded-xl font-black tracking-widest text-xs w-full justify-center"
                >
                  <Tv size={18} />
                  <span>YARIŞ PROGRAMLARI</span>
                </Link>
                {profile?.role === 'admin' && (
                  <Link 
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-black tracking-widest text-xs w-full justify-center"
                  >
                    <LayoutGrid size={18} />
                    <span>ADMİN PANELİ</span>
                  </Link>
                )}
                <Link 
                  to="/odeme-bildirimi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 bg-white/10 text-white px-4 py-3 rounded-xl font-black tracking-widest text-xs w-full justify-center border border-white/20"
                >
                  <CreditCard size={18} />
                  <span>ÖDEME BİLDİRİMİ</span>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
