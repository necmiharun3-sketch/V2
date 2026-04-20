/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, Upload, Send, MessageCircle, AlertCircle, Trash2, Check, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { db, auth, storage } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

export default function PaymentNotification() {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    package: '',
    bank: '',
    reference: '',
    amount: '',
    note: ''
  });
  
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
     const fetchInitialData = async () => {
        if (!user) return;
        try {
           const banksSnap = await getDocs(collection(db, 'banks'));
           const paymentsSnap = await getDocs(query(
             collection(db, 'payments'), 
             where('userId', '==', user.uid),
             orderBy('createdAt', 'desc')
           ));
           
           setBanks(banksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
           setMyPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
           console.log("Error fetching data:", err);
        }
     }
     fetchInitialData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleWhatsApp = () => {
    const text = `Ödeme Bildirimi:\nPaket: ${formData.package}\nBanka: ${formData.bank}\nReferans: ${formData.reference}\nTutar: ${formData.amount}\nNot: ${formData.note}`;
    window.open(`https://wa.me/905336711463?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Lütfen dekont dosyasını yükleyin.');
      return;
    }
    if (!user) {
      alert('Lütfen giriş yapın.');
      return;
    }
    
    setLoading(true);
    try {
      let fileUrl = '';
      if (file) {
        const storageRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'payments'), {
         userId: user.uid,
         userEmail: user.email,
         fullName: profile?.fullName || '',
         package: formData.package,
         bank: formData.bank,
         reference: formData.reference,
         amount: formData.amount,
         note: formData.note,
         receiptUrl: fileUrl,
         status: 'pending',
         createdAt: serverTimestamp()
      });
      alert('Ödeme bildiriminiz yönetici onayına gönderildi.');
      setFormData({ package: '', bank: '', reference: '', amount: '', note: '' });
      setFile(null);
      
      // Refresh list (Firestore list usually updates via state in real world, but let's re-fetch for simplicity)
      const q = query(collection(db, 'payments'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setMyPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      console.error(err);
      alert('Gönderim sırasında hata oluştu: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black italic tracking-tighter mb-4">ÖDEME BİLDİRİMİ</h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto italic">
            Havale/EFT işlemlerini buradan kaydedin ve yönetici onayına gönderin.
          </p>
        </div>

        {/* Bank Info Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#222222] border-l-4 border-[#ffcc00] rounded-2xl p-8 mb-12 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard size={120} />
          </div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-[#ffcc00] p-2 rounded-lg">
              <CreditCard size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-black italic">Banka Bilgileri</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6 flex-wrap">
            {banks.map(bank => (
              <div key={bank.id} className="flex-1 min-w-[300px] bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-[#ffcc00] font-black text-lg mb-2">{bank.bankName}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">IBAN:</span>
                  <span className="text-white font-mono text-xs tracking-tighter">{bank.iban}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Alıcı:</span>
                  <span className="text-white font-bold text-xs uppercase">{bank.receiverName}</span>
                </div>
              </div>
            ))}
            {banks.length === 0 && (
              <div className="p-4 text-gray-500 italic">Şu anda banka bilgisi bulunmamaktadır.</div>
            )}
          </div>
          <div className="mt-4 flex items-center space-x-2 text-[10px] text-gray-500 italic">
            <AlertCircle size={12} className="text-[#ffcc00]" />
            <span>Gönderilen bildirimler yönetim panelinde görünür. Onaylandığında üyeliğiniz otomatik güncellenir.</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 shadow-2xl">
              <h4 className="text-xl font-black italic border-b border-white/5 pb-4 mb-8">Bildirim Formu</h4>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Satın Alınan Paket</label>
                  <select 
                    required
                    value={formData.package}
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#ffcc00] transition-colors appearance-none"
                    onChange={(e) => setFormData({...formData, package: e.target.value})}
                  >
                    <option value="">Paket seçin</option>
                    <option value="1 Aylık VIP">1 Aylık VIP</option>
                    <option value="3 Aylık VIP">3 Aylık VIP</option>
                    <option value="1 Yıllık VIP">1 Yıllık VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Ödeme Yapılan Banka</label>
                  <select 
                    required
                    value={formData.bank}
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#ffcc00] transition-colors appearance-none"
                    onChange={(e) => setFormData({...formData, bank: e.target.value})}
                  >
                    <option value="">Banka seçin</option>
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.bankName}>{bank.bankName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Dekont / Referans No</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 123456789"
                    required
                    value={formData.reference}
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#ffcc00] transition-colors"
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  />
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 flex items-center space-x-2">
                    <MessageCircle size={10} className="text-[#ffcc00]" />
                    <span>Dekont Yüklemesi (Zorunlu)</span>
                  </label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer group ${file ? 'border-[#ffcc00] bg-[#ffcc00]/5' : 'border-white/10 hover:border-white/20'}`}>
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    {!file ? (
                      <>
                        <Upload size={32} className="text-gray-600 mb-4 group-hover:text-[#ffcc00] transition-colors" />
                        <p className="text-xs text-gray-500 font-bold">Dekont yüklemek için tıklayın</p>
                        <p className="text-[10px] text-gray-600 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Check size={32} className="text-[#ffcc00] mb-4" />
                        <p className="text-xs text-white font-bold mb-2">{file.name}</p>
                        <button 
                          type="button" 
                          onClick={() => setFile(null)}
                          className="text-[#ffcc00] hover:text-white transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Tutar</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    required
                    value={formData.amount}
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#ffcc00] transition-colors"
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Not</label>
                  <textarea 
                    placeholder="İşlem saati, açıklama, dekont notu..."
                    value={formData.note}
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#ffcc00] transition-colors h-32 resize-none"
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full p-4 bg-transparent border-2 border-[#ffcc00] rounded-2xl font-black text-[#ffcc00] uppercase tracking-widest hover:bg-[#ffcc00] hover:text-black transition-all transform active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                    <span>{loading ? 'Gönderiliyor...' : 'Ödeme Bildirimini Gönder'}</span>
                  </button>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Sorularınız mı var?</span>
                    <button 
                      type="button"
                      onClick={handleWhatsApp}
                      className="w-full p-4 bg-[#25d366] hover:bg-[#128c7e] text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 shadow-xl shadow-[#25d366]/10"
                    >
                      <MessageCircle size={18} />
                      <span>WhatsApp ile İletişime Geç</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Right Side: History */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 h-full">
              <h4 className="text-xl font-black italic border-b border-white/5 pb-4 mb-8">Benim Ödeme Kayıtlarım</h4>
              
              {myPayments.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                   <AlertCircle size={48} className="mb-4" />
                   <p className="text-sm font-bold uppercase tracking-widest">Henüz ödeme kaydı yok.</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                   {myPayments.map((p, idx) => (
                      <div key={idx} className="bg-[#222222] border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[#ffcc00] font-black uppercase tracking-widest text-sm">{p.bank}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : (p.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}`}>
                               {p.status === 'pending' ? 'Bekliyor' : (p.status === 'approved' ? 'Onaylandı' : 'Reddedildi')}
                            </span>
                         </div>
                         <div className="flex items-center space-x-2 text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                            <Clock size={12} />
                            <span>{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString('tr-TR') : '...'}</span>
                         </div>
                         <div className="flex flex-col space-y-1">
                            <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                               <span className="text-gray-500 font-bold">PAKET:</span>
                               <span className="text-white">{p.package}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-white/5 pb-1 pt-1">
                               <span className="text-gray-500 font-bold">REFERANS:</span>
                               <span className="text-white">{p.reference}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1">
                               <span className="text-gray-500 font-bold">TUTAR:</span>
                               <span className="text-[#ffcc00] font-black">₺ {p.amount}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                 </div>
              )}
              
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
