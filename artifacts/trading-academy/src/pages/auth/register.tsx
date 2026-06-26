import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type Role = "student" | "faculty";

export default function Register() {
  const { loginWithGoogle, registerWithEmail, completeRegistration, pendingRegistration, isLoading } = useAuth();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState(pendingRegistration?.email ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(pendingRegistration?.fullName ?? "");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [extras, setExtras] = useState<Record<string, string>>({});

  function setExtra(key: string, value: string) {
    setExtras(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const profileData = { fullName, mobileNumber, role, ...extras };
      if (pendingRegistration) {
        await completeRegistration(profileData);
      } else {
        await registerWithEmail(email, password, profileData);
      }
      setSuccess(true);
    } catch {
      // handled inside hooks
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Application Received</CardTitle>
            <CardDescription>Your account is pending approval by the administration team.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You will be notified once your account has been reviewed and activated.
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/login">Return to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <Card className="max-w-xl w-full border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Join Apex Academy</CardTitle>
          <CardDescription>Apply for access to institutional-grade trading education.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Only show Google sign-up if not already coming from Google */}
            {!pendingRegistration && (
              <>
                <Button type="button" variant="outline" className="w-full gap-2 h-11" onClick={loginWithGoogle} disabled={isLoading}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </Button>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or fill in details below</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
              </>
            )}

            {pendingRegistration && (
              <p className="text-sm text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                Completing registration for <strong>{pendingRegistration.email}</strong>
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input placeholder="+1 234 567 8900" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Application Role</Label>
              <Select value={role} onValueChange={v => setRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student / Trader</SelectItem>
                  <SelectItem value="faculty">Faculty / Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium mb-4">Additional Details</p>
              {role === "student" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" onChange={e => setExtra("dateOfBirth", e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select onValueChange={v => setExtra("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Occupation</Label><Input placeholder="E.g. Engineer" onChange={e => setExtra("occupation", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Interested Course</Label><Input placeholder="E.g. Options Trading" onChange={e => setExtra("interestedCourse", e.target.value)} /></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Highest Qualification</Label><Input placeholder="E.g. MBA Finance" onChange={e => setExtra("qualification", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Years of Experience</Label><Input placeholder="E.g. 10 Years" onChange={e => setExtra("experience", e.target.value)} /></div>
                  <div className="col-span-2 space-y-2"><Label>Area of Expertise</Label><Input placeholder="E.g. Quantitative Analysis" onChange={e => setExtra("expertise", e.target.value)} /></div>
                </div>
              )}
              <div className="mt-4 space-y-2"><Label>Full Address</Label><Input placeholder="City, Country" onChange={e => setExtra("address", e.target.value)} /></div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={submitting || isLoading}>
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
