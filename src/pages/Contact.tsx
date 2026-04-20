/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      alert('Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
       console.error(error);
       alert('Mesaj gönderilirken bir hata oluştu.');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#ffcc00]">
      <Header />
      
      <main>
        {/* Banner with Breadcrumb */}
        <section className="relative h-[250px] overflow-hidden flex items-center px-4">
          <div className="absolute inset-0 bg-[#000000] opacity-80 z-10" />
          <img 
            src="https://picsum.photos/seed/race_contact/1920/600" 
            alt="Race" 
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="max-w-7xl mx-auto w-full relative z-20">
            <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-[#ffcc00]">
              <span>Anasayfa</span>
              <ChevronRight size={14} />
              <span className="text-gray-400">İletişim</span>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto py-20 px-4">
          {/* Title Area */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 px-4">
            <div className="border-l-4 border-[#ffcc00] pl-8">
              <h1 className="text-5xl font-black italic tracking-tighter underline decoration-[#ffcc00] decoration-4 underline-offset-8">
                Sizin için <span className="text-gray-400">Buradayız!</span>
              </h1>
            </div>
            <div className="bg-[#222222]/40 border-l-4 border-gray-700 p-6 rounded-2xl flex items-center space-x-6 mt-8 md:mt-0">
               <div className="max-w-xs text-xs text-gray-500 font-bold leading-relaxed italic">
                 Soru, istek ve önerileriniz için aşağıda ki formu kullanabilir veya <br />
                 <a href="https://wa.me/905336711463" target="_blank" rel="noreferrer" className="text-[#ffcc00] hover:underline font-bold">WhatsApp (+90 533 671 14 63)</a> üzerinden iletişime geçebilirsiniz.
               </div>
               <MessageCircle size={32} className="text-[#ffcc00] opacity-30 animate-pulse" />
            </div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-[50px] p-8 md:p-16 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffcc00] blur-[150px] opacity-5 pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="İsim Soyisim*" 
                  required
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-[#ffcc00] transition-colors"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder="E-Posta Adresiniz*" 
                  required
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-[#ffcc00] transition-colors"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="tel" 
                  placeholder="(05xx) xxx xx xx" 
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-[#ffcc00] transition-colors"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Konu" 
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-[#ffcc00] transition-colors"
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              <textarea 
                placeholder="Mesajınız" 
                required
                className="w-full bg-[#222222] border border-white/10 rounded-3xl p-8 focus:outline-none focus:border-[#ffcc00] transition-colors h-48 resize-none"
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
              
              <button 
                type="submit"
                className="w-full p-6 bg-transparent border-2 border-[#ffcc00] rounded-2xl font-black text-[#ffcc00] uppercase tracking-[0.3em] hover:bg-[#ffcc00] hover:text-black transition-all transform active:scale-95 shadow-xl shadow-[#ffcc00]/5"
              >
                Mesaj Gönder
              </button>
            </form>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
