import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";

export default function SystemSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    platformName: "",
    supportEmail: "",
    contactNumber: "",
    maintenanceMode: false
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        platformName: settings.platformName || "",
        supportEmail: settings.supportEmail || "",
        contactNumber: settings.contactNumber || "",
        maintenanceMode: settings.maintenanceMode || false
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        data: formData
      });
      toast({ title: "Settings saved successfully" });
      queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
    } catch (error: any) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Configuration</h2>
        <p className="text-muted-foreground">Global platform settings and operating modes.</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Platform Details</CardTitle>
          <CardDescription>Core identity and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform Name</label>
            <Input 
              value={formData.platformName} 
              onChange={e => setFormData({...formData, platformName: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Support Email</label>
            <Input 
              type="email"
              value={formData.supportEmail} 
              onChange={e => setFormData({...formData, supportEmail: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Number</label>
            <Input 
              value={formData.contactNumber} 
              onChange={e => setFormData({...formData, contactNumber: e.target.value})} 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">System Mode</CardTitle>
          <CardDescription>Emergency and maintenance controls.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
            <div className="space-y-0.5">
              <h4 className="font-medium text-sm">Maintenance Mode</h4>
              <p className="text-xs text-muted-foreground max-w-[300px]">
                When active, all non-superadmin users will be redirected to the maintenance page.
              </p>
            </div>
            <Switch 
              checked={formData.maintenanceMode} 
              onCheckedChange={checked => setFormData({...formData, maintenanceMode: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettingsMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {updateSettingsMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
