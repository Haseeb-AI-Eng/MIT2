import { User, Search, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface NavSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: 'News + Updates', path: '/' },
  { label: 'Research', path: '/research' },
  { label: 'About', path: '/about' },
  { label: 'Support the Media Lab', path: '/support-media-lab' },
  { label: 'EL Graduate Program', path: '/mas-graduate-program' },
  { label: 'People', path: '/people' },
  { label: 'Alumni + Friends', path: '/alumni-friends' },
  { label: 'Events', path: '/' },
  { label: 'For Press + Media', path: '/' },
];

export function NavSidebar({ isOpen, onClose }: NavSidebarProps) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible overlay to catch clicks outside the sidebar without dimming background */}
          <div 
            className="fixed inset-0 z-[1000] bg-transparent" 
            onClick={onClose} 
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-screen bg-white z-[1001] shadow-[-4px_0_20px_rgba(0,0,0,0.08)] flex flex-col overflow-y-auto"
            style={{ width: 'min(750px, 50vw)' }}
          >
            {/* Top Row Utility Icons */}
            <div className="flex justify-end items-center gap-6 pt-[60px] pr-[40px]">
              <User size={18} className="text-[#999] cursor-pointer hover:text-black transition-colors" />
              <Search size={18} className="text-[#999] cursor-pointer hover:text-black transition-colors" />
              <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full transition-colors flex items-center justify-center">
                <X size={18} className="text-[#999] cursor-pointer" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col mt-[60px] pl-[60px] md:pl-[70px] space-y-[20px] md:space-y-[24px] pb-12">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`text-[30px] md:text-[34px] font-bold leading-[1.3] tracking-tight transition-colors hover:text-[#e6007e] ${
                    location.pathname === link.path ? 'text-[#e6007e]' : 'text-[#b0b0b0]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}