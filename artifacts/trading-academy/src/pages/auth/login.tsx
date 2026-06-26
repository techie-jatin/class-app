import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, ShieldCheck, Chrome } from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const { loginWithGoogle, loginWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch {
      // Error handled inside hook
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left — login form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Academy</h1>
            <p className="text-muted-foreground mt-2">Sign in to access the terminal.</p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full gap-2 h-11"
            onClick={loginWithGoogle}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email + password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || isLoading}>
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Apply for access
            </Link>
          </p>
        </div>
      </div>

      {/* Right — branding */}
      <div className="hidden md:flex flex-col justify-between bg-card border-l border-border p-12">
        <div>
          <div className="flex items-center gap-3 text-primary mb-12">
            <TrendingUp className="h-8 w-8" />
            <span className="text-xl font-bold">Apex Terminal</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground leading-tight mb-6">
            Institutional-grade <br /> trading education.
          </h2>
          <p className="text-lg text-muted-foreground max-w-[400px]">
            Access live market sessions, algorithmic trading modules, and proprietary risk management frameworks.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-background border-border shadow-sm">
            <CardContent className="pt-4">
              <BarChart3 className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold">Live Data Feeds</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time market analysis and live trading execution rooms.</p>
            </CardContent>
          </Card>
          <Card className="bg-background border-border shadow-sm">
            <CardContent className="pt-4">
              <ShieldCheck className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold">Verified Certification</p>
              <p className="text-xs text-muted-foreground mt-1">Blockchain-backed certificates for completed strategies.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
