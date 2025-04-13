'use client';

import { useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function FillMockData() {
  useEffect(() => {
    const generateData = async (uid) => {
      const today = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);

      const days = Math.floor((today - start) / (1000 * 60 * 60 * 24));

      for (let i = 0; i <= days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const dateStr = date.toISOString().split('T')[0];

        // Randomize junk stats (simulate ~50% goal success)
        const steps = Math.floor(Math.random() * 30000); // 0–12k steps
        const water = Math.floor(Math.random() * 20);     // 0–15 cups

        const statsRef = doc(db, `users/${uid}/stats/${dateStr}`);
        await setDoc(statsRef, {
          steps,
          water,
        });
      }

      console.log('Mock data uploaded!');
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        generateData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  return <p className="text-white text-center mt-4">Generating mock data...</p>;
}

