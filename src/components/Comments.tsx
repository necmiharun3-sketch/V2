import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, Trash2, User } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
}

export default function Comments({ predictionId }: { predictionId: string }) {
  const { profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('predictionId', '==', predictionId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(data);
    });

    return () => unsubscribe();
  }, [predictionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newComment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        predictionId,
        userId: profile.id,
        userName: profile.fullName || 'Anonim',
        content: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-6">
      {profile ? (
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorumunuzu buraya yazın..."
            className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 pr-14 text-sm font-bold focus:outline-none focus:border-[#ffcc00] transition-colors resize-none h-24"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="absolute right-4 bottom-4 p-2 bg-[#ffcc00] text-black rounded-xl hover:bg-white transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div className="bg-[#222222] border border-white/5 p-6 rounded-2xl text-center">
          <p className="text-sm font-bold text-gray-400 mb-4">Yorum yapmak için giriş yapmalısınız.</p>
          <a href="/giris-yap" className="px-6 py-2 bg-[#ffcc00] text-black rounded-xl font-black uppercase text-xs">Giriş Yap</a>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-[#222222]/50 border border-white/5 p-5 rounded-2xl group transition-all hover:bg-[#222222]">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffcc00] to-[#e67e22] flex items-center justify-center">
                  <User size={14} className="text-black" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#ffcc00]">{comment.userName}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString('tr-TR') : 'Yükleniyor...'}
                  </span>
                </div>
              </div>
              
              {(isAdmin || profile?.id === comment.userId) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed font-bold">
              {comment.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-10">
            <MessageCircle size={40} className="text-gray-800 mx-auto mb-4 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-600">Henüz yorum yapılmamış.</p>
          </div>
        )}
      </div>
    </div>
  );
}
