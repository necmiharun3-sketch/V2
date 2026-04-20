import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { Star, CheckCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';

export default function VipPage() {
  const [banks, setBanks] = useState<any[]>([]);
  const packages = [
    { title: '1 Aylık VIP', price: '400 ₺', duration: '1 Ay', features: ['Tüm Kilitli Kuponlara Erişim', 'VIP WhatsApp Grubu', 'Özel Analizler'] },
    { title: '3 Aylık VIP', price: '1000 ₺', duration: '3 Ay', features: ['Tüm Kilitli Kuponlara Erişim', 'VIP WhatsApp Grubu', 'Özel Analizler', 'Birebir Danışmanlık'] },
    { title: '1 Yıllık VIP', price: '3500 ₺', duration: '1 Yıl', features: ['Tüm Kilitli Kuponlara Erişim', 'VIP WhatsApp Grubu', 'Özel Analizler', 'Sınırsız Birebir Destek', 'Erken Erişim'] },
  ];

  useEffect(() => {
    dbService.getBanks().then(setBanks);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <main className="max-w-7xl mx-auto py-24 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
           <Star size={64} className="text-[#ffcc00] mx-auto mb-6" />
           <h1 className="text-4xl md:text-5xl font-black italic mb-6 tracking-tighter uppercase">Nasıl <span className="text-gray-400">VIP Üye Olurum?</span></h1>
           <p className="text-gray-400 max-w-2xl mx-auto font-medium">Banka veya IBAN üzerinden ödemenizi gerçekleştirdikten sonra "Ödeme Bildirimi" sayfasından dekontunuzu bize ileterek anında VIP ayrıcalıklarına sahip olabilirsiniz.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {packages.map((pkg, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 hover:border-[#ffcc00]/30 transition-all shadow-2xl relative"
             >
                <h3 className="text-2xl font-black italic text-[#ffcc00] mb-2 uppercase">{pkg.title}</h3>
                <div className="text-4xl font-black mb-8">{pkg.price}</div>
                <div className="space-y-4 mb-10 text-left">
                   {pkg.features.map((f, i) => (
                     <div key={i} className="flex items-center space-x-3 text-sm text-gray-300 font-medium">
                       <CheckCircle size={16} className="text-[#ffcc00]" />
                       <span>{f}</span>
                     </div>
                   ))}
                </div>
                <Link to="/odeme-bildirimi" className="block w-full p-4 bg-[#222222] border border-white/10 rounded-2xl font-black uppercase text-xs hover:bg-[#ffcc00] hover:text-black transition-all">Şimdi Satın Al</Link>
             </motion.div>
           ))}
        </div>

        <div className="mt-24 max-w-3xl mx-auto bg-[#222222] rounded-3xl p-8 flex items-start space-x-6">
           <Shield size={48} className="text-[#ffcc00]" />
           <div className="text-left w-full">
             <h4 className="text-xl font-black italic mb-4 uppercase">Ödeme Bilgileri</h4>
             <div className="space-y-4">
                {banks.map((bank, i) => (
                   <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <p className="text-[#ffcc00] font-black">{bank.bankName}</p>
                      <p className="text-xs font-mono text-white mt-1">{bank.iban}</p>
                      <p className="text-[10px] text-gray-500 uppercase mt-1">{bank.receiverName}</p>
                   </div>
                ))}
                {banks.length === 0 && (
                  <p className="text-sm text-gray-500">Banka bilgileri yükleniyor...</p>
                )}
             </div>
             <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-widest italic">Açıklamaya kullanıcı adınızı eklemeyi unutmayın.</p>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
