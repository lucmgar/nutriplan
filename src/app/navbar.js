import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-zinc-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-white no-underline hover:text-blue-400">Home</Link>
      <div className="flex gap-4">
        <Link href="/nutriplanning" className="text-white no-underline hover:text-blue-400">Nutritional Planning</Link>
        <Link href="/grocery" className="text-white no-underline hover:text-blue-400">Grocery Trip</Link>
        <Link href="/recipedatabase" className="text-white no-underline hover:text-blue-400">Recipe Database</Link>
        <Link href="/goalsetting" className="text-white no-underline hover:text-blue-400">Goal Setting</Link>
        <Link href="/about" className="text-white no-underline hover:text-blue-400">About</Link>
        <Link href="/contact" className="text-white no-underline hover:text-blue-400">Contact</Link>
      </div>
    </nav>
  );
};

export default Navbar;

