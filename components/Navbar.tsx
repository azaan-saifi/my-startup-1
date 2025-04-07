import React from "react";

import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-gray-700 backdrop-blur-md animate-in [--animation-delay:600ms]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <div className="text-white">LOGO</div>
        <div className="flex gap-4">
          <Button className="text-white">Who we are?</Button>
          <Button className="text-white">Login</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
