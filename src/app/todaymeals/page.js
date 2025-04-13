'use client';

import { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../../context/authcontext';

export default function TodayMeals() {
    const { user } = useAuth();
    const [meals, setMeals] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
  
    const dateStr = selectedDate.toISOString().split('T')[0];
  
    const formatWithSuffix = (date) => {
      const day = date.getDate();
      const suffix =
        day >= 11 && day <= 13
          ? 'th'
          : ['st', 'nd', 'rd'][((day % 10) - 1)] || 'th';
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      return `${month} ${day}${suffix}, ${year}`;
    };
  
    useEffect(() => {
      if (!user?.uid) return;
  
      const mealRef = collection(db, `users/${user.uid}/stats/${dateStr}/meals`);
      const unsub = onSnapshot(query(mealRef, orderBy('timestamp')), (snapshot) => {
        const mealList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMeals(mealList);
      });
  
      return () => unsub();
    }, [user, dateStr]);
  
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">🍽 Meals for {formatWithSuffix(selectedDate)}</h1>
  
          {/* Date Picker */}
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="bg-neutral-800 border border-neutral-600 text-white rounded px-3 py-2"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
  
        {meals.length === 0 ? (
          <p className="text-gray-400">No meals logged for this day.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-neutral-900 p-4 rounded-xl shadow border border-neutral-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">
                    {meal.mealName || 'Unnamed Meal'}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {meal.mealTime || '—'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Serving Size: {meal.servingSize || 'N/A'}
                </p>
                <ul className="text-sm space-y-1">
                  <li>Calories: {meal.calories || '—'} kcal</li>
                  <li>Protein: {meal.protein || '—'} g</li>
                  <li>Carbs: {meal.totalCarbs || '—'} g</li>
                  <li>Fat: {meal.totalFat || '—'} g</li>
                  <li>Sodium: {meal.sodium || '—'} mg</li>
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  