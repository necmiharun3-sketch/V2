import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function Slider() {
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlider = async () => {
        try {
            const data = await dbService.getSliderItems();
            if (data && data.length > 0) {
                setItems(data);
            }
        } catch (err) {
            console.error('Slider fetch error', err);
        } finally {
            setLoading(false);
        }
    };
    fetchSlider();
  }, []);

  if (loading) {
    return (
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-[#050b14] flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffcc00]"></div>
      </section>
    );
  }

  if (items.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % items.length);
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-[#0a0a0a]">
      <AnimatePresence mode="wait">
        <motion.div
          key={items[index].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${items[index].imageUrl}")` }}
        >
          {/* Circular/Oval left dark overlay gradient mimicking the screenshot */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-[50%] md:-left-[25%] w-[150%] md:w-[70%] h-[200%] bg-[#0f0f0f] rounded-full blur-[8px] opacity-95 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto h-full px-4">
         {/* Central Content */}
         <motion.div 
           key={items[index].id + '-content'}
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="relative z-10 max-w-2xl h-full flex flex-col justify-center pb-20"
         >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tighter leading-[1.1] drop-shadow-xl">
                {items[index].title}
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-medium mb-8">
                {items[index].subTitle}
            </p>
            <div>
              <a href={items[index].ctaLink} className="inline-flex items-center space-x-3 bg-[#191919] hover:bg-[#222222] border border-white/10 text-white px-8 py-4 rounded-[30px] font-bold text-sm transition-all group shadow-2xl">
                  <span>{items[index].ctaText}</span>
                  <ArrowRight size={16} className="text-[#ffcc00] group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
         </motion.div>
      </div>

      {/* Floating 18 Years Experience Box (Bottom Left) */}
      <div className="absolute left-4 md:left-8 lg:left-[calc(50%-600px)] bottom-12 flex items-center bg-[#ffcc00] rounded-2xl overflow-hidden shadow-2xl z-20">
        <div className="flex flex-col items-center justify-center py-4 px-6 text-white border-r border-[#d35400]">
          <span className="text-4xl font-black leading-none drop-shadow-md">18</span>
          <span className="text-[10px] uppercase font-black tracking-widest mt-1 text-white/90">Yıllık Deneyim</span>
        </div>
        <div className="flex flex-col bg-[#191919]">
          <button onClick={next} className="p-3 bg-[#181818] hover:bg-[#252525] border-b border-black transition-colors group cursor-pointer">
            <ChevronRight size={18} className="text-white group-hover:text-[#ffcc00] transition-colors" />
          </button>
          <button onClick={prev} className="p-3 bg-[#181818] hover:bg-[#252525] transition-colors group cursor-pointer">
            <ChevronLeft size={18} className="text-white group-hover:text-[#ffcc00] transition-colors" />
          </button>
        </div>
      </div>
    </section>
  );
}
