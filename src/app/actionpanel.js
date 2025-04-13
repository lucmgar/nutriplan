'use client';

import { useState, useEffect } from 'react';
import StepsSlider from './stepsslider';
import AddMealForm from './addmealform';
import { db, auth } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ActionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [uid, setUid] = useState(null);
  const [water, setWater] = useState(0);
  const [isWaterTouched, setIsWaterTouched] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Auth listener
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

  // Load water data on mount
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

  // Save water when changed
  useEffect(() => {
    if (uid && isWaterTouched) {
      const ref = doc(db, `users/${uid}/stats`, today);
      console.log(`Saving ${water} cups water for UID ${uid} on ${today}`);
      setDoc(ref, { water }, { merge: true })
        .then(() => console.log('Water saved to Firestore'))
        .catch((err) => console.error('Error saving water:', err));
    }
  }, [water, uid, today, isWaterTouched]);

  // Close on Escape
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
            className="bg-neutral-900 p-6 rounded-xl shadow-xl w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Action Panel</h2>

            {/* Controls: Water & Steps */}
            <div className="flex flex-col md:flex-row gap-6 justify-between mb-6">
              {/* Water Counter */}
              <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl shadow w-full md:w-1/2">
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

              {/* Steps */}
              <div className="w-full md:w-1/2">
                <StepsSlider />
              </div>
            </div>

            {/* Meal Form */}
            <div className="mt-4">
              <AddMealForm />
            </div>

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
