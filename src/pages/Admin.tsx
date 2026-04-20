/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileText, CheckCircle, ListPlus, Send, ImageIcon, Type, Link as LinkIcon, Users, Eye, Clock, ExternalLink, Building2, Database, ShieldCheck, AlertOctagon, Star, Trophy, Gauge, Info, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { dbService } from '../services/dbService';
import { APP_LOGO_URL } from '../constants';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';

type Section = 'overview' | 'guncel' | 'basarili' | 'blog' | 'users' | 'slider' | 'banks' | 'notif';

export default function Admin() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'admin')) {
      navigate('/');
    }
  }, [profile, authLoading, navigate]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, onConfirm: () => void } | null>(null);
  const [winningsPrompt, setWinningsPrompt] = useState<{ isOpen: boolean, prediction: any, result: 'won'|'partial' } | null>(null);
  const [winningsValue, setWinningsValue] = useState('');

  const initialFormState = {
    title: '',
    subTitle: '',
    content: '',
    sampleContent: '',
    image: '',
    slug: '',
    track: 'İstanbul',
    raceDate: new Date().toISOString().split('T')[0],
    publishAt: '',
    status: 'published' as 'draft' | 'published' | 'settled',
    resultStatus: 'pending' as 'pending' | 'won' | 'lost' | 'partial',
    visibility: 'vip' as 'vip' | 'public' | 'sample',
    couponType: 'standard' as 'economic' | 'standard' | 'aggressive',
    confidenceScore: 80,
    badge: 'Günün Kuponu',
    shortNote: '',
    priceLabel: 'Orta Risk',
    kuponBedeli: '',
    winnings: '',
    roi: '',
    views: 0,
    dailyBanko: '',
    dailySurpriz: '',
    dailyTemplate: '',
    // slider specific
    ctaText: '',
    ctaLink: '',
    orderIndex: 0,
    // bank specific
    bankName: '',
    iban: '',
    receiverName: '',
    // Horse race specific (Structured legs)
    ayaklar: Array(6).fill(null).map((_, i) => ({
      legNo: i + 1,
      raceNo: i + 1,
      analysis: '',
      horses: '',
      banko: false,
      confidence: 70
    })),
    fiyat: '',
    commentsEnabled: true,
    type: 'current',
    role: 'user',
    isFreeSample: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const sections = [
    { id: 'overview', label: 'Genel Bakış', icon: Gauge },
    { id: 'guncel', label: 'VIP Kuponlar', icon: ListPlus },
    { id: 'basarili', label: 'Kazanan Kuponlar', icon: CheckCircle },
    { id: 'blog', label: 'Blog Yazıları', icon: FileText },
    { id: 'slider', label: 'Slider Ayarları', icon: ImageIcon },
    { id: 'banks', label: 'Banka Bilgileri', icon: Building2 },
    { id: 'notif', label: 'Duyuru & Bildirim', icon: Bell },
    { id: 'users', label: 'Kullanıcı & Ödemeler', icon: Users },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (activeSection === 'blog') {
        const payload = {
          title: formData.title,
          slug: formData.slug || formData.title.toLowerCase().replace(/ /g, '-'),
          content: formData.content,
          image: formData.image,
          views: Number(formData.views),
          createdAt: serverTimestamp()
        };
        if (editId) {
            await updateDoc(doc(db, 'blogs', editId), payload);
        } else {
            const blogRef = await addDoc(collection(db, 'blogs'), payload);
            // Otomatik Duyuru
            await addDoc(collection(db, 'announcements'), {
              title: formData.title,
              content: 'Yeni bir blog yazısı eklendi. Okumak için tıklayın.',
              badge: 'YENİ YAZI',
              type: 'blog',
              link: `/blog/${payload.slug}`,
              createdAt: serverTimestamp()
            });
        }
      } else if (activeSection === 'guncel' || activeSection === 'basarili') {
        const payload = {
          title: formData.title,
          subTitle: formData.subTitle || '',
          slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          track: formData.track,
          raceDate: formData.raceDate,
          publishAt: formData.publishAt || new Date().toISOString(),
          status: activeSection === 'basarili' ? 'settled' : formData.status,
          type: activeSection === 'basarili' ? 'success' : 'current',
          visibility: formData.visibility,
          couponType: formData.couponType,
          confidenceScore: Number(formData.confidenceScore),
          badge: formData.badge,
          shortNote: formData.shortNote,
          priceLabel: formData.priceLabel,
          kuponBedeli: formData.kuponBedeli,
          content: formData.content || '',
          sampleContent: formData.sampleContent || '',
          image: formData.image || '',
          dailyBanko: formData.dailyBanko || '',
          dailySurpriz: formData.dailySurpriz || '',
          dailyTemplate: formData.dailyTemplate || '',
          resultStatus: activeSection === 'basarili' ? (formData.resultStatus || 'won') : 'pending',
          winnings: formData.winnings || '',
          roi: formData.roi || '',
          authorName: 'ALTILIYAKALATANADAM',
          views: Number(formData.views),
          ayaklar: formData.ayaklar,
          commentsEnabled: formData.commentsEnabled,
          isFreeSample: formData.visibility === 'sample',
          createdAt: editId ? (formData as any).createdAt : serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        if (editId) {
            await updateDoc(doc(db, 'predictions', editId), payload);
        } else {
            await addDoc(collection(db, 'predictions'), payload);
            if (payload.status === 'published') {
               // Otomatik Duyuru
               await addDoc(collection(db, 'announcements'), {
                 title: formData.title,
                 content: `${payload.track} yarışları için analiz eklendi.`,
                 badge: payload.visibility === 'vip' ? 'VIP KUPON' : 'ÜCRETSİZ KUPON',
                 type: 'prediction',
                 link: payload.type === 'success' ? '/basarili-tahminler' : '/tahminler',
                 createdAt: serverTimestamp()
               });
            }
        }
      } else if (activeSection === 'banks') {
          const payload = {
            bankName: formData.bankName,
            iban: formData.iban,
            receiverName: formData.receiverName,
            active: true
          };
          if (editId) {
              await updateDoc(doc(db, 'banks', editId), payload);
          } else {
              await addDoc(collection(db, 'banks'), payload);
          }
      } else if (activeSection === 'notif') {
          const payload = {
              title: formData.title,
              content: formData.content,
              badge: formData.badge || 'DUYURU',
              active: true,
              type: 'global',
              createdAt: serverTimestamp()
          };
          await addDoc(collection(db, 'announcements'), payload);
          setMessage('Duyuru tüm kullanıcılara gönderildi!');
      }
      setMessage(editId ? 'İçerik başarıyla güncellendi!' : 'İçerik başarıyla yayınlandı!');
      setFormData(initialFormState);
      setEditId(null);
      await fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Hata oluştu. Yetkiniz olmayabilir.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any, type: string) => {
      if (type === 'blog') setActiveSection('blog');
      if (type === 'prediction') {
          setActiveSection(item.type === 'current' ? 'guncel' : 'basarili');
      }
      if (type === 'bank') setActiveSection('banks');
      if (type === 'slider') setActiveSection('slider');

      setEditId(item.id);
      if (type === 'blog') {
          setFormData({ 
            ...initialFormState,
            title: item.title || '', 
            slug: item.slug || '', 
            content: item.content || '', 
            image: item.image || '', 
            views: item.views || 0,
          });
      } else if (type === 'prediction') {
          setFormData({ 
            ...formData,
            title: item.title || '', 
            subTitle: item.subTitle || '', 
            slug: item.slug || '', 
            track: item.track || 'İstanbul',
            raceDate: item.raceDate || new Date().toISOString().split('T')[0],
            publishAt: item.publishAt || '',
            status: item.status || (item.type === 'success' ? 'settled' : 'published'),
            visibility: item.visibility || (item.isPublic ? 'public' : 'vip'),
            couponType: item.couponType || 'standard',
            confidenceScore: item.confidenceScore || 80,
            badge: item.badge || 'Günün Kuponu',
            shortNote: item.shortNote || '',
            priceLabel: item.priceLabel || 'Orta Risk',
            kuponBedeli: item.kuponBedeli || '',
            content: item.content || '', 
            sampleContent: item.sampleContent || '',
            image: item.image || '', 
            winnings: item.winnings || '', 
            roi: item.roi || '',
            views: item.views || 0, 
            dailyBanko: item.dailyBanko || '',
            dailySurpriz: item.dailySurpriz || '',
            dailyTemplate: item.dailyTemplate || '',
            ayaklar: Array.isArray(item.ayaklar) ? item.ayaklar : Array(6).fill(null).map((_, i) => ({
              legNo: i + 1, raceNo: i + 1, analysis: '', horses: '', banko: false, confidence: 70
            })),
            commentsEnabled: item.commentsEnabled !== undefined ? item.commentsEnabled : true,
            createdAt: item.createdAt
          } as any);
      } else if (type === 'bank') {
          setFormData({ 
            ...initialFormState,
            bankName: item.bankName || '', 
            iban: item.iban || '', 
            receiverName: item.receiverName || '', 
          });
      } else if (type === 'slider') {
          setFormData({ 
            ...initialFormState,
            title: item.title || '', 
            subTitle: item.subTitle || '', 
            image: item.imageUrl || '', 
            ctaText: item.ctaText || '', 
            ctaLink: item.ctaLink || '', 
            orderIndex: item.orderIndex || 0, 
          });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleResultMarking = async (prediction: any, result: 'won' | 'partial' | 'lost', customWinnings?: string) => {
    let winnings = customWinnings !== undefined ? customWinnings : (prediction.winnings || "");
    
    // If not lost and we haven't asked for winnings yet, ask for it
    if ((result === 'won' || result === 'partial') && customWinnings === undefined) {
        setWinningsValue(winnings);
        setWinningsPrompt({ isOpen: true, prediction, result });
        return;
    }
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'predictions', prediction.id), {
        status: 'settled',
        type: 'success',
        resultStatus: result,
        winnings: winnings,
        updatedAt: serverTimestamp(),
        settledAt: serverTimestamp(),
      });
      setMessage('Tahmin sonucu başarıyla güncellendi!');
      setWinningsPrompt(null);
      await fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
      setConfirmDialog({
          isOpen: true,
          title: "Bu veriyi silmek istediğinize emin misiniz?",
          onConfirm: async () => {
             setConfirmDialog(null);
             setLoading(true);
             try {
                 if (type === 'blog') await deleteDoc(doc(db, 'blogs', id));
                 if (type === 'prediction') await deleteDoc(doc(db, 'predictions', id));
                 if (type === 'bank') await deleteDoc(doc(db, 'banks', id));
                 if (type === 'slider') await deleteDoc(doc(db, 'slider', id));
                 setMessage('Başarıyla silindi!');
                 await fetchAdminData();
             } catch (err: any) {
                 console.error(err);
                 setMessage('Silme hatası: ' + err.message + ' (Lütfen Firestore kurallarınızı kontrol edin)');
             } finally {
                 setLoading(false);
             }
          }
      });
  };

  const [payments, setPayments] = useState<any[]>([]);
  const [sliderItems, setSliderItems] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState({ totalUsers: 0, vipUsers: 0 });

  React.useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminData();
    }
    setMessage('');
  }, [activeSection, profile]);

  const fetchAdminData = async () => {
    if (!profile || profile.role !== 'admin') return;
    try {
      try {
        const paymentsSnap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
        setPayments(paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e: any) { console.error("Error payments", e); }
      
      try {
        const sliderSnap = await getDocs(query(collection(db, 'slider'), orderBy('orderIndex', 'asc')));
        setSliderItems(sliderSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e: any) { console.error("Error slider", e); }
      
      try {
        const predsSnap = await getDocs(query(collection(db, 'predictions'), orderBy('createdAt', 'desc')));
        setPredictions(predsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e: any) { console.error("Error preds", e); }
      
      try {
        const blogsSnap = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')));
        setBlogs(blogsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e: any) { console.error("Error blogs", e); }
      
      try {
        const banksSnap = await getDocs(collection(db, 'banks'));
        setBanks(banksSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e: any) { console.error("Error banks", e); }

      try {
        const stats = await dbService.getSystemStats();
        setSystemStats(stats);
      } catch (e: any) { console.error("Error stats", e); }
      
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  const handleSliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            title: formData.title,
            subTitle: formData.subTitle,
            ctaText: formData.ctaText,
            ctaLink: formData.ctaLink,
            imageUrl: formData.image,
            orderIndex: Number(formData.orderIndex),
            active: true
        };
        if (editId) {
            await updateDoc(doc(db, 'slider', editId), payload);
            setMessage('Slider öğesi başarıyla güncellendi!');
        } else {
            await addDoc(collection(db, 'slider'), payload);
            setMessage('Slider öğesi başarıyla eklendi!');
        }
        await fetchAdminData();
        setFormData(initialFormState);
        setEditId(null);
    } catch (err) {
        console.error(err);
        setMessage('Slider işleminde hata oluştu');
    } finally {
        setLoading(false);
    }
  };

  const deleteSlider = async (id: string) => {
      setConfirmDialog({
          isOpen: true,
          title: "Bu slider öğesini silmek istediğinize emin misiniz?",
          onConfirm: async () => {
             setConfirmDialog(null);
             setLoading(true);
             try {
                 await deleteDoc(doc(db, 'slider', id));
                 await fetchAdminData();
                 setMessage('Slider silindi!');
             } catch(err: any) {
                 console.error(err);
                 setMessage('Silme hatası: ' + err.message + ' (Lütfen Firestore kurallarınızı kontrol edin)');
             } finally {
                 setLoading(false);
             }
          }
      });
  };

  const handlePaymentAction = async (paymentId: string, status: string, userId: string, paymentPackage?: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), { status });
      if (status === 'approved') {
        const pld: any = { isVip: true, role: 'vip', vipStatus: 'active' };
        if (paymentPackage) {
           pld.vipPackage = paymentPackage;
           pld.vipStartDate = new Date().toISOString();
           const now = new Date();
           let addDays = 30;
           if (paymentPackage.includes('3')) addDays = 90;
           else if (paymentPackage.includes('6')) addDays = 180;
           now.setDate(now.getDate() + addDays);
           pld.vipExpiry = now.toISOString();
        }
        await updateDoc(doc(db, 'users', userId), pld);
      }
      await fetchAdminData();
      setMessage('İşlem başarılı!');
    } catch (err) {
       console.error(err);
       setMessage('Hata oluştu');
    }
  };

  const seedData = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'predictions'), {
         title: 'İzmir Çiminde Namağlup - 18 Nisan İzmir',
         subTitle: 'İzmir tahminleri sayfanın en altındadır;',
         slug: 'izmir-ciminde-namaglup-18-nisan',
         content: 'İzmir yarışları için yaptığımız detaylı analizler...',
         type: 'current',
         authorName: 'ALTILIYAKALATANADAM',
         isPublic: true,
         createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'blogs'), {
         title: "ALTILIYAKALATANADAM'dan Yine Büyük İkramiye 511.589,37 TL",
         slug: 'buyuk-ikramiye-24-ocak',
         content: '24 Ocak tarihinde kazandırdığımız dev ikramiye detayları...',
         image: 'https://picsum.photos/seed/win/800/400',
         views: 1250,
         createdAt: serverTimestamp()
      });
      alert('Demo verileri başarıyla yüklendi!');
    } catch (err) {
      console.error(err);
      alert('Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Yükleniyor...</div>;
  }

  if (!profile || profile.role !== 'admin') {
     return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Yetkisiz Erişim</div>;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#ffcc00] selection:text-black">
      <Header />
      
      <main className="max-w-[1600px] mx-auto py-12 px-4 lg:px-8">
        {/* Professional Header & Stats Row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#ffcc00] via-[#ff3300] to-[#00ffcc] shadow-2xl">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-black">
                <img 
                  src={APP_LOGO_URL} 
                  alt="Admin Logo" 
                  className="w-[75%] h-[75%] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <ShieldCheck size={16} className="text-[#ffcc00]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Güvenli Yönetim Paneli</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                YÖNETİM <span className="text-gray-500 font-light not-italic">MERKEZİ</span>
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 xl:max-w-4xl">
             {[
               { label: 'Aktif Kuponlar', value: predictions.filter(p => (p.status === 'published' || p.type === 'current')).length, icon: ListPlus, color: 'text-[#ffcc00]' },
               { label: 'Başarılı Sonuç', value: predictions.filter(p => (p.status === 'settled' || p.type === 'success')).length, icon: CheckCircle, color: 'text-green-500' },
               { label: 'Toplam İzlenme', value: predictions.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString(), icon: Eye, color: 'text-blue-500' },
               { label: 'Bekleyen Ödeme', value: payments.filter(p => p.status === 'pending').length, icon: Users, color: 'text-purple-500' }
             ].map((stat, i) => (
               <div key={i} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group">
                 <div className="flex items-center justify-between mb-2">
                    <stat.icon size={14} className={stat.color} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{stat.label}</span>
                 </div>
                 <div className="text-2xl font-black italic tracking-tight">{stat.value}</div>
               </div>
             ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Tabs & Lists */}
          <aside className="w-full lg:w-1/3 xl:w-1/4 space-y-8">
            <div className="bg-[#111111] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl p-4 space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide lg:sticky lg:top-8">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id as Section);
                    setEditId(null);
                    setFormData(initialFormState);
                  }}
                  className={`flex-shrink-0 lg:flex-shrink lg:w-full flex items-center space-x-3 md:space-x-4 p-4 rounded-2xl transition-all group ${
                    activeSection === section.id 
                    ? 'bg-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/20' 
                    : 'hover:bg-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  <section.icon size={18} className={activeSection === section.id ? 'text-black' : 'text-[#ffcc00] group-hover:scale-110 transition-transform'} />
                  <span className="text-xs font-black uppercase tracking-tight whitespace-nowrap">{section.label}</span>
                </button>
              ))}
              
              <div className="hidden lg:block pt-4 mt-4 border-t border-white/5">
                <button onClick={seedData} className="w-full flex items-center space-x-3 p-4 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all group">
                  <Database size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Demo Veri</span>
                </button>
              </div>
            </div>

            {/* List on the left side (Desktop) - Only show for specific sections */}
            {activeSection !== 'overview' && activeSection !== 'users' && (
              <div className="hidden lg:block bg-[#0f0f0f] border border-white/5 rounded-[32px] p-6 shadow-2xl max-h-[700px] overflow-y-auto custom-scrollbar space-y-8">
                
                {/* Section List */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00] flex items-center">
                    <div className="w-1.5 h-1.5 bg-[#ffcc00] rounded-full mr-3 animate-pulse" />
                    MEVCUT LİSTE
                  </h3>
                  <div className="divide-y divide-white/5">
                    {/* Dynamic List Logic based on activeSection */}
                    {activeSection === 'guncel' && predictions.filter(p => p.type === 'current').map(p => (
                       <div key={p.id} className="py-4 group">
                          <div className="flex justify-between items-start">
                             <div className="flex-1 truncate">
                                <span className="font-bold text-xs truncate block mb-1 group-hover:text-[#ffcc00] transition-colors">{p.title}</span>
                                <span className="text-[9px] text-gray-500 uppercase font-black bg-white/5 px-1.5 py-0.5 rounded">{p.track}</span>
                             </div>
                             <div className="flex flex-col space-y-2 ml-4">
                                <div className="flex items-center space-x-1">
                                   <button onClick={() => handleResultMarking(p, 'won')} className="w-6 h-6 flex items-center justify-center bg-green-500/10 text-green-500 rounded border border-green-500/20 hover:bg-green-500 hover:text-black transition-all text-[8px] font-black" title="Tuttu">W</button>
                                   <button onClick={() => handleResultMarking(p, 'partial')} className="w-6 h-6 flex items-center justify-center bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all text-[8px] font-black" title="İade">P</button>
                                   <button onClick={() => handleResultMarking(p, 'lost')} className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[8px] font-black" title="Yattı">L</button>
                                </div>
                                <div className="flex space-x-1">
                                   <button onClick={() => handleEdit(p, 'prediction')} className="flex-1 p-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-all flex justify-center"><FileText size={10}/></button>
                                   <button onClick={() => handleDelete(p.id, 'prediction')} className="flex-1 p-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500 hover:text-white transition-all flex justify-center"><Database size={10}/></button>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}

                    {activeSection === 'basarili' && predictions.filter(p => p.type === 'success' || p.status === 'settled').map(p => (
                        <div key={p.id} className="py-4 group">
                            <div className="flex justify-between items-start">
                               <div className="flex-1 truncate">
                                  <span className="font-bold text-xs truncate block text-white group-hover:text-[#ffcc00] transition-colors">{p.title}</span>
                                  <span className="text-[9px] text-green-500 font-bold">{p.winnings || '0'} ₺</span>
                                </div>
                               <div className="flex space-x-1 ml-2">
                                  <button onClick={() => handleEdit(p, 'prediction')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><FileText size={12}/></button>
                                  <button onClick={() => handleDelete(p.id, 'prediction')} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg"><Database size={12}/></button>
                               </div>
                            </div>
                        </div>
                    ))}

                    {activeSection === 'blog' && blogs.map(b => (
                        <div key={b.id} className="py-4 group">
                            <div className="flex justify-between items-start mb-1">
                               <span className="font-bold text-xs truncate flex-1 text-white leading-tight group-hover:text-[#ffcc00]">{b.title}</span>
                               <div className="flex space-x-1 ml-2 shrink-0">
                                   <button onClick={() => handleEdit(b, 'blog')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><FileText size={12}/></button>
                                   <button onClick={() => handleDelete(b.id, 'blog')} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg"><Database size={12}/></button>
                               </div>
                            </div>
                            <div className="text-[9px] text-gray-500 font-mono">/{b.slug}</div>
                        </div>
                    ))}

                    {activeSection === 'banks' && banks.map(b => (
                        <div key={b.id} className="py-4 group">
                            <div className="flex justify-between items-start mb-2">
                               <span className="font-bold text-white text-xs truncate mr-2 group-hover:text-[#ffcc00] font-mono">{b.bankName}</span>
                               <div className="flex space-x-1 shrink-0">
                                   <button onClick={() => handleEdit(b, 'bank')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 transition-all"><FileText size={12}/></button>
                                   <button onClick={() => handleDelete(b.id, 'bank')} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-all"><Database size={12}/></button>
                               </div>
                            </div>
                        </div>
                    ))}

                    {activeSection === 'slider' && sliderItems.map(s => (
                        <div key={s.id} className="py-4 group">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-xs font-bold truncate pr-2 text-white group-hover:text-[#ffcc00]">{s.title}</span>
                               <div className="flex space-x-1 shrink-0">
                                   <button onClick={() => handleEdit(s, 'slider')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><FileText size={12}/></button>
                                   <button onClick={() => deleteSlider(s.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Database size={12}/></button>
                               </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty states handled below */}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Form Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-[#0a0a0a] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden ${
                  (activeSection === 'guncel' || activeSection === 'basarili') ? 'p-0' : 'p-8 md:p-12'
                }`}
              >
                {message && (
                  <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-2xl m-8 mb-6 text-sm font-bold">
                    {message}
                  </div>
                )}

                {/* Form Wrapper with Preview if applicable */}
                {activeSection === 'overview' ? (
                   <div className="p-8 md:p-12 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#111111] border border-white/5 rounded-[32px] p-8 space-y-6">
                           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffcc00]">Sistem Özeti</h3>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center py-3 border-b border-white/5">
                                 <span className="text-xs text-gray-500 font-medium uppercase">Toplam Kullanıcı</span>
                                 <span className="font-bold text-white">{systemStats.totalUsers}</span>
                              </div>
                              <div className="flex justify-between items-center py-3 border-b border-white/5">
                                 <span className="text-xs text-gray-500 font-medium uppercase">Vip Üye Sayısı</span>
                                 <span className="font-bold text-[#ffcc00]">{systemStats.vipUsers}</span>
                              </div>
                              <div className="flex justify-between items-center py-3 border-b border-white/5">
                                 <span className="text-xs text-gray-500 font-medium uppercase">Aktif Kampanya</span>
                                 <span className="font-bold text-blue-400">{sliderItems.length}</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="bg-[#111111] border border-white/5 rounded-[32px] p-8 flex flex-col justify-center items-center text-center space-y-4">
                           <div className="w-16 h-16 bg-[#ffcc00]/10 rounded-full flex items-center justify-center">
                              <Trophy size={32} className="text-[#ffcc00]" />
                           </div>
                           <div>
                              <h4 className="text-xl font-black italic uppercase tracking-tight">KUPON BAŞARISI</h4>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 px-8">
                                 Platform genelinde isabet oranımız şu an <span className="text-green-500 font-black">YÜKSEK</span> seviyededir.
                              </p>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Son Ödeme Bildirimleri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {payments.slice(0, 4).map(p => (
                             <div key={p.id} className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                                <div>
                                   <div className="text-xs font-bold text-white mb-1 uppercase tracking-tight">{p.fullName}</div>
                                   <div className="text-[10px] text-gray-500 font-medium">{p.package}</div>
                                </div>
                                <div className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'pending' ? 'bg-[#ffcc00]/10 text-[#ffcc00]' : 'bg-green-500/10 text-green-500'}`}>
                                   {p.status === 'pending' ? 'BEKLEYEN' : 'ONAYLI'}
                                </div>
                             </div>
                           ))}
                           {payments.length === 0 && <div className="text-gray-600 text-xs italic">Henüz bildirim yok.</div>}
                        </div>
                        <button onClick={() => setActiveSection('users')} className="text-[#ffcc00] text-[10px] font-black uppercase tracking-widest hover:underline">Tümünü Yönet &rarr;</button>
                      </div>
                   </div>
                ) : activeSection === 'users' ? (
                   <div className="p-8 md:p-12 space-y-12">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="w-12 h-12 bg-[#ffcc00]/10 rounded-2xl flex items-center justify-center">
                           <Users size={24} className="text-[#ffcc00]" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black italic tracking-tight uppercase">Kullanıcı Yönetimi</h2>
                          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Mevcut aboneleri ve ödemelerini buradan yönetin.</p>
                        </div>
                      </div>

                      <div className="bg-[#222222] border border-[#ffcc00]/20 rounded-[30px] p-12 text-center mt-4 shadow-2xl">
                         <Users size={64} className="text-[#ffcc00] mx-auto mb-6 opacity-30" />
                         <h4 className="text-xl font-black mb-2 uppercase tracking-tight">KULLANICI VERİ TABANI</h4>
                         <p className="text-sm text-gray-500 mb-6 font-medium max-w-sm mx-auto">
                            Yeni kullanıcılar "Kayıt Ol" sayfası üzerinden eklenmelidir. Mevcut aboneleri buradan yönetebilirsiniz.
                         </p>
                         <div className="inline-flex items-center space-x-2 bg-[#ffcc00]/10 border border-[#ffcc00]/20 px-6 py-3 rounded-2xl">
                            <Info size={16} className="text-[#ffcc00]" />
                            <span className="text-[10px] text-[#ffcc00] font-black uppercase tracking-widest">Sistem v2.0 Aktif</span>
                         </div>
                      </div>
                   </div>
                ) : activeSection === 'notif' ? (
                   <div className="p-8 md:p-12 space-y-12">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="p-4 bg-blue-500/10 rounded-2xl">
                          <Bell size={32} className="text-blue-500" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black italic uppercase tracking-tighter">ANLIK <span className="text-gray-500">BİLDİRİM GÖNDER</span></h2>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00] mt-1">Tüm Kullanıcılara Duyuru Yayınla</p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Duyuru Başlığı</label>
                              <input 
                                required
                                type="text"
                                placeholder="Örn: Yeni VIP Kupon Yayında!"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Etiket / Kategori</label>
                              <select 
                                value={formData.badge}
                                onChange={e => setFormData({...formData, badge: e.target.value})}
                                className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-blue-500 appearance-none"
                              >
                                <option value="DUYURU">📢 Genel Duyuru</option>
                                <option value="ACİL">🚨 Acil Uyarı</option>
                                <option value="GÜNCELLEME">🔄 Sistem Güncellemesi</option>
                                <option value="KAMPANYA">💰 Kampanya / İndirim</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Duyuru İçeriği</label>
                           <textarea
                             required
                             rows={4}
                             placeholder="Mesajınızı buraya yazın..."
                             value={formData.content}
                             onChange={e => setFormData({...formData, content: e.target.value})}
                             className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors resize-none"
                           />
                        </div>

                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-full p-6 bg-blue-600 rounded-3xl font-black text-white uppercase tracking-[0.2em] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-4 shadow-xl shadow-blue-600/10 disabled:opacity-50"
                        >
                          <Send size={20} />
                          <span>{loading ? 'GÖNDERİLİYOR...' : 'BİLDİRİMİ TÜM KULLANICILARA GÖNDER'}</span>
                        </button>
                      </form>
                   </div>
                ) : (
                  <div className={`${(activeSection === 'guncel' || activeSection === 'basarili') ? 'flex flex-col xl:flex-row' : ''}`}>
                  
                  {/* Left Column: Form Fields */}
                  <div className={`${(activeSection === 'guncel' || activeSection === 'basarili') ? 'flex-1 p-8 md:p-12 border-r border-white/5 lg:max-h-[1200px] overflow-y-auto custom-scrollbar' : 'w-full'}`}>
                    
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                          {sections.find(s => s.id === activeSection)?.label} <span className="text-gray-500 font-light not-italic">{editId ? 'DÜZENLE' : 'YENİ EKLE'}</span>
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#ffcc00] mt-3">Veri Yönetim Sistemi v2.0</p>
                      </div>
                      {editId && (
                        <button 
                          onClick={() => { setEditId(null); setFormData(initialFormState); }}
                          className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          İptal Et
                        </button>
                      )}
                    </div>

                    {activeSection === 'banks' ? (
                       <div className="space-y-8">
                         <form onSubmit={handleSubmit} className="space-y-4 bg-[#222222] p-6 rounded-2xl border border-white/5">
                             <input type="text" placeholder="Banka Adı (Örn: Ziraat Bankası)" required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#ffcc00]" />
                             <input type="text" placeholder="IBAN (Örn: TR00 0000 0000 0000 0000 0000 00)" required value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#ffcc00]" />
                             <input type="text" placeholder="Alıcı Adı Soyadı Lti. Şti." required value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#ffcc00]" />
                             <div className="flex space-x-4">
                               <button type="submit" disabled={loading} className="flex-1 bg-[#ffcc00] text-black font-bold p-4 rounded-xl uppercase hover:bg-white transition-colors">{editId ? 'Güncelle' : 'Ekle'}</button>
                               {editId && <button type="button" onClick={() => { setEditId(null); setFormData({...formData, bankName: '', iban: '', receiverName: ''}); }} className="px-6 bg-gray-700 text-white font-bold p-4 rounded-xl uppercase hover:bg-gray-600 transition-colors">İptal</button>}
                             </div>
                         </form>
                      </div>
                   ) : activeSection === 'slider' ? (
                      <div className="space-y-8">
                         <form onSubmit={handleSliderSubmit} className="space-y-4 bg-[#222222] p-6 rounded-2xl border border-white/5">
                             <input type="text" placeholder="Başlık" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm" />
                             <input type="text" placeholder="Alt Başlık" value={formData.subTitle} onChange={e => setFormData({...formData, subTitle: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm" />
                             <input type="text" placeholder="CTA Metni" value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm" />
                             <input type="text" placeholder="CTA Linki" value={formData.ctaLink} onChange={e => setFormData({...formData, ctaLink: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm" />
                             <input type="text" placeholder="Görsel URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm" />
                             <input type="number" placeholder="Sıralama (0-9)" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: Number(e.target.value)})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm" />
                             <div className="flex space-x-4">
                               <button type="submit" disabled={loading} className="flex-1 bg-[#ffcc00] text-black font-bold p-4 rounded-xl uppercase hover:bg-white transition-colors">{editId ? 'Güncelle' : 'Ekle'}</button>
                               {editId && <button type="button" onClick={() => { setEditId(null); setFormData({ ...formData, title: '', subTitle: '', ctaText: '', ctaLink: '', image: '', orderIndex: 0 }); }} className="px-8 bg-gray-700 text-white font-bold p-4 rounded-xl uppercase hover:bg-gray-600 transition-colors">İptal</button>}
                             </div>
                         </form>
                      </div>
                   ) : (
                    <div className="space-y-12">
                     <form onSubmit={handleSubmit} className="space-y-8">
                       
                       {/* Basic Info & VIP Settings Section */}
                       <div className="space-y-10">
                         
                         {/* Tier 1: Identity */}
                         <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffcc00] flex items-center space-x-2">
                               <span className="w-6 h-[1px] bg-[#ffcc00]/30"></span>
                               <span>Kupon Kimliği</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Başlık / Koşu Adı</label>
                                <input 
                                  type="text" 
                                  placeholder="Örn: VIP Agresif İstanbul Altılısı"
                                  required
                                  value={formData.title}
                                  onChange={e => setFormData({...formData, title: e.target.value})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Hipodrom (Pist)</label>
                                <select 
                                  value={formData.track}
                                  onChange={e => setFormData({...formData, track: e.target.value})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors appearance-none"
                                >
                                  {['İstanbul', 'Adana', 'İzmir', 'Şanlıurfa', 'Ankara', 'Bursa', 'Kocaeli', 'Turffontein', 'Laurel Park', 'Keeneland', 'Santa Anita'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                         </div>

                         {/* Tier 2: VIP Settings & Descriptions */}
                         <div className="space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffcc00] flex items-center space-x-2">
                               <span className="w-6 h-[1px] bg-[#ffcc00]/30"></span>
                               <span>Yayın & Satış Kontrolleri</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Görünürlük</label>
                                <select 
                                  value={formData.visibility}
                                  onChange={e => setFormData({...formData, visibility: e.target.value as any})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] appearance-none"
                                >
                                  <option value="vip">🔒 VIP Özel</option>
                                  <option value="sample">👁️ Örnek Gösterim</option>
                                  <option value="public">🌍 Herkese Açık</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Kupon Türü</label>
                                <select 
                                  value={formData.couponType}
                                  onChange={e => setFormData({...formData, couponType: e.target.value as any})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] appearance-none"
                                >
                                  <option value="economic">💰 Ekonomik</option>
                                  <option value="standard">🎯 Standart</option>
                                  <option value="aggressive">💣 Agresif</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Durum</label>
                                <select 
                                  value={formData.status}
                                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] appearance-none"
                                >
                                  <option value="published">🟢 Yayında</option>
                                  <option value="draft">🟡 Taslak</option>
                                  <option value="settled">🔴 Sonuçlandı</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 flex justify-between">
                                  <span>Güven Endeksi</span>
                                  <span className="text-[#ffcc00]">%{formData.confidenceScore}</span>
                                </label>
                                <input 
                                  type="range" min="1" max="100" 
                                  value={formData.confidenceScore}
                                  onChange={e => setFormData({...formData, confidenceScore: parseInt(e.target.value)})}
                                  className="w-full accent-[#ffcc00]"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Öncelik Rozeti</label>
                                <input 
                                  type="text" 
                                  placeholder="Örn: Günün Bankosu"
                                  value={formData.badge}
                                  onChange={e => setFormData({...formData, badge: e.target.value})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Kısa Satış Spotu (Summary)</label>
                                <textarea 
                                  value={formData.shortNote}
                                  onChange={e => setFormData({...formData, shortNote: e.target.value})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] resize-none"
                                  rows={3}
                                  placeholder="Örn: %90 başarı oranlı bugün kü en güçlü kuponumuz."
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Ücret Etiketi</label>
                                <input 
                                  type="text" 
                                  placeholder="Örn: Uygun Kupon / Yüksek Kazanç"
                                  value={formData.priceLabel}
                                  onChange={e => setFormData({...formData, priceLabel: e.target.value})}
                                  className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00]"
                                />
                              </div>
                            </div>
                         </div>
                       </div>

                       {/* Tier 3: Structured Legs (Ayaklar) */}
                         <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffcc00] flex items-center space-x-2">
                               <span className="w-6 h-[1px] bg-[#ffcc00]/30"></span>
                               <span>Kupon Ayakları (Görsel Editör)</span>
                            </h3>

                            <div className="space-y-4">
                               {formData.ayaklar.map((ayak, idx) => (
                                  <div key={idx} className="bg-[#111111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffcc00]/5 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform"></div>
                                     <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                           <div className="flex items-center space-x-3">
                                              <div className="w-10 h-10 bg-[#ffcc00] text-black rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-[#ffcc00]/20">
                                                 {idx + 1}
                                              </div>
                                              <div>
                                                 <h4 className="text-sm font-black italic tracking-wide uppercase">.{idx + 1} AYAK ANALİZİ</h4>
                                                 <p className="text-[9px] text-gray-500 font-bold uppercase">Koşu No: {idx + 1}</p>
                                              </div>
                                           </div>
                                           <div className="flex items-center space-x-4">
                                              <div className="flex items-center space-x-2">
                                                 <input 
                                                   type="checkbox" 
                                                   checked={ayak.banko}
                                                   onChange={(e) => {
                                                      const newAyaklar = [...formData.ayaklar];
                                                      newAyaklar[idx].banko = e.target.checked;
                                                      setFormData({...formData, ayaklar: newAyaklar});
                                                   }}
                                                   className="w-4 h-4 rounded bg-black border-white/10 text-[#ffcc00] focus:ring-[#ffcc00]"
                                                 />
                                                 <label className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest cursor-pointer">BANKO</label>
                                              </div>
                                              <div className="flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                                                 <Gauge size={12} className="text-gray-500" />
                                                 <input 
                                                   type="number" 
                                                   value={ayak.confidence}
                                                   onChange={(e) => {
                                                      const newAyaklar = [...formData.ayaklar];
                                                      newAyaklar[idx].confidence = parseInt(e.target.value);
                                                      setFormData({...formData, ayaklar: newAyaklar});
                                                   }}
                                                   className="w-8 bg-transparent text-[10px] font-black text-[#ffcc00] focus:outline-none"
                                                 />
                                                 <span className="text-[9px] font-bold text-gray-600">%</span>
                                              </div>
                                           </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           <div className="space-y-2">
                                              <label className="text-[9px] font-black uppercase text-gray-500 ml-1">At Numaraları (Sıralı)</label>
                                              <input 
                                                type="text"
                                                placeholder="Örn: 2, 4, 6, 8, 10"
                                                value={ayak.horses}
                                                onChange={(e) => {
                                                   const newAyaklar = [...formData.ayaklar];
                                                   newAyaklar[idx].horses = e.target.value;
                                                   setFormData({...formData, ayaklar: newAyaklar});
                                                }}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-bold text-[#ffcc00] focus:border-[#ffcc00] outline-none transition-colors"
                                              />
                                           </div>
                                           <div className="space-y-2">
                                              <label className="text-[9px] font-black uppercase text-gray-500 ml-1">Kısa Analiz / Banko Notu</label>
                                              <input 
                                                type="text"
                                                placeholder="Örn: Bu mesafede çok şanslı."
                                                value={ayak.analysis}
                                                onChange={(e) => {
                                                   const newAyaklar = [...formData.ayaklar];
                                                   newAyaklar[idx].analysis = e.target.value;
                                                   setFormData({...formData, ayaklar: newAyaklar});
                                                }}
                                                className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-bold focus:border-[#ffcc00] outline-none transition-colors"
                                              />
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* Result Marking Panel (Professional Reporting) */}
                         <div className="space-y-6 pt-10 border-t border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffcc00] flex items-center space-x-2">
                               <span className="w-6 h-[1px] bg-[#ffcc00]/30"></span>
                               <span>Sonuçlandırma & Raporlama</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Sonuç Durumu</label>
                                  <select 
                                    value={formData.resultStatus}
                                    onChange={e => setFormData({...formData, resultStatus: e.target.value as any})}
                                    className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00] appearance-none"
                                  >
                                    <option value="pending">⏳ Bekliyor</option>
                                    <option value="won">🏆 Kazandı</option>
                                    <option value="lost">❌ Kaybetti</option>
                                    <option value="partial">🌗 İade / Kısmi</option>
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Net Kazanç (₺)</label>
                                  <input 
                                    type="text" 
                                    placeholder="Örn: 12500"
                                    value={formData.winnings}
                                    onChange={e => setFormData({...formData, winnings: e.target.value})}
                                    className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00]"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">ROI (%)</label>
                                  <input 
                                    type="number" 
                                    placeholder="Örn: 450"
                                    value={formData.roi}
                                    onChange={e => setFormData({...formData, roi: e.target.value})}
                                    className="w-full bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-[#ffcc00]"
                                  />
                               </div>
                            </div>
                         </div>

                        <div className="flex space-x-4 pt-10">
                          <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 p-6 bg-[#ffcc00] rounded-3xl font-black text-black uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-4 shadow-xl shadow-[#ffcc00]/10 disabled:opacity-50"
                          >
                            <Send size={20} />
                            <span>{loading ? 'İŞLENİYOR...' : (editId ? 'SİSTEMİ GÜNCELLE' : 'VIP KUPONU YAYINLA')}</span>
                          </button>
                          {editId && (
                             <button type="button" onClick={() => { 
                               setEditId(null); 
                               setFormData(initialFormState); 
                             }} className="px-10 bg-gray-900 text-white font-black p-6 rounded-3xl uppercase tracking-widest hover:bg-gray-800 transition-all border border-white/5">İPTAL</button>
                          )}
                        </div>
                      </form>
                    </div>
                  )
                }
              </div>
            
              {/* Right Column: Live Preview */}
                    {(activeSection === 'guncel' || activeSection === 'basarili') && (
                       <div className="xl:w-[450px] bg-[#050505] p-8 lg:max-h-[1200px] overflow-y-auto custom-scrollbar">
                          <div className="sticky top-0 space-y-8">
                             <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ffcc00]">CANLI ÖNİZLEME</h3>
                                <div className="flex items-center space-x-2">
                                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                   <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">REAL-TIME SYNC</span>
                                </div>
                             </div>

                             {/* Premium Coupon Card Preview */}
                             <div className="bg-[#111111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative group">
                                {/* Header / Badge */}
                                <div className="p-6 pb-4 flex justify-between items-start">
                                   <div>
                                      <div className="inline-flex items-center space-x-2 bg-[#ffcc00] text-black px-3 py-1 rounded-full text-[9px] font-black italic uppercase mb-3">
                                         <Star size={10} fill="currentColor" />
                                         <span>{formData.badge || 'VIP ÖZEL SEÇİM'}</span>
                                      </div>
                                      <h4 className="text-xl font-black italic tracking-tight uppercase leading-tight">
                                         {formData.title || 'KUPON BAŞLIĞI'}
                                      </h4>
                                   </div>
                                   <div className="bg-black/50 border border-white/5 p-3 rounded-2xl flex flex-col items-center">
                                      <Info size={16} className="text-[#ffcc00] mb-1" />
                                      <span className="text-[8px] font-black text-gray-400 uppercase leading-none">{formData.track || 'PİST'}</span>
                                   </div>
                                </div>

                                {/* Confidence Bar */}
                                <div className="px-6 mb-6">
                                   <div className="bg-black/50 rounded-2xl p-4 border border-white/5">
                                      <div className="flex justify-between items-center mb-2">
                                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">GÜVEN ENDEKSİ</span>
                                         <span className="text-[10px] font-black text-[#ffcc00] italic">%{formData.confidenceScore}</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                         <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${formData.confidenceScore}%` }}
                                           className="h-full bg-gradient-to-r from-[#ffcc00] to-[#ffa200]"
                                         />
                                      </div>
                                   </div>
                                </div>

                                {/* Ayaklar Preview List */}
                                <div className="px-6 space-y-3 mb-6">
                                   {formData.ayaklar.map((ayak, i) => (
                                      <div key={i} className="flex items-center p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                                         <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black italic ${ayak.banko ? 'bg-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/20' : 'bg-black text-gray-400 border border-white/10'}`}>
                                            {i + 1}
                                         </div>
                                         <div className="flex-1 ml-4 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                               <span className="text-[11px] font-black text-[#ffcc00] tracking-wider truncate">{ayak.horses || '---'}</span>
                                               {ayak.banko && <span className="text-[8px] font-black bg-black text-[#ffcc00] px-1.5 py-0.5 rounded border border-[#ffcc00]/30 italic ml-2">BANKO</span>}
                                            </div>
                                            {ayak.analysis && <p className="text-[9px] text-gray-500 font-bold truncate mt-0.5 uppercase italic">{ayak.analysis}</p>}
                                         </div>
                                      </div>
                                   ))}
                                </div>

                                {/* Footer Price/Meta */}
                                <div className="bg-black/40 p-6 flex justify-between items-center border-t border-white/5">
                                   <div>
                                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{formData.priceLabel || 'VIP ERİŞİM PLANI'}</p>
                                      <p className="text-xl font-black italic tracking-tighter text-[#ffcc00]">₺{formData.kuponBedeli || '---'}</p>
                                   </div>
                                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.couponType === 'economic' ? 'bg-green-500/10 text-green-500' : formData.couponType === 'aggressive' ? 'bg-red-500/10 text-red-500' : 'bg-[#ffcc00]/10 text-[#ffcc00]'}`}>
                                      {formData.couponType}
                                   </div>
                                </div>

                                {/* ROI/Winning Badge if settled */}
                                {formData.status === 'settled' && (
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[15deg]">
                                      <div className="bg-[#ffcc00] text-black px-8 py-3 rounded-2xl shadow-2xl shadow-[#ffcc00]/40 border-4 border-black font-black italic text-2xl tracking-tighter uppercase whitespace-nowrap">
                                         +{formData.roi}% ROI
                                      </div>
                                   </div>
                                )}
                             </div>

                             {/* Sales Messaging Preview */}
                             <div className="bg-[#ffcc00]/5 border border-[#ffcc00]/10 rounded-2xl p-6 italic">
                                <p className="text-[11px] font-bold text-[#ffcc00] leading-relaxed uppercase tracking-tight">
                                   {formData.shortNote || 'Lütfen kupon için kısa bir dikkat çekici metin girin...'}
                                </p>
                             </div>
                          </div>
                       </div>
                  )}
                </div>
              )}
        </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog Modal */}
      <AnimatePresence>
         {confirmDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-[#222222] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
               >
                  <h3 className="text-xl font-black mb-6 text-center">{confirmDialog.title}</h3>
                  <div className="flex gap-4">
                     <button onClick={() => setConfirmDialog(null)} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-black uppercase text-xs hover:bg-gray-600 transition-colors">İptal</button>
                     <button onClick={confirmDialog.onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black uppercase text-xs hover:bg-red-400 transition-colors">Sil</button>
                  </div>
               </motion.div>
            </div>
         )}
         
         {winningsPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-[#222222] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
               >
                  <h3 className="text-xl font-black mb-2 text-center text-[#ffcc00] italic">Tebrikler!</h3>
                  <p className="text-sm font-medium text-gray-400 text-center mb-6">Kazanılan ikramiye tutarını giriniz (Örn: 511.589,37 TL veya sadece sayı)</p>
                  
                  <input 
                     type="text"
                     value={winningsValue}
                     onChange={(e) => setWinningsValue(e.target.value)}
                     className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-center font-bold text-lg focus:outline-none focus:border-[#ffcc00] mb-6"
                     placeholder="Tutar girin..."
                     autoFocus
                  />
                  <div className="flex gap-4">
                     <button onClick={() => setWinningsPrompt(null)} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-black uppercase text-xs hover:bg-gray-600 transition-colors">İptal</button>
                     <button onClick={() => handleResultMarking(winningsPrompt.prediction, winningsPrompt.result, winningsValue)} className="flex-1 py-3 bg-[#ffcc00] text-black rounded-xl font-black uppercase text-xs hover:bg-white transition-colors">Kaydet</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
