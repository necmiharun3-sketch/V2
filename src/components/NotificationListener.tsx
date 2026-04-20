import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, Star, FileText, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationListener() {
  const navigate = useNavigate();
  const [lastCheck, setLastCheck] = useState<number>(Date.now());

  useEffect(() => {
    // Listen for new announcements (General, Predictions, Blogs)
    const qAnnouncements = query(
      collection(db, 'announcements'),
      where('createdAt', '>', Timestamp.fromMillis(lastCheck)),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Determine notification style based on type
          let borderColor = 'border-blue-500/30';
          let iconBg = 'bg-blue-500/10';
          let iconColor = 'text-blue-500';
          let Icon = Megaphone;

          if (data.type === 'prediction') {
             borderColor = 'border-[#ffcc00]/30';
             iconBg = 'bg-[#ffcc00]/10';
             iconColor = 'text-[#ffcc00]';
             Icon = Star;
          } else if (data.type === 'blog') {
             borderColor = 'border-green-500/30';
             iconBg = 'bg-green-500/10';
             iconColor = 'text-green-500';
             Icon = FileText;
          }

          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#191919] shadow-2xl rounded-[24px] pointer-events-auto flex border ${borderColor} overflow-hidden`}>
              <div 
                className="flex-1 w-0 p-4 cursor-pointer" 
                onClick={() => { 
                  if (data.link) navigate(data.link);
                  toast.dismiss(t.id); 
                }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
                      <Icon size={18} className={iconColor} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-xs font-black ${iconColor} uppercase tracking-widest`}>{data.badge || 'BİLDİRİM'}</p>
                    <p className="text-sm font-bold text-white mt-1 leading-tight">{data.title}</p>
                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">{data.content}</p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/5">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          ), { duration: 6000 });
        }
      });
    });

    return () => {
      unsubscribeAnnouncements();
    };
  }, [lastCheck, navigate]);

  return <Toaster position="top-right" />;
}
