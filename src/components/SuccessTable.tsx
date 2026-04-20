/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { formatDate } from '../lib/utils';
import { APP_LOGO_URL } from '../constants';

export default function SuccessTable() {
  const navigate = useNavigate();
  const [successList, setSuccessList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dbService.getPredictions('success');
        setSuccessList(data.slice(0, 6)); // show latest 6 to fill grid
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="bg-[#050b14] py-20 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex items-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight flex items-end">
              <span className="font-extrabold relative pb-1 mr-2 inline-block">
                Başarılı
                <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#ffcc00]"></span>
              </span>
              <span className="font-light">Tahminler</span>
            </h2>
          </div>
          
          <div className="md:max-w-md border-l-[3px] border-[#ffcc00] pl-6 py-1 h-full flex items-center">
            <p className="text-[#647c9f] text-[13px] md:text-sm font-medium leading-relaxed">
              ALTILIYAKALATANADAM.com Vip üyelerine bugüne kadar toplam <span className="text-[#ffcc00] font-black">5.791</span> koşuda<br/>
              <span className="text-[#ffcc00] font-black">6.177.230,75</span> TL kazandırdı
            </p>
          </div>
        </div>

        {/* Table Area */}
        <div className="w-full rounded-2xl shadow-2xl border border-white/5 bg-[#191919] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm md:text-base border-collapse">
              <thead className="bg-[#222222] text-white/90 font-semibold border-b border-white/10">
                <tr className="divide-x divide-white/10">
                  <th className="px-6 py-5 font-semibold">Tarih</th>
                  <th className="px-6 py-5 font-semibold">Yorumcu</th>
                  <th className="px-6 py-5 font-semibold">Koşu Adı</th>
                  <th className="px-6 py-5 font-semibold text-center">İkramiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#7393b8]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center italic">Yükleniyor...</td>
                </tr>
              ) : successList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center italic">Kayıtlı veri bulunamadı.</td>
                </tr>
              ) : (
                successList.map((p, i) => (
                  <motion.tr 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/tahmin/${p.slug}`)}
                    className="hover:bg-[#222222] cursor-pointer transition-colors divide-x divide-white/5 even:bg-[#0f0f0f] odd:bg-[#191919]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                       {formatDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black">
                          <img src={p.image || APP_LOGO_URL} alt={p.authorName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium">{p.authorName || 'ALTILIYAKALATANADAM'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="flex-1">{p.title}</span>
                        {p.resultStatus === 'won' && (
                          <span className="bg-green-500/20 text-green-500 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-green-500/20 whitespace-nowrap">Tuttu</span>
                        )}
                        {p.resultStatus === 'partial' && (
                          <span className="bg-orange-500/20 text-orange-500 text-[9px] font-black uppercase px-2 py-1 rounded-full border border-orange-500/20 whitespace-nowrap">Kısmen</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold tracking-wide text-[#ffcc00]">
                      {p.winnings || '0,00 TL'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </section>
  );
}

