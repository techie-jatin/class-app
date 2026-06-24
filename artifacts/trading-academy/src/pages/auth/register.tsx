import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "faculty"]),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  qualification: z.string().optional(),
  occupation: z.string().optional(),
  interestedCourse: z.string().optional(),
  experience: z.string().optional(),
  expertise: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [success, setSuccess] = useState(false);
  const registerMutation = useRegister();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      fullName: "", email: "", mobileNumber: "", password: "", role: "student",
      dateOfBirth: "", gender: "", address: "", qualification: "", occupation: "",
      interestedCourse: "", experience: "", expertise: ""
    },
  });

  const role = form.watch("role");

  async function onSubmit(data: RegisterFormValues) {
    try {
      await registerMutation.mutateAsync({ data });
      setSuccess(true);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive"
      });
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Application Received</CardTitle>
            <CardDescription>
              Your account is pending approval by the administration team.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You will receive an email notification once your account has been reviewed and activated.
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
          <CardDescription>
            Apply for access to institutional-grade trading education.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl><Input placeholder="+1 234 567 8900" {...field} /></FormControl>
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
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student / Trader</SelectItem>
                        <SelectItem value="faculty">Faculty / Instructor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 pb-2 border-t border-border mt-6">
                <h3 className="text-sm font-medium mb-4">Additional Details</h3>
                
                {role === "student" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                      <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem><FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="occupation" render={({ field }) => (
                      <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input placeholder="E.g. Engineer" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="interestedCourse" render={({ field }) => (
                      <FormItem><FormLabel>Interested Course</FormLabel><FormControl><Input placeholder="E.g. Options Trading" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="qualification" render={({ field }) => (
                      <FormItem><FormLabel>Highest Qualification</FormLabel><FormControl><Input placeholder="E.g. MBA Finance" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="experience" render={({ field }) => (
                      <FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input placeholder="E.g. 10 Years" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="expertise" render={({ field }) => (
                      <FormItem className="col-span-2"><FormLabel>Area of Expertise</FormLabel><FormControl><Input placeholder="E.g. Quantitative Analysis, Algo Trading" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                )}
                
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="mt-4"><FormLabel>Full Address</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full mt-6" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
