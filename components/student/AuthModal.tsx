import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiX, FiAlertCircle } from 'react-icons/fi';
import { useStudentAuth } from '@/contexts/StudentAuthContext';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 } 
  }
};

const modal = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 } 
  }
};

interface AuthModalProps {
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { authenticate } = useStudentAuth();
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      const isValid = authenticate(authKey);
      
      if (isValid) {
        if (onSuccess) onSuccess();
      } else {
        setError('Invalid student access key. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          className="relative w-full max-w-md mx-auto"
          variants={modal}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/80 p-6 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0bb1c]/50 to-transparent"></div>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffc20b10]">
                <FiLock className="h-6 w-6 text-[#f0bb1c]" />
              </div>
              <h2 className="mt-4 text-xl font-medium text-white">Student Access Required</h2>
              <p className="mt-1 text-center text-sm text-zinc-400">
                Please enter your access key to enter the student portal
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-rose-500/10 p-3">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="h-4 w-4 text-rose-500" />
                  <p className="text-sm text-rose-500">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="authKey" className="block text-sm font-medium text-zinc-400">
                  Student Access Key
                </label>
                <input
                  id="authKey"
                  type="password"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-white shadow-sm placeholder:text-zinc-500 focus:border-[#f0bb1c] focus:outline-none focus:ring-1 focus:ring-[#f0bb1c]"
                  placeholder="Enter your access key"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-[#ffc20b31] py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50] focus:outline-none focus:ring-2 focus:ring-[#f0bb1c]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Access Portal'}
              </button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <p className="text-xs text-center text-zinc-500">
                If you forgot your access key, please contact support
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal; 