import { useGetSecurityEvents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, AlertTriangle, MonitorSmartphone, UserX } from "lucide-react";

export default function SecurityCenter() {
  const { data: events, isLoading } = useGetSecurityEvents();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-destructive" /> Security Center
        </h2>
        <p className="text-muted-foreground">Platform security alerts and risk metrics.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Failed Logins (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{events?.failedLoginAttempts || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <MonitorSmartphone className="h-4 w-4" /> Suspicious Device Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events?.deviceChanges || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <UserX className="h-4 w-4" /> Blocked Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events?.blockedUsers?.length || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Unrecognized Logins</CardTitle>
            <CardDescription>Logins from new or untrusted devices</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <Skeleton className="h-40" />
            ) : events?.recentLogins?.length ? (
              <div className="space-y-4">
                {events.recentLogins.map(log => (
                  <div key={log.id} className="flex justify-between items-center p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium text-sm">{log.userName}</p>
                      <p className="text-xs text-muted-foreground">{log.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                No recent suspicious logins.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currently Blocked Users</CardTitle>
            <CardDescription>Users manually blocked or auto-blocked due to risk</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <Skeleton className="h-40" />
            ) : events?.blockedUsers?.length ? (
              <div className="space-y-4">
                {events.blockedUsers.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium text-sm">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase text-destructive">{user.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                No blocked users.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
