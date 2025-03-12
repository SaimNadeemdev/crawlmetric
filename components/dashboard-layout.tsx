import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  BarChart, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  Home,
  User,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Initialize Supabase client
const supabase = createClient();

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard/main",
      icon: Home,
      current: pathname === "/dashboard/main",
    },
    {
      name: "Keyword Tracker",
      href: "/dashboard/keyword-tracker",
      icon: BarChart,
      current: pathname === "/dashboard/keyword-tracker",
    },
    {
      name: "Content Generator",
      href: "/dashboard/content-generator",
      icon: FileText,
      current: pathname === "/dashboard/content-generator",
    },
    {
      name: "Search Analysis",
      href: "/dashboard/search-analysis",
      icon: Search,
      current: pathname === "/dashboard/search-analysis",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
    },
  ];

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-gray-900 to-black border-r border-gray-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-800">
            <Link href="/dashboard/main" className="flex items-center">
              <span className="text-xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                CrawlMetric
              </span>
            </Link>
          </div>
          <div className="flex-grow flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    item.current
                      ? "bg-gray-800/50 text-white"
                      : "text-gray-300 hover:bg-gray-800/30 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      item.current
                        ? "text-purple-400"
                        : "text-gray-400 group-hover:text-gray-300"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div>
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.email?.split("@")[0] || "User"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-white p-0 h-auto"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-800">
              <Link href="/dashboard/main" className="flex items-center">
                <span className="text-xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                  CrawlMetric
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-grow flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      item.current
                        ? "bg-gray-800/50 text-white"
                        : "text-gray-300 hover:bg-gray-800/30 hover:text-white"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                        item.current
                          ? "text-purple-400"
                          : "text-gray-400 group-hover:text-gray-300"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
              <div className="flex items-center">
                <div>
                  <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-white p-0 h-auto"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
