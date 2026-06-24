import { useGetMe, useUpdateMyProfile } from "@workspace/api-client-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { User, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  mobileNumber: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  interestedCourse: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function StudentProfile() {
  const { data: user, isLoading } = useGetMe();
  const updateProfileMutation = useUpdateMyProfile();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.fullName || "",
      mobileNumber: user?.mobileNumber || "",
      address: user?.address || "",
      occupation: user?.occupation || "",
      interestedCourse: user?.interestedCourse || "",
    }
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfileMutation.mutateAsync({ data });
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({ 
        title: "Update failed", 
        description: error.message || "Could not update profile",
        variant: "destructive" 
      });
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-border">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.fullName}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="pt-4 border-t border-border w-full flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize text-primary">{user?.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="mt-6"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
