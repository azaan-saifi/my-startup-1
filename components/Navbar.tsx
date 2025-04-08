import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { IoIosArrowDown } from "react-icons/io";

const Navbar = () => {
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  
  return (
    <nav className="w-full border-b border-gray-700 backdrop-blur-md animate-in [--animation-delay:600ms]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <div className="text-white">LOGO</div>
        <div className="flex gap-4">
          <Button className="text-white">Who we are?</Button>
          <div className="relative">
            <Button 
              className="text-white flex items-center gap-1" 
              onClick={() => setShowLoginOptions(!showLoginOptions)}
            >
              Login <IoIosArrowDown className={`transition-transform duration-200 ${showLoginOptions ? 'rotate-180' : ''}`} />
            </Button>
            
            {showLoginOptions && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-zinc-900 border border-zinc-800 shadow-lg z-50 overflow-hidden">
                <Link href="/admin">
                  <div className="block px-4 py-3 text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                    Login as Admin
                  </div>
                </Link>
                <Link href="/student">
                  <div className="block px-4 py-3 text-white hover:bg-zinc-800 transition-colors cursor-pointer">
                    Login as Student
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
