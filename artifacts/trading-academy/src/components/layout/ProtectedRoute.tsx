import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      if (user.role === "superadmin") setLocation("/superadmin/dashboard");
      else if (user.role === "admin") setLocation("/admin/dashboard");
      else if (user.role === "faculty") setLocation("/faculty/dashboard");
      else if (user.role === "student") setLocation("/student/dashboard");
      else setLocation("/");
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm font-medium tracking-widest">LOADING SESSION</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
