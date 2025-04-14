import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/authcontext';
import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  CalendarCheck,
  Activity,
  Mail,
  UserCircle,
} from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: <Home size={18} /> },
    { href: '/grocery', label: 'Grocery Trip', icon: <ShoppingCart size={18} /> },
    { href: '/recipedatabase', label: 'Recipe Database', icon: <UtensilsCrossed size={18} /> },
    { href: '/todaymeals', label: "Today's Meals", icon: <CalendarCheck size={18} /> },
    { href: '/goalsetting', label: 'Progress', icon: <Activity size={18} /> },
    { href: '/contact', label: 'Contact', icon: <Mail size={18} /> },
  ];

  return (
    <nav className="bg-zinc-800 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
      <Link href="/" className="text-white no-underline hover:text-blue-400 flex items-center gap-2">
        <Home size={20} />
        Home
      </Link>

      <div className="flex gap-4 items-center">
        {navItems.slice(1).map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="text-white no-underline hover:text-blue-400 flex items-center gap-2"
          >
            {icon}
            {label}
          </Link>
        ))}

        <Link href="/login" className="flex items-center gap-2 no-underline hover:text-blue-400">
          <span className="px-3 py-1 border border-blue-400 rounded-lg text-white flex items-center gap-2">
            <UserCircle size={18} />
            {user ? user.email : 'Not logged in'}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
