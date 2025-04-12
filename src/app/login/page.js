"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ use next/navigation for App Router
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { useAuth } from '../../../context/authcontext';
import { auth, db, doc, setDoc } from '../../../firebase';
import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';


export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [waterGoal, setWaterGoal] = useState(8);

  const saveGoals = async () => {
    try {
      const ref = doc(db, `users/${user.uid}`);
      await setDoc(ref, {
        goals: {
          steps: stepsGoal,
          water: waterGoal,
        },
      }, { merge: true });
      alert('Goals saved!');
    } catch (err) {
      console.error('Error saving goals:', err);
      alert('Error saving goals');
    }
  };
  
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

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          <span className="text-slate-400">Welcome back, </span>
          <span>{user.email}</span>
        </h1>

        <div className="bg-gray-800 text-white rounded-xl p-6 shadow-lg flex flex-col gap-6 w-full max-w-sm">
          <h2 className="text-xl font-bold text-white">Your Daily Goals</h2>

          {/* Steps Goal */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium flex justify-between">
              <span>Steps Goal</span>
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

          {/* Water Goal */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium flex justify-between">
              <span>Water Goal (cups)</span>
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

          <button
            onClick={saveGoals}
            className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 transition"
          >
            Save Goals
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 text-red-400 underline hover:text-red-500 transition text-sm"
        >
          Log out
        </button>
      </main>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2 >{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          className='class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          className='class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
        <button type="submit"  className={`w-20 px-3 py-1 rounded-lg text-white ${
            isRegistering ? 'bg-green-500' : 'bg-blue-500'
          }`}>
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: 20 }}>
        {isRegistering ? 'Already have an account?' : 'New user?'}{' '}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="px-1 py-.5 border border-slate-500 rounded-lg text-slate-200 "
        >
          {isRegistering ? 'Log in' : 'Register'}
        </button>
      </p>
      <div className='pt-10 flex'>
        <Timeline>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>Create your account</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>Set your goals</TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
            </TimelineSeparator>
            <TimelineContent>Track your progress</TimelineContent>
          </TimelineItem>
        </Timeline>
      </div>
    </div>
  );
}