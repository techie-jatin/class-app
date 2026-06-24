import { useListNotifications, useSendNotification, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useListNotifications({});
  const sendMutation = useSendNotification();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast({ title: "Validation Error", description: "Title and message are required.", variant: "destructive" });
      return;
    }
    
    try {
      await sendMutation.mutateAsync({
        data: { title, message, target, imageUrl: null }
      });
      setTitle("");
      setMessage("");
      toast({ title: "Notification sent successfully!" });
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    } catch (error: any) {
      toast({ title: "Error sending notification", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">Broadcast messages to users across the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Compose Alert</CardTitle>
            <CardDescription>Send a new notification.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="faculty">Faculty Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alert Title</label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="E.g. Class Schedule Update" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Content</label>
                <Textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Enter the notification details here..."
                  className="min-h-[120px]"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={sendMutation.isPending}>
                <Send className="h-4 w-4" /> 
                {sendMutation.isPending ? "Sending..." : "Dispatch Alert"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
            <CardDescription>History of sent notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))
              ) : data?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No notifications have been sent.
                </div>
              ) : (
                data?.map((notif) => (
                  <div key={notif.id} className="p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold">{notif.title}</h4>
                      <span className="text-[10px] font-medium uppercase tracking-widest bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        Target: {notif.target}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                    <div className="text-xs text-muted-foreground">
                      Sent on {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
