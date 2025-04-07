import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  FiHome, 
  FiBook, 
  FiDollarSign, 
  FiUsers, 
  FiBarChart2, 
  FiSettings,
  FiLogOut 
} from "react-icons/fi";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

interface SidebarProps {
  onLogout?: () => void;
}

const SidebarLink = ({ href, icon, label, isActive }: SidebarLinkProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
          isActive 
            ? "bg-[#ffc20b31] text-[#f0bb1c]" 
            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
        )}
      >
        <div className="text-xl">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

const Sidebar = ({ onLogout }: SidebarProps) => {
  const pathname = usePathname();
  
  const links = [
    {
      href: "/admin",
      icon: <FiHome />,
      label: "Dashboard",
    },
    {
      href: "/admin/courses",
      icon: <FiBook />,
      label: "Courses",
    },
    {
      href: "/admin/pricing",
      icon: <FiDollarSign />,
      label: "Pricing",
    },
    {
      href: "/admin/students",
      icon: <FiUsers />,
      label: "Students",
    },

    {
      href: "/admin/settings",
      icon: <FiSettings />,
      label: "Settings",
    }
  ];
  
  return (
    <div className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-black">
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              isActive={pathname === link.href}
            />
          ))}
        </nav>
      </div>
      
      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:bg-zinc-800/50 hover:text-white cursor-pointer"
        >
          <div className="text-xl">
            <FiLogOut />
          </div>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 