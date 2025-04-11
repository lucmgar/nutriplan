"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ use next/navigation for App Router
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { useAuth } from '../../../context/authcontext';
import { auth } from '../../../firebase';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useAuth();
  const router = useRouter();

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
      <div>
          <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-bold">
            <span className="text-slate-400">Welcome back, </span><span className="tex-white">{user.email}</span>
          </h1>
            <ul className="list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                <li className="mb-2">
                <button onClick={handleLogout}>Log out</button>
                </li>
            </ul>
          </main>
        </div>
      </div>
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
    </div>
  );
}