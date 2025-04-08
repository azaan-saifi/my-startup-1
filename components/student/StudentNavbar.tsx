import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiHome, FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi';

interface StudentNavbarProps {
  onLogout: () => void;
}

const StudentNavbar = ({ onLogout }: StudentNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/student',
      icon: <FiHome className="h-5 w-5" />
    },
    {
      name: 'My Courses',
      href: '/student/courses',
      icon: <FiBook className="h-5 w-5" />
    },
    {
      name: 'Profile',
      href: '/student/profile',
      icon: <FiUser className="h-5 w-5" />
    }
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-black/85 shadow-lg shadow-yellow-500/10 border-b border-yellow-500/20' 
            : 'bg-black/50 border-b border-zinc-800/40'
        } backdrop-blur-md`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                href="/student" 
                className="group flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                  S
                </div>
                <span className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">Student Portal</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        active 
                          ? 'text-yellow-400' 
                          : 'text-zinc-300 hover:text-white'
                      }`}
                    >
                      <span className={`transition-all duration-200 ${active ? 'text-yellow-400' : ''}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </Link>
                  );
                })}

                {/* Logout button */}
                <button
                  onClick={onLogout}
                  className="ml-2 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-rose-400 transition-all duration-200 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMenu}
                className="rounded-md p-2 inline-flex items-center justify-center text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 focus:outline-none transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <FiX className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <FiMenu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-zinc-800/60 bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-lg"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-all duration-200 ${
                        active 
                          ? 'bg-yellow-500/10 text-yellow-400' 
                          : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
                      }`}
                    >
                      <span className={`transition-all duration-200 ${active ? 'text-yellow-400' : ''}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Logout button */}
                <button
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-rose-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Spacer to push content down below fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default StudentNavbar; 