/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { User, Star, CreditCard, MessageCircle, Mail, LogOut, ChevronRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { formatDate } from '../lib/utils';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(profile?.phone || '');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
  const [messages, setMessages] = useState({ phone: '', password: '', prefs: '' });
  const [loading, setLoading] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  
  React.useEffect(() => {
    if (!loading && !user && !profile) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const [notifState, setNotifState] = useState({
    email: profile?.notificationSettings?.email ?? true,
    browser: profile?.notificationSettings?.browser ?? true,
    onlyVip: profile?.notificationSettings?.onlyVip ?? true,
  });
  
  const [selectedTracks, setSelectedTracks] = useState<string[]>(
    profile?.favoriteTracks && profile.favoriteTracks.length > 0 
      ? profile.favoriteTracks 
      : ['İstanbul', 'İzmir']
  );
  
  const [stats, setStats] = useState({ hits7: 0, hits30: 0, total: 0, totalGain: 0, fullHits: 0, partialHits: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
       try {
          const q = query(collection(db, 'predictions'), where('type', '==', 'success'), orderBy('createdAt', 'desc'), limit(100));
          const snap = await getDocs(q);
          const docs = snap.docs.map(d => d.data());
          let totalSuccess = docs.length;
          let fullHits = docs.filter(d => d.resultStatus === 'won').length;
          let partialHits = docs.filter(d => d.resultStatus === 'partial').length;

          let totalWinnings = docs.reduce((acc, curr) => {
             if (curr.winnings) {
                const val = parseFloat(curr.winnings.replace(/[^\d]/g, '')) / 100;
                return acc + (isNaN(val) ? 0 : val);
             }
             return acc;
          }, 0);
          
          const now = Date.now();
          const hits7 = docs.filter(d => {
             if(d.createdAt && d.createdAt.toDate) {
               return (now - d.createdAt.toDate().getTime()) < 7 * 86400000;
             }
             return false;
          }).length;
          
          const hits30 = docs.filter(d => {
             if(d.createdAt && d.createdAt.toDate) {
               return (now - d.createdAt.toDate().getTime()) < 30 * 86400000;
             }
             return false;
          }).length;

          setStats({ hits7, hits30, total: totalSuccess, totalGain: totalWinnings, fullHits, partialHits });
       } catch (err) {
         console.error('Failed to fetch stats for dashboard', err);
       } finally {
         setLoadingStats(false);
       }
    };
    fetchStats();
  }, []);
  
  const menuItems = [
    { label: 'Üyelik Bilgileri', badge: profile?.isVip ? 'VIP Üye' : (profile?.role === 'admin' ? 'Admin' : 'Standart Üye'), icon: User, active: true },
    { label: 'Vip Paket Satın Al', icon: Star, action: () => navigate('/vip') },
    { label: 'Ödeme Bildirimi', icon: CreditCard, action: () => navigate('/odeme-bildirimi') },
    { label: 'ALTILIYAKALATANADAM Destek', icon: MessageCircle, action: () => navigate('/iletisim') },
    { label: 'İletişim', icon: Mail, action: () => navigate('/iletisim') },
    { label: 'Çıkış', icon: LogOut, action: () => { signOut(); navigate('/'); } },
  ];

  if (!profile || !user) {
     return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
           Yükleniyor veya Giriş Yapılmadı...
        </div>
     )
  }

  const getDaysRemaining = (expiryParam?: any) => {
    if (!expiryParam) return 0;
    let expiryDate: Date;
    if (expiryParam.toDate && typeof expiryParam.toDate === 'function') {
      expiryDate = expiryParam.toDate();
    } else {
      expiryDate = new Date(expiryParam);
    }
    const timeDiff = expiryDate.getTime() - new Date().getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };
  
  const handleSavePreferences = async () => {
      setMessages({ ...messages, prefs: '' });
      setIsSavingPrefs(true);
      try {
        await updateDoc(doc(db, 'users', user.uid), {
           notificationSettings: notifState,
           favoriteTracks: selectedTracks
        });
        setMessages({ ...messages, prefs: 'Tercihlerin başarıyla kaydedildi.' });
      } catch (err: any) {
         setMessages({ ...messages, prefs: err.message || 'Kayıt başarısız.' });
      } finally {
         setIsSavingPrefs(false);
      }
  };

  const toggleTrack = (track: string) => {
     setSelectedTracks(prev => 
       prev.includes(track) ? prev.filter(t => t !== track) : [...prev, track]
     );
  };
  
  const handleUpdatePhone = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessages({ ...messages, phone: '' });
      try {
        await updateDoc(doc(db, 'users', user.uid), { phone: phone });
        setMessages({ ...messages, phone: 'Telefon numarası güncellendi.' });
      } catch (err: any) {
        setMessages({ ...messages, phone: err.message || 'Güncelleme başarısız.' });
      } finally {
        setLoading(false);
      }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwords.newPassword !== passwords.newPasswordConfirm) {
         setMessages({ ...messages, password: 'Yeni şifreler eşleşmiyor!' });
         return;
      }
      setLoading(true);
      setMessages({ ...messages, password: '' });
      try {
        if (!auth.currentUser || !auth.currentUser.email) throw new Error("Giriş yapılmış kullanıcı bulunamadı.");
        
        // Re-authenticate first
        const credential = EmailAuthProvider.credential(auth.currentUser.email, passwords.currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        await updatePassword(auth.currentUser, passwords.newPassword);
        setMessages({ ...messages, password: 'Şifreniz güncellendi.' });
        setPasswords({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
      } catch (err: any) {
        setMessages({ ...messages, password: err.message || 'Şifre güncellenemedi.' });
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto py-20 px-4">
        {/* Breadcrumb row */}
        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-12">
          <span>Anasayfa</span>
          <ChevronRight size={12} className="text-gray-800" />
          <span className="text-[#ffcc00]">Bilgilerim</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Menu */}
          <aside className="w-full lg:w-1/3">
            <div className="border-l-4 border-[#ffcc00] pl-6 mb-8">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">Kullanıcı <span className="text-gray-400">Menüsü</span></h2>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="divide-y divide-white/5">
                {menuItems.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between px-8 py-5 transition-all group ${item.active ? 'bg-[#222222]/40 ring-1 ring-inset ring-[#ffcc00]/20' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <item.icon size={18} className={item.active ? 'text-[#ffcc00]' : 'text-gray-500 group-hover:text-white transition-colors'} />
                      <span className={`text-xs font-black uppercase tracking-widest ${item.active ? 'text-white' : 'text-gray-500 group-hover:text-white transition-colors'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-[#ffcc00]/10 text-[#ffcc00] text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-[#ffcc00]/20">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${item.active ? 'text-[#ffcc00] translate-x-1' : 'text-gray-800 group-hover:text-white group-hover:translate-x-1'}`} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-12">
            
            {/* VIP Status Card */}
            {profile?.isVip && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#191919] to-[#0a0a0a] border border-[#ffcc00]/20 rounded-[40px] p-8 md:p-12 shadow-[0_0_50px_-12px_rgba(255, 199, 0,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Star size={120} className="text-[#ffcc00]" />
                </div>
                
                <h3 className="text-xl font-black italic mb-6 tracking-tight uppercase flex items-center space-x-3 text-[#ffcc00]">
                  <Star size={20} />
                  <span>VIP <span className="text-white">Abonelik Durumu</span></span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
                   <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00] mb-1">Paket Tipi</div>
                     <div className="font-bold text-sm">{profile.vipPackage || '1 Aylık VIP'}</div>
                   </div>
                   <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Başlangıç</div>
                     <div className="font-bold text-sm">
                       {profile.vipStartDate ? formatDate(profile.vipStartDate) : '-'}
                     </div>
                   </div>
                   <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Bitiş</div>
                     <div className="font-bold text-sm text-red-400">
                       {profile.vipExpiry ? formatDate(profile.vipExpiry) : '-'}
                     </div>
                   </div>
                   <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00] mb-1">Kalan Süre</div>
                     <div className="font-black text-2xl italic tracking-tighter">
                       {getDaysRemaining(profile.vipExpiry)} <span className="text-[10px] font-bold text-gray-400 not-italic">Gün</span>
                     </div>
                   </div>
                </div>
                
                <button onClick={() => navigate('/vip')} className="w-full md:w-auto px-8 py-3 bg-[#ffcc00] text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-white transition-all shadow-lg shadow-[#ffcc00]/20">
                  Şimdi Yenile
                </button>
              </motion.section>
            )}
            
            {/* Performance Stats Array */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-[#ffcc00]/10 rounded-[40px] p-8 md:p-12 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-xl font-black italic mb-6 tracking-tight uppercase flex items-center space-x-3 text-white">
                <TrendingUp size={20} className="text-[#ffcc00]" />
                <span>Performansım <span className="text-gray-500">(Gözlemlerimiz)</span></span>
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-8">Platform genelinde yorumcuların ne kadar kazandırdığının özeti.</p>

              {loadingStats ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/5 rounded"></div>
                      <div className="h-4 bg-white/5 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#222222] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-green-500/50 hover:bg-green-500/5 transition-all">
                    <div className="text-[10px] font-black uppercase text-green-500 mb-2">Tam / Kısmi İsabet</div>
                    <div className="text-xl font-black text-white">
                      <span className="text-green-400">{stats.fullHits}</span> <span className="text-gray-600">/</span> <span className="text-orange-400">{stats.partialHits}</span>
                    </div>
                  </div>
                  <div className="bg-[#222222] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                    <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Toplam İsabet</div>
                    <div className="text-2xl font-black text-blue-400">{stats.total} <span className="text-sm font-bold text-gray-500">Adet</span></div>
                  </div>
                  <div className="bg-[#222222] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-green-500/50 hover:bg-green-500/5 transition-all">
                    <div className="text-[10px] font-black uppercase text-gray-500 mb-2">Son 30 Günlük İsabet</div>
                    <div className="text-2xl font-black text-white">{stats.hits30} <span className="text-sm font-bold text-gray-500">Adet</span></div>
                  </div>
                  <div className="bg-[#222222] border border-[#ffcc00]/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(255, 199, 0,0.1)]">
                    <div className="text-[10px] font-black uppercase text-gray-400 mb-2">Toplam Kazanç</div>
                    <div className="text-xl font-black text-[#ffcc00] italic">
                       {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.totalGain)}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>

            {/* Notification and Preferences Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl"
            >
              <h3 className="text-xl font-black italic mb-6 tracking-tight uppercase">
                Bildirim <span className="text-gray-400">Ayarları</span>
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-8">Hangi durumlarda size bildirim göndereceğimizi seçin.</p>
              
              {messages.prefs && <div className="text-[#ffcc00] text-sm mb-4 font-bold">{messages.prefs}</div>}
              
              <div className="space-y-4 mb-12">
                 <div className="flex items-center space-x-3 bg-[#222222] p-5 rounded-2xl border border-white/10">
                    <input type="checkbox" id="emailNotif" checked={notifState.email} onChange={(e) => setNotifState({...notifState, email: e.target.checked})} className="w-5 h-5 rounded bg-[#0a0a0a] border-white/10 text-[#ffcc00] focus:ring-[#ffcc00]" />
                    <label htmlFor="emailNotif" className="text-sm font-bold text-gray-400 cursor-pointer">E-Posta Bildirimleri Al</label>
                 </div>
                 <div className="flex items-center space-x-3 bg-[#222222] p-5 rounded-2xl border border-white/10">
                    <input type="checkbox" id="browserNotif" checked={notifState.browser} onChange={(e) => setNotifState({...notifState, browser: e.target.checked})} className="w-5 h-5 rounded bg-[#0a0a0a] border-white/10 text-[#ffcc00] focus:ring-[#ffcc00]" />
                    <label htmlFor="browserNotif" className="text-sm font-bold text-gray-400 cursor-pointer">Tarayıcı (Push) Bildirimleri Al</label>
                 </div>
                 <div className="flex items-center space-x-3 bg-[#222222] p-5 rounded-2xl border border-white/10">
                    <input type="checkbox" id="vipNotif" checked={notifState.onlyVip} onChange={(e) => setNotifState({...notifState, onlyVip: e.target.checked})} className="w-5 h-5 rounded bg-[#0a0a0a] border-white/10 text-[#ffcc00] focus:ring-[#ffcc00]" />
                    <label htmlFor="vipNotif" className="text-sm font-bold text-gray-400 cursor-pointer">Sadece VIP İçerik ve Önemli Duyuruları Al</label>
                 </div>
              </div>

              <h3 className="text-xl font-black italic mb-6 tracking-tight uppercase">
                Favori <span className="text-gray-400">Pistlerim</span>
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-8">Ana sayfada öncelikli görmek istediğiniz pistleri seçin.</p>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {['İstanbul', 'İzmir', 'Ankara', 'Adana', 'Şanlıurfa', 'Bursa', 'Kocaeli', 'Antalya'].map((track) => (
                   <div key={track} className="flex items-center space-x-3 bg-[#222222] p-4 rounded-xl border border-white/10">
                      <input type="checkbox" id={`track-${track}`} checked={selectedTracks.includes(track)} onChange={() => toggleTrack(track)} className="w-5 h-5 rounded bg-[#0a0a0a] border-white/10 text-[#ffcc00] focus:ring-[#ffcc00]" />
                      <label htmlFor={`track-${track}`} className="text-sm font-bold text-gray-400 cursor-pointer">{track}</label>
                   </div>
                ))}
              </div>

              <button 
                onClick={handleSavePreferences} 
                disabled={isSavingPrefs}
                className="w-full p-4 bg-transparent border-2 border-[#ffcc00] rounded-2xl font-black text-[#ffcc00] uppercase text-xs tracking-[0.2em] hover:bg-[#ffcc00] hover:text-black transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isSavingPrefs ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
              </button>
            </motion.section>

            {/* E-Posta Değiştir */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl"
            >
              <h3 className="text-xl font-black italic mb-6 tracking-tight uppercase">
                E-Posta <span className="text-gray-400">Değiştir</span>
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-8">E-posta adresinizi değiştirmek için aşağıdaki formu kullanabilirsiniz.</p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="email" 
                    defaultValue={profile?.email || ''}
                    disabled
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors opacity-50 cursor-not-allowed"
                  />
                  <div className="text-xs text-gray-500 mt-2 ml-2">Geçici olarak e-posta değişimi devre dışıdır.</div>
                </div>
                <button disabled className="w-full p-4 bg-transparent border-2 border-gray-600 rounded-2xl font-black text-gray-600 uppercase text-xs tracking-[0.2em] transform active:scale-95 cursor-not-allowed">
                  Güncelle
                </button>
              </div>
            </motion.section>

            {/* Telefon Numarası Değiştir */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl"
            >
              <h3 className="text-xl font-black italic mb-6 tracking-tight uppercase">
                Telefon Numarası <span className="text-gray-400">Değiştir</span>
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-8">Yeni telefon numaranıza doğrulama kodu gönderilecektir.</p>
              
              <form onSubmit={handleUpdatePhone} className="space-y-4">
                {messages.phone && <div className="text-[#ffcc00] text-sm mb-4 font-bold">{messages.phone}</div>}
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="Telefon Numaranız"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full p-4 bg-transparent border-2 border-[#ffcc00] rounded-2xl font-black text-[#ffcc00] uppercase text-xs tracking-[0.2em] hover:bg-[#ffcc00] hover:text-black transition-all transform active:scale-95">
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </form>
            </motion.section>

            {/* Şifre Değiştir */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl"
            >
              <h3 className="text-xl font-black italic mb-6 tracking-tight uppercase">
                Şifre <span className="text-gray-400">Değiştir</span>
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-8">Lütfen aşağıdaki form alanlarına yeni şifrenizi giriniz. Bundan sonraki girişlerde girdiğiniz yeni şifreniz geçerli olacaktır.</p>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {messages.password && <div className="text-[#ffcc00] text-sm mb-4 font-bold">{messages.password}</div>}
                <input 
                  type="password" 
                  placeholder="Eski Şifre"
                  value={passwords.currentPassword}
                  onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors"
                />
                <input 
                  type="password" 
                  placeholder="Yeni Şifre"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors"
                />
                <input 
                  type="password" 
                  placeholder="Yeni Şifre Tekrar"
                  value={passwords.newPasswordConfirm}
                  onChange={e => setPasswords({...passwords, newPasswordConfirm: e.target.value})}
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors"
                />
                <button type="submit" disabled={loading} className="w-full p-4 bg-transparent border-2 border-[#ffcc00] rounded-2xl font-black text-[#ffcc00] uppercase text-xs tracking-[0.2em] hover:bg-[#ffcc00] hover:text-black transition-all transform active:scale-95">
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </form>
            </motion.section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
