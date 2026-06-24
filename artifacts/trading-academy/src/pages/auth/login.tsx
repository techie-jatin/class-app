import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await login(data);
    } catch (error) {
      // Error handled by useAuth
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Trading Academy</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to access the terminal.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Apply for access
            </Link>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex flex-col justify-between bg-card border-l border-border p-12">
        <div>
          <div className="flex items-center gap-3 text-primary mb-12">
            <TrendingUp className="h-8 w-8" />
            <span className="text-xl font-bold">Apex Terminal</span>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground leading-tight mb-6">
            Institutional-grade <br/> trading education.
          </h2>
          <p className="text-lg text-muted-foreground max-w-[400px]">
            Access live market sessions, algorithmic trading modules, and proprietary risk management frameworks.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-background border-border shadow-sm">
            <CardHeader className="pb-2">
              <BarChart3 className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-sm font-semibold">Live Data Feeds</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Real-time market analysis and live trading execution rooms.
            </CardContent>
          </Card>
          <Card className="bg-background border-border shadow-sm">
            <CardHeader className="pb-2">
              <ShieldCheck className="h-5 w-5 text-primary mb-2" />
              <CardTitle className="text-sm font-semibold">Verified Certification</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Blockchain-backed certificates for completed strategies.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
