/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (location.state?.showReset) {
      setIsResetMode(true);
      setError('Şifre sıfırlama bağlantısı göndermek için lütfen E-posta Adresinizi girin.');
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetMode) {
      handleResetPassword();
      return;
    }
    setLoading(true);
    setError('');
    setResetMessage('');
    try {
      let loginEmail = identifier;

      // Check if identifier is an email (contains @)
      if (!identifier.includes('@')) {
        // Assume it's a phone number, look up email in Firestore
        const q = query(collection(db, 'users'), where('phone', '==', identifier));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('Geçersiz telefon numarası veya e-posta adresi.');
        }
        
        // Use the email from the first matching user document
        loginEmail = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message === 'Geçersiz telefon numarası veya e-posta adresi.') {
        setError(err.message);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Geçersiz e-posta adresi veya şifre.');
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!identifier) {
      setError('Şifre sıfırlama bağlantısı göndermek için lütfen e-posta adresinizi veya telefon numaranızı girin.');
      return;
    }
    setLoading(true);
    setError('');
    setResetMessage('');
    try {
      let resetEmail = identifier;

      // Check if identifier is an email (contains @)
      if (!identifier.includes('@')) {
        // Assume it's a phone number, look up email in Firestore
        const q = query(collection(db, 'users'), where('phone', '==', identifier));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('Geçersiz telefon numarası veya e-posta adresi.');
        }
        
        // Use the email from the first matching user document
        resetEmail = querySnapshot.docs[0].data().email;
      }

      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.message === 'Geçersiz telefon numarası veya e-posta adresi.') {
        setError(err.message);
      } else {
        setError('Şifre sıfırlama e-postası gönderilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      
      <main className="max-width-7xl mx-auto py-32 px-4 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl"
        >
          <div className="border-l-4 border-[#ffcc00] pl-6 mb-12">
            <h2 className="text-4xl font-black italic tracking-tighter">{isResetMode ? 'Şifremi Unuttum' : 'Üye Girişi'}</h2>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffcc00] blur-[100px] opacity-10 pointer-events-none" />
            
            <p className="text-gray-400 text-sm mb-10 text-center font-medium opacity-60 italic">
              {isResetMode 
                ? 'Şifre sıfırlama bağlantısı almak için sisteme kayıtlı e-posta adresinizi veya telefon numaranızı giriniz.' 
                : 'Lütfen kayıtlı e-posta adresiniz veya telefon numaranız ile giriş yapın.'}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold">
                {error}
              </div>
            )}
            
            {resetMessage && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-2xl mb-6 text-sm font-bold">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="E-posta veya Telefon Numarası"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#ffcc00] transition-colors"
                />
              </div>

              {!isResetMode && (
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Şifre"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#222222] border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#ffcc00] transition-colors pr-14"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button 
                  type="button" 
                  onClick={() => setIsResetMode(!isResetMode)} 
                  className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-xs font-bold"
                >
                  <Smartphone size={14} className="text-[#ffcc00]" />
                  <span className="border-b border-white/10">{isResetMode ? 'Giriş Yapmaya Dön' : 'Şifremi Unuttum'}</span>
                </button>

                {!isResetMode && (
                  <Link 
                    to="/kayit-ol" 
                    className="text-gray-500 hover:text-white transition-colors text-xs font-bold border-b border-white/10"
                  >
                    Hemen Kayıt Ol
                  </Link>
                )}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full p-5 bg-transparent border-2 border-[#ffcc00] rounded-2xl font-black text-[#ffcc00] uppercase tracking-widest hover:bg-[#ffcc00] hover:text-black transition-all transform active:scale-95 shadow-xl shadow-[#ffcc00]/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'İşlem Yapılıyor...' 
                  : (isResetMode ? 'Sıfırlama Bağlantısı Gönder' : 'Giriş Yap')}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
