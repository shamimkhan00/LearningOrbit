// sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Settings, LogOut, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Setup', href: '/setup', icon: Settings },
];

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();
  const [slideon, setSlideon] = useState(true);
  if (!isSidebarOpen) return null;
  return (
    
    <aside className="fixed top-0 right-0 z-50 w-64 h-screen bg-[#0F172A] border-l border-[#1E293B] flex flex-col shadow-2xl">
      {/* Header & Close Button */}
      <div className="p-6 flex items-center justify-between border-b border-[#1E293B]">
        {/* <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1] flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h1 className="text-[#F8FAFC] font-semibold text-lg">LearningOrbit</h1>
            <p className="text-[#A78BFA] text-xs">Dashboard</p>
          </div>
        </div> */}

        {/* Close Button */}
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              // onClick={onClose}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#6366F1]'
                  : 'text-[#E2E8F0] hover:bg-[#1E293B]/60 hover:text-[#F8FAFC]'
              }`}
            >
              <Icon
                size={20}
                className={
                  isActive ? 'text-[#A78BFA]' : 'text-[#E2E8F0] group-hover:text-[#A78BFA]'
                }
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#1E293B]">
        <button
          // onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#E2E8F0] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}