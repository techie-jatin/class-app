import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useGetMe, useLogin, useLogout, LoginInput } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return typeof localStorage !== "undefined" ? localStorage.getItem("ta_token") : null;
  });
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: isUserLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: ["getMe"],
    } as any
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // Clear auth state on error (e.g. invalid token)
  useEffect(() => {
    if (isError && token) {
      localStorage.removeItem("ta_token");
      localStorage.removeItem("ta_user");
      setToken(null);
    }
  }, [isError, token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("ta_user", JSON.stringify(user));
    }
  }, [user]);

  const login = useCallback(async (credentials: LoginInput) => {
    try {
      const res = await loginMutation.mutateAsync({ data: credentials });
      localStorage.setItem("ta_token", res.token);
      localStorage.setItem("ta_user", JSON.stringify(res.user));
      setToken(res.token);
      
      // Redirect based on role
      const role = res.user.role;
      if (role === "superadmin") setLocation("/superadmin/dashboard");
      else if (role === "admin") setLocation("/admin/dashboard");
      else if (role === "faculty") setLocation("/faculty/dashboard");
      else if (role === "student") setLocation("/student/dashboard");
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${res.user.fullName}!`,
      });
      
      return res;
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials.",
        variant: "destructive"
      });
      throw err;
    }
  }, [loginMutation, setLocation, toast]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutMutation.mutateAsync();
      }
    } catch (e) {
      console.error("Logout API failed", e);
    } finally {
      localStorage.removeItem("ta_token");
      localStorage.removeItem("ta_user");
      setToken(null);
      setLocation("/login");
    }
  }, [logoutMutation, token, setLocation]);

  return {
    user,
    token,
    login,
    logout,
    isLoading: isUserLoading || loginMutation.isPending,
    isAuthenticated: !!token && !!user,
  };
}
