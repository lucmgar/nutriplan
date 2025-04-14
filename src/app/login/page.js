'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { useAuth } from '../../../context/authcontext';
import { auth, db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

// Define goal categories and fields
const categories = {
  '🥩 Macronutrients': [
    'totalFat', 'saturatedFat', 'cholesterol', 'sodium',
    'totalCarbs', 'dietaryFiber', 'sugars', 'protein',
  ],
  '🍊 Micronutrients': ['vitaminA', 'vitaminC', 'calcium', 'iron'],
};

// Flatten the goal fields into a single array
const allFields = Object.values(categories).flat();

export default function LoginPage() {
  // Auth & Navigation
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Core goal state
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [waterGoal, setWaterGoal] = useState(8);
  const [caloriesGoal, setCaloriesGoal] = useState(2000);

  // Optional goals state
  const [goalToggles, setGoalToggles] = useState({});
  const [goalValues, setGoalValues] = useState({});

  // Load user goals from Firestore on login
  useEffect(() => {
    if (!user) return;
    const loadGoals = async () => {
      const ref = doc(db, `users/${user.uid}`);
      const snap = await getDoc(ref);
      const data = snap.data()?.goals || {};

      // Load core goals
      setStepsGoal(data.steps ?? 10000);
      setWaterGoal(data.water ?? 8);
      setCaloriesGoal(data.calories ?? 2000);

      // Load optional goals
      const toggles = {};
      const values = {};
      for (const field of allFields) {
        if (data[field] !== undefined) {
          toggles[field] = true;
          values[field] = data[field];
        } else {
          toggles[field] = false;
          values[field] = '';
        }
      }

      setGoalToggles(toggles);
      setGoalValues(values);
    };

    loadGoals();
  }, [user]);

  // Save all goals to Firestore
  const saveGoals = async () => {
    try {
      const ref = doc(db, `users/${user.uid}`);
      const optionalGoals = Object.fromEntries(
        Object.entries(goalValues).filter(
          ([key, val]) => goalToggles[key] && val !== ''
        )
      );

      await setDoc(
        ref,
        {
          goals: {
            steps: stepsGoal,
            water: waterGoal,
            calories: caloriesGoal,
            ...optionalGoals,
          },
        },
        { merge: true }
      );

      alert('Goals saved!');
    } catch (err) {
      console.error('Error saving goals:', err);
      alert('Error saving goals');
    }
  };

  // Handle login or registration form submission
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/login');
    } catch (err) {
      alert(err.message);
    }
  };

  // Log out current user
  const handleLogout = async () => {
    await signOut(auth);
  };

  // If logged in, show goal setting UI
  if (user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          <span className="text-slate-400">Welcome back, </span>
          <span>{user.email}</span>
        </h1>

        {/* Goal setting form */}
        <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg flex flex-col gap-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold">Set Your Daily Goals</h2>

          {/* Core goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Steps */}
            <div className="flex flex-col gap-2">
              <label className="flex justify-between text-sm font-medium text-white">
                Steps Goal
                <span className="text-green-400 font-semibold">{stepsGoal.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={stepsGoal}
                onChange={(e) => setStepsGoal(Number(e.target.value))}
                className="accent-green-400"
              />
            </div>

            {/* Water */}
            <div className="flex flex-col gap-2">
              <label className="flex justify-between text-sm font-medium text-white">
                Water Goal (cups)
                <span className="text-blue-400 font-semibold">{waterGoal}</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                className="accent-blue-400"
              />
            </div>

            {/* Calories */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="flex justify-between text-sm font-medium text-white">
                Calories Goal (kcal)
                <span className="text-yellow-300 font-semibold">{caloriesGoal}</span>
              </label>
              <input
                type="number"
                value={caloriesGoal}
                onChange={(e) => setCaloriesGoal(Number(e.target.value))}
                className="bg-neutral-900 text-white border border-neutral-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Optional nutrient goals */}
          {Object.entries(categories).map(([label, fields]) => (
            <details key={label} className="border border-neutral-700 rounded-lg">
              <summary className="cursor-pointer px-4 py-2 font-semibold bg-neutral-900 hover:bg-neutral-800 transition">
                {label}
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-2">
                {fields.map((field) => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="flex justify-between text-sm">
                      <span className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={goalToggles[field] || false}
                        onChange={() =>
                          setGoalToggles((prev) => ({
                            ...prev,
                            [field]: !prev[field],
                          }))
                        }
                      />
                    </label>
                    {goalToggles[field] && (
                      <input
                        type="number"
                        placeholder="Enter goal"
                        value={goalValues[field] || ''}
                        onChange={(e) =>
                          setGoalValues((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                        className="bg-neutral-800 text-white border border-neutral-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </details>
          ))}

          {/* Save button */}
          <button
            onClick={saveGoals}
            className="mt-4 bg-green-500 text-white rounded p-2 hover:bg-green-600 transition"
          >
            Save All Goals
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="mt-4 text-red-400 underline hover:text-red-500 transition text-sm"
          >
            Log out
          </button>
        </div>
      </main>
    );
  }

  // If not logged in, show login/register form
  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: 10 }}
        />
        <button
          type="submit"
          className={`w-20 px-3 py-1 rounded-lg text-white ${
            isRegistering ? 'bg-green-500' : 'bg-blue-500'
          }`}
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>

      {/* Toggle login/register */}
      <p style={{ marginTop: 20 }}>
        {isRegistering ? 'Already have an account?' : 'New user?'}{' '}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="px-1 py-.5 border border-slate-500 rounded-lg text-slate-200"
        >
          {isRegistering ? 'Log in' : 'Register'}
        </button>
      </p>

      {/* Steps timeline */}
      <div className="pt-10 flex">
        <Timeline>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>1. Create your account</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>2. Set your goals</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent>3. Track your progress</TimelineContent>
          </TimelineItem>
        </Timeline>
      </div>
    </div>
  );
}
