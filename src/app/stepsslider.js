'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function StepsSlider() {
  const [steps, setSteps] = useState(0);
  const [uid, setUid] = useState(null);
  const [isStepsTouched, setIsStepsTouched] = useState(false);

  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

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

  // Load steps from Firestore if exists
  useEffect(() => {
    if (uid) {
      const fetchSteps = async () => {
        const ref = doc(db, `users/${uid}/stats`, today);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.steps !== undefined) {
            setSteps(data.steps);
            console.log('Loaded steps from Firestore:', data.steps);
          }
        }
      };
      fetchSteps();
    }
  }, [uid, today]);

  // Save to Firestore only if user interacted
  useEffect(() => {
    if (uid && isStepsTouched) {
      const ref = doc(db, `users/${uid}/stats`, today);
      console.log(`Saving ${steps} steps for UID ${uid} on ${today}`);

      setDoc(ref, { steps }, { merge: true })
        .then(() => console.log('Steps saved to Firestore'))
        .catch((err) => console.error('Error saving steps:', err));
    }
  }, [steps, uid, today, isStepsTouched]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow w-full max-w-md">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-black">Steps Taken</span>
        <span className="text-green-500 font-bold">{steps.toLocaleString()}</span>
      </div>
      <input
        type="range"
        min="0"
        max="20000"
        step="100"
        value={steps}
        onChange={(e) => {
          setSteps(Number(e.target.value));
          setIsStepsTouched(true);
        }}
        className="w-full accent-green-500"
      />
    </div>
  );
}
