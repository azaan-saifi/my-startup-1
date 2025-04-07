import React from "react";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-radial from-black via-yellow-500/5 to-transparent opacity-60"></div>

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
      {children}
    </div>
  );
};

export default RootLayout;
