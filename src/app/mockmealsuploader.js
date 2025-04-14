'use client';

import { useState } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const mockMeals = [
  {
    mealName: "Mock Meal 1", mealTime: "11:30", servingSize: "346g", calories: 208.36,
    totalFat: 333.74, saturatedFat: 426.01, cholesterol: 41.44, sodium: 101.84,
    totalCarbs: 366.74, dietaryFiber: 332.62, sugars: 118.48, protein: 47.6,
    vitaminA: 316.77, vitaminC: 43.75, calcium: 142.76, iron: 381.06,
  },
  {
    mealName: "Mock Meal 2", mealTime: "12:30", servingSize: "351g", calories: 280.91,
    totalFat: 444.68, saturatedFat: 281.89, cholesterol: 449.56, sodium: 213.79,
    totalCarbs: 105.27, dietaryFiber: 401.56, sugars: 273.92, protein: 374.29,
    vitaminA: 358.19, vitaminC: 274.08, calcium: 195.08, iron: 6.27,
  },
  {
    mealName: "Mock Meal 3", mealTime: "17:00", servingSize: "228g", calories: 211.28,
    totalFat: 129.83, saturatedFat: 332.62, cholesterol: 49.16, sodium: 213.94,
    totalCarbs: 116.96, dietaryFiber: 228.59, sugars: 213.48, protein: 380.08,
    vitaminA: 90.91, vitaminC: 6.59, calcium: 76.21, iron: 184.32,
  },
  {
    mealName: "Mock Meal 4", mealTime: "13:00", servingSize: "183g", calories: 250.45,
    totalFat: 311.65, saturatedFat: 377.88, cholesterol: 341.27, sodium: 301.82,
    totalCarbs: 203.32, dietaryFiber: 196.57, sugars: 178.51, protein: 456.83,
    vitaminA: 129.88, vitaminC: 373.9, calcium: 249.28, iron: 31.48,
  },
  {
    mealName: "Mock Meal 5", mealTime: "10:30", servingSize: "276g", calories: 391.73,
    totalFat: 273.11, saturatedFat: 460.4, cholesterol: 289.53, sodium: 140.26,
    totalCarbs: 372.01, dietaryFiber: 142.86, sugars: 407.32, protein: 48.96,
    vitaminA: 439.26, vitaminC: 423.38, calcium: 37.54, iron: 453.5,
  }
];

export default function MockMealsUploader() {
  const [status, setStatus] = useState('idle');

  const handleUpload = async () => {
    setStatus('uploading');

    onAuthStateChanged(auth, async (user) => {
      if (!user) return setStatus('error');

      const today = new Date().toISOString().split('T')[0];
      const mealCollection = collection(db, `users/${user.uid}/stats/${today}/meals`);

      for (const meal of mockMeals) {
        await addDoc(mealCollection, {
          ...meal,
          timestamp: serverTimestamp(),
        });
      }

      setStatus('done');
    });
  };

  return (
    <div className="flex flex-col items-center mt-10 gap-2 text-white">
      <button
        onClick={handleUpload}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold text-white transition"
      >
        Insert Mock Meals for Today
      </button>
      {status === 'uploading' && <p className="text-yellow-300">Uploading...</p>}
      {status === 'done' && <p className="text-green-400">Mock meals added!</p>}
      {status === 'error' && <p className="text-red-400">Failed to authenticate.</p>}
    </div>
  );
}
