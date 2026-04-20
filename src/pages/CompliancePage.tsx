import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CompliancePage() {
  const { slug } = useParams();

  const getTitle = () => {
     switch(slug) {
        case 'kvkk': return 'KVKK Aydınlatma Metni';
        case 'hakkimizda': return 'Hakkımızda';
        case 'yardim': return 'Yardım / S.S.S.';
        case 'reklam': return 'Reklam İletişimi';
        case 'gizlilik': return 'Gizlilik Politikası';
        case 'iade-sartlari': return 'İade Şartları';
        case 'satis-sozlesmesi': return 'Mesafeli Satış Sözleşmesi';
        case 'kullanim-kosullari': return 'Kullanım Koşulları';
        default: return 'Kurumsal';
     }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <main className="max-w-4xl mx-auto py-24 px-4">
        <div className="border-l-4 border-[#ffcc00] pl-8 mb-12">
           <h1 className="text-4xl font-black italic tracking-tighter uppercase">{getTitle()}</h1>
        </div>
        
        <div className="bg-[#0a0a0a] rounded-[40px] border border-white/5 p-10 md:p-16 shadow-2xl">
           <div className="prose prose-invert prose-lg text-gray-400">
               <p>Bu sayfanın içeriği <strong>{getTitle()}</strong> hakkındaki detayları içerir.</p>
               <p>ALTILIYAKALATANADAM olarak tüm süreçlerimizi şeffaf bir şekilde yönetiyor ve hukuki gerekliliklere uyum sağlıyoruz. İlgili yasal düzenlemeler çerçevesinde haklarınız ve sorumluluklarımız hakkında detaylı bilgileri sitemizden veya iletişim kanallarımızdan edinebilirsiniz.</p>
               {slug === 'kvkk' && (
                  <>
                     <h3>Veri Sorumlusu</h3>
                     <p>Kişisel verileriniz, veri sorumlusu sıfatıyla tarafımızca işlenmektedir.</p>
                     <h3>İşlenme Amacı</h3>
                     <p>Toplanan bilgileriniz sistem erişimi, güvenlik ve VIP üyelik yönetimi için depolanmaktadır.</p>
                  </>
               )}
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
