import { useGetMyNotifications, useMarkNotificationRead, getGetMyNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StudentNotifications() {
  const { data, isLoading } = useGetMyNotifications({});
  const markReadMutation = useMarkNotificationRead();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMarkRead = async (id: number) => {
    try {
      await markReadMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetMyNotificationsQueryKey() });
    } catch (error: any) {
      toast({ title: "Failed to mark as read", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">Alerts and updates from the academy.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.length ? (
          data.map((notif) => (
            <Card key={notif.id} className={`transition-colors ${notif.isRead ? 'opacity-70 bg-muted/30' : 'border-primary/50 bg-card'}`}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-full shrink-0 ${notif.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold ${notif.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>{notif.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                  
                  {!notif.isRead && (
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 gap-1"
                        onClick={() => handleMarkRead(notif.id)}
                        disabled={markReadMutation.isPending}
                      >
                        <Check className="h-4 w-4" /> Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Notifications</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              You're all caught up! You don't have any notifications at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
