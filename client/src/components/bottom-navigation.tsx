import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onNavigate: (path: string) => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home" },
    { path: "/transactions", icon: "fas fa-list", label: "Transactions" },
    { path: "/analytics", icon: "fas fa-chart-pie", label: "Analytics" },
    { path: "/profile", icon: "fas fa-user", label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-200 px-6 py-3 z-40">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={cn(
              "flex flex-col items-center space-y-1 transition-colors",
              location === item.path ? "text-primary" : "text-gray"
            )}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
