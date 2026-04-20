import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ExternalLink, CalendarDays } from 'lucide-react';

export default function Program() {
  const [key, setKey] = useState(0); // Used to force refresh the iframe
  const iframeUrl = "https://www.tjk.org/TR/YarisSever/Info/Program/GunlukYarisProgrami";

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2 flex items-center gap-4">
              Günlük <span className="text-[#ffcc00]">Yarış Programları</span>
            </h1>
            <p className="text-gray-400 font-medium">TJK resmi günlük yarış programı ve detayları.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="flex items-center space-x-2 text-white hover:text-[#ffcc00] transition-colors bg-[#151e2e] border border-white/10 hover:border-[#ffcc00]/30 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest"
            >
              <RefreshCw size={16} />
              <span>Yenile</span>
            </button>
            <a 
              href={iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-black bg-[#ffcc00] hover:bg-white transition-colors px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest"
            >
              <ExternalLink size={16} />
              <span>TJK'da Aç</span>
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#191919] border border-white/5 shadow-2xl rounded-3xl overflow-hidden relative"
          style={{ height: '75vh', minHeight: '600px' }}
        >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-50"></div>
            
            <iframe 
               key={key}
               src={iframeUrl}
               className="w-full h-full bg-white"
               frameBorder="0"
               title="TJK Günlük Yarış Programı"
            />
        </motion.div>

      </div>
    </div>
  );
}
