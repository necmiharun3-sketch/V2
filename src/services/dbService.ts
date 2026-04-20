import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  limit, 
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export const dbService = {
  async getPredictions(type: 'current' | 'success') {
    try {
      const q = query(
        collection(db, 'predictions'), 
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('getPredictions error:', err);
      return [];
    }
  },

  async getPredictionBySlug(slug: string) {
    try {
      const q = query(collection(db, 'predictions'), where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() };
    } catch (err) {
      console.error('getPredictionBySlug error:', err);
      return null;
    }
  },

  async getBlogPosts() {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('getBlogPosts error:', err);
      return [];
    }
  },

  async getBlogPostBySlug(slug: string) {
    try {
      const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() };
    } catch (err) {
      console.error('getBlogPostBySlug error:', err);
      return null;
    }
  },

  async getBanks() {
    try {
      const q = query(collection(db, 'banks'), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('getBanks error:', err);
      return [];
    }
  },

  async getSliderItems() {
    try {
      const q = query(collection(db, 'slider'), where('active', '==', true), orderBy('orderIndex', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('getSliderItems error:', err);
      return [];
    }
  },

  async getSystemStats() {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnap.size;
      const vipUsers = usersSnap.docs.filter(d => d.data().isVip === true).length;
      return { totalUsers, vipUsers };
    } catch (err) {
      console.error('getSystemStats error:', err);
      return { totalUsers: 0, vipUsers: 0 };
    }
  }
};
