import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Initialize Supabase client
const supabase = createClient();

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
