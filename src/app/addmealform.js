'use client';

import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/authcontext';

export default function AddMealForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    mealName: '',
    mealTime: '',
    servingSize: '',
    calories: '',
    totalFat: '',
    saturatedFat: '',
    cholesterol: '',
    sodium: '',
    totalCarbs: '',
    dietaryFiber: '',
    sugars: '',
    protein: '',
    vitaminA: '',
    vitaminC: '',
    calcium: '',
    iron: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveMeal = async () => {
    if (!user?.uid) return;

    const today = new Date().toISOString().split('T')[0];
    const mealRef = collection(db, `users/${user.uid}/stats/${today}/meals`);

    await addDoc(mealRef, {
      ...formData,
      timestamp: serverTimestamp(),
    });

    alert('Meal saved!');
  };

  const inputClass =
    'bg-neutral-900 text-white border border-neutral-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 text-white">
      <h2 className="text-xl font-bold">Add Meal</h2>

      {/* Meta Info */}
      <details className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
        <summary className="cursor-pointer font-semibold text-lg">📝 Meta Info</summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <label className="flex flex-col gap-1 text-sm">
            Meal Name
            <input name="mealName" placeholder="e.g., Chicken Salad" className={inputClass} onChange={handleChange} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Meal Time
            <input name="mealTime" placeholder="e.g., 12:30 PM" className={inputClass} onChange={handleChange} />
          </label>
          <label className="flex flex-col gap-1 text-sm col-span-full">
            Serving Size
            <input name="servingSize" placeholder="e.g., 250 g" className={inputClass} onChange={handleChange} />
          </label>
        </div>
      </details>

      {/* Macronutrients */}
      <details className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
        <summary className="cursor-pointer font-semibold text-lg">🥩 Macronutrients</summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[
            { name: 'calories', label: 'Calories (kcal)' },
            { name: 'totalFat', label: 'Total Fat (g)' },
            { name: 'saturatedFat', label: 'Saturated Fat (g)' },
            { name: 'cholesterol', label: 'Cholesterol (mg)' },
            { name: 'sodium', label: 'Sodium (mg)' },
            { name: 'totalCarbs', label: 'Total Carbohydrates (g)' },
            { name: 'dietaryFiber', label: 'Dietary Fiber (g)' },
            { name: 'sugars', label: 'Sugars (g)' },
            { name: 'protein', label: 'Protein (g)' },
          ].map((field) => (
            <label key={field.name} className="flex flex-col gap-1 text-sm">
              {field.label}
              <input
                name={field.name}
                placeholder={field.label}
                className={inputClass}
                onChange={handleChange}
              />
            </label>
          ))}
        </div>
      </details>

      {/* Micronutrients */}
      <details className="border border-neutral-700 rounded-lg p-4 bg-neutral-800">
        <summary className="cursor-pointer font-semibold text-lg">🍊 Micronutrients</summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[
            { name: 'vitaminA', label: 'Vitamin A (mcg)' },
            { name: 'vitaminC', label: 'Vitamin C (mg)' },
            { name: 'calcium', label: 'Calcium (mg)' },
            { name: 'iron', label: 'Iron (mg)' },
            // You can extend with more micronutrients as needed
          ].map((field) => (
            <label key={field.name} className="flex flex-col gap-1 text-sm">
              {field.label}
              <input
                name={field.name}
                placeholder={field.label}
                className={inputClass}
                onChange={handleChange}
              />
            </label>
          ))}
        </div>
      </details>

      <button
        onClick={saveMeal}
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-bold w-full"
      >
        Save Meal
      </button>
    </div>
  );
}
