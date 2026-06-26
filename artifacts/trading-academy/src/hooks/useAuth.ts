import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type FirebaseUser,
} from "@/lib/firebase";

export type AppUser = {
  id: number;
  firebaseUid: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  profilePhoto?: string | null;
  mobileNumber?: string | null;
  [key: string]: unknown;
};

type RegistrationData = {
  needsRegistration: true;
  firebaseUid: string;
  email: string;
  fullName: string;
  profilePhoto: string | null;
  idToken: string;
};

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("ta_user") ?? "null"); } catch { return null; }
  });
  const [pendingRegistration, setPendingRegistration] = useState<RegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Watch Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setAppUser(null);
        localStorage.removeItem("ta_user");
        setIsLoading(false);
        return;
      }
      // If we already have an app user cached, just validate
      const cached = localStorage.getItem("ta_user");
      if (cached) {
        try {
          setAppUser(JSON.parse(cached));
          setIsLoading(false);
          return;
        } catch { /* fall through */ }
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  /** Call backend with firebase id token and get app user */
  async function syncWithBackend(fbUser: FirebaseUser): Promise<AppUser | RegistrationData | null> {
    const idToken = await fbUser.getIdToken();
    const res = await fetch("/api/auth/firebase-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    if (data.needsRegistration) {
      return { ...data, idToken } as RegistrationData;
    }

    return data.user as AppUser;
  }

  function redirectByRole(role: string) {
    if (role === "superadmin") setLocation("/superadmin/dashboard");
    else if (role === "admin") setLocation("/admin/dashboard");
    else if (role === "faculty") setLocation("/faculty/dashboard");
    else setLocation("/student/dashboard");
  }

  /** Google sign-in */
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const outcome = await syncWithBackend(result.user);

      if (!outcome) throw new Error("No response from server");

      if ("needsRegistration" in outcome) {
        setPendingRegistration(outcome);
        setIsLoading(false);
        return;
      }

      localStorage.setItem("ta_user", JSON.stringify(outcome));
      setAppUser(outcome);
      toast({ title: "Welcome!", description: `Logged in as ${outcome.fullName}` });
      redirectByRole(outcome.role);
    } catch (err: any) {
      toast({ title: "Sign-in failed", description: err.message || "Could not sign in with Google.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Email + password sign-in */
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const outcome = await syncWithBackend(result.user);

      if (!outcome) throw new Error("No response from server");

      if ("needsRegistration" in outcome) {
        setPendingRegistration(outcome);
        setIsLoading(false);
        return;
      }

      localStorage.setItem("ta_user", JSON.stringify(outcome));
      setAppUser(outcome);
      toast({ title: "Welcome back!", description: `Logged in as ${outcome.fullName}` });
      redirectByRole(outcome.role);
    } catch (err: any) {
      const msg = err.code === "auth/invalid-credential" ? "Invalid email or password." : err.message || "Sign-in failed.";
      toast({ title: "Sign-in failed", description: msg, variant: "destructive" });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Email + password sign-up (creates Firebase account + registers in our DB) */
  const registerWithEmail = useCallback(async (
    email: string,
    password: string,
    profileData: { fullName: string; role: string; mobileNumber?: string; [key: string]: unknown }
  ) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: profileData.fullName });
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, ...profileData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      toast({
        title: "Application submitted!",
        description: "Your account is pending approval by an admin.",
      });
      await signOut(auth);
      setLocation("/login");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Complete registration for Google users who are new */
  const completeRegistration = useCallback(async (
    profileData: { fullName: string; role: string; mobileNumber?: string; [key: string]: unknown }
  ) => {
    if (!pendingRegistration) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: pendingRegistration.idToken, ...profileData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setPendingRegistration(null);
      toast({ title: "Application submitted!", description: "Pending approval by an admin." });
      await signOut(auth);
      setLocation("/login");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pendingRegistration]);

  const logout = useCallback(async () => {
    try {
      const fbUser = auth.currentUser;
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });
      }
    } catch { /* non-fatal */ } finally {
      await signOut(auth);
      localStorage.removeItem("ta_user");
      setAppUser(null);
      setLocation("/login");
    }
  }, []);

  return {
    user: appUser,
    firebaseUser,
    pendingRegistration,
    isLoading,
    isAuthenticated: !!appUser && appUser.status === "active",
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    completeRegistration,
    logout,
  };
}
