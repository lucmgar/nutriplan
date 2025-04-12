import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/authcontext';

const Navbar = () => {
  const { user } = useAuth();
  return (
    <nav className="bg-zinc-800 text-white p-4 flex justify-between items-center max-w-30 sticky top-0 z-50">
      <Link href="/" className="text-white no-underline hover:text-blue-400">Home</Link>
      <div className="flex gap-4">
        <Link href="/nutriplanning" className="text-white no-underline hover:text-blue-400">Nutritional Planning</Link>
        <Link href="/grocery" className="text-white no-underline hover:text-blue-400">Grocery Trip</Link>
        <Link href="/recipedatabase" className="text-white no-underline hover:text-blue-400">Recipe Database</Link>
        <Link href="/goalsetting" className="text-white no-underline hover:text-blue-400">Progress</Link>
        <Link href="/about" className="text-white no-underline hover:text-blue-400">About</Link>
        <Link href="/contact" className="text-white no-underline hover:text-blue-400">Contact</Link>
        <Link href="/contact" className="text-white no-underline hover:text-blue-400"></Link>
        <Link href="/login" className="text-white no-underline hover:text-blue-400"></Link>
        <Link  href="/login" className="text-white no-underline hover:text-blue-400">
          <span className="px-3 py-1 border border-blue-400 rounded-lg text-white">
            {user ? user.email : "Not logged in"}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

