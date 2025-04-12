'use client';

import { useState, useEffect } from 'react';
import StepsSlider from './stepsslider';
import { db, auth } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ActionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [uid, setUid] = useState(null);
  const [water, setWater] = useState(0);
  const [isWaterTouched, setIsWaterTouched] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Get current user UID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User signed in:', user.uid);
        setUid(user.uid);
      } else {
        console.log('No user signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  // Load water from Firestore on mount
  useEffect(() => {
    if (uid) {
      const fetchExisting = async () => {
        const ref = doc(db, `users/${uid}/stats`, today);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.water !== undefined) {
            setWater(data.water);
            console.log('Loaded water from Firestore:', data.water);
          }
        }
      };
      fetchExisting();
    }
  }, [uid, today]);

  // Save water to Firestore only if user interacted
  useEffect(() => {
    if (uid && isWaterTouched) {
      const ref = doc(db, `users/${uid}/stats`, today);
      console.log(`Saving ${water} cups water for UID ${uid} on ${today}`);
      setDoc(ref, { water }, { merge: true })
        .then(() => console.log('Water saved to Firestore'))
        .catch((err) => console.error('Error saving water:', err));
    }
  }, [water, uid, today, isWaterTouched]);

  // ESC key closes panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        Actions
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm bg-black/40"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-80 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-black">Action Panel</h2>

            {/* Water Counter */}
            <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl shadow">
              <button
                onClick={() => {
                  setWater(Math.max(0, water - 1));
                  setIsWaterTouched(true);
                }}
                className="bg-blue-500 text-white w-10 h-10 rounded-full text-xl hover:bg-blue-600 transition"
              >
                –
              </button>
              <div className="text-center">
                <div className="text-lg font-semibold text-black">Drink Water</div>
                <div className="text-blue-500 font-bold text-xl">{water}</div>
              </div>
              <button
                onClick={() => {
                  setWater(water + 1);
                  setIsWaterTouched(true);
                }}
                className="bg-blue-500 text-white w-10 h-10 rounded-full text-xl hover:bg-blue-600 transition"
              >
                +
              </button>
            </div>

            {/* Steps Slider */}
            <StepsSlider />

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
