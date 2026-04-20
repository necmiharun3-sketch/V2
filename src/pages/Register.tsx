/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    terms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms) return;
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Create user document in Firestore (Optional if blocked)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          email: formData.email,
          fullName: `${formData.name} ${formData.surname}`,
          phone: formData.phone,
          role: 'user',
          isVip: false,
          createdAt: serverTimestamp()
        });
      } catch (dbErr) {
        console.warn('Could not save user data to Firestore, defaulting to basic auth:', dbErr);
      }

      // 3. Send Email Verification (Arka planda gönderilir, kullanıcıyı engellemez)
      sendEmailVerification(user).catch(console.error);

      setSuccessMessage('Kayıt başarılı! Doğrulama e-postası adresinize gönderildi. Hesabınıza giriş yapıldı, yönlendiriliyorsunuz...');
      
      // Auto-login and navigate to homepage immediately
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanımda.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre en az 6 karakter olmalıdır.');
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto py-20 px-4">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="border-l-4 border-[#ffcc00] pl-6 mb-8">
              <h2 className="text-4xl font-black italic tracking-tighter">Üyelik Formu</h2>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-2xl mb-6 text-sm font-bold">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="İsim"
                      required
                      className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#ffcc00] transition-colors"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Soyisim"
                      required
                      className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#ffcc00] transition-colors"
                      onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    />
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="E-Posta Adresiniz"
                    required
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#ffcc00] transition-colors"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="Telefon Numaranız"
                    required
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#ffcc00] transition-colors"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Şifre"
                    required
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#ffcc00] transition-colors pr-14"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="flex items-start space-x-4 group cursor-pointer" onClick={() => setFormData({...formData, terms: !formData.terms})}>
                  <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.terms ? 'bg-[#ffcc00] border-[#ffcc00]' : 'border-white/20 hover:border-white/40'}`}>
                    {formData.terms && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-gray-400 text-xs leading-relaxed flex-1">
                    18 yaş üstünde olduğumu ve kullanım koşullarını eksiksiz okudum, anladım ve kabul ediyorum.
                  </span>
                </div>

                <p className="text-[10px] text-gray-600 italic">
                  KVKK kapsamının detaylarına, ALTILIYAKALATANADAM.com <a href="/yasal/kvkk-politikasi-10" className="text-[#ffcc00] border-b border-[#ffcc00]/20">Kişisel Verilerin Korunması ve İşlenmesi</a> şartlarının yer aldığı sayfamızdan ulaşabilirsiniz.
                </p>

                <button 
                  type="submit"
                  disabled={!formData.terms || loading}
                  className="w-full p-5 bg-transparent border-2 border-[#ffcc00] rounded-2xl font-black text-[#ffcc00] uppercase tracking-widest hover:bg-[#ffcc00] hover:text-black transition-all transform active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#ffcc00] disabled:cursor-not-allowed"
                >
                  {loading ? 'Kayıt Olunuyor...' : 'Gönder'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Right Column: Terms */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-[400px]"
          >
            <div className="border-l-4 border-gray-700 pl-6 mb-8">
              <h2 className="text-4xl font-black italic tracking-tighter text-gray-400">Kullanım Koşulları</h2>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 h-[600px] overflow-y-auto scrollbar-hide text-gray-500 text-sm leading-relaxed space-y-4">
              <p>Bu sözleşme, sitemizdeki hizmetlerden faydalanabilmeniz için gerekli kuralları içermektedir. Kullanıcı, Site'ye üye olarak, Kullanıcı Sözleşmesi'nin tamamını okuduğunu, içeriğini bütünü ile anladığını ve tüm hükümlerini onayladığını kabul, beyan ve taahhüt eder.</p>
              <p>1 - Üyelik Ücreti ve Ödeme: ALTILIYAKALATANADAM.COM'a üyelik ücretsizdir. ALTILIYAKALATANADAM.COM’daki güncel tahminlerden faydalanabilmek için ücretli üyelik olan, VIP Üyeliğe geçiş yapmak gerekir.</p>
              <p>2 - Üyelik Formundaki Bilgiler: ALTILIYAKALATANADAM.COM tarafından sunulan üyelik formunu eksiksiz ve geçerli olarak dolduranlar üye olabilir. Geçerli ve aktif olan bir e-posta adresi ile üyenin kendisine ait olan Cep Telefonu Numarasını bildirilmesi zorunludur. Bilgilerin doğruluğu her üyenin kendi sorumluluğundadır.</p>
              <p>3 - Sunulan Hizmetler : ALTILIYAKALATANADAM.COM, Türkiye ve dünyadaki at yarışları konusunda; tahmin, yorum, haber, istatistik, program gibi bilgileri üyelerine sunar. ALTILIYAKALATANADAM.COM, sunulan hizmet çeşidini ve/veya kalitesini azaltma veya arttırma hakkını saklı tutar.</p>
              <p>4 - Üyelerin Sorumluluğu: Üye, ALTILIYAKALATANADAM.COM üzerinde gerçekleştirdiği her türlü işlemde sorumluluk kendisindedir. Üye, suç teşkil edecek, yasal açıdan takip gerektirecek, yerel veya uluslararası düzeyde kanunları ihlal edecek içerikler paylaşamaz.</p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
