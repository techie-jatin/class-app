import { useGetDashboardStats, useGetRecentActivity, useGetSecurityEvents, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Layers, ShieldAlert, ShieldCheck, UserCheck, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats();
  const { data: recentActivity, isLoading: isActivityLoading } = useGetRecentActivity({ limit: 10 });
  const { data: securityEvents, isLoading: isSecurityLoading } = useGetSecurityEvents();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents} icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Total Faculty" value={stats?.totalFaculty} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Total Admins" value={stats?.totalAdmins} icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Active Courses" value={stats?.activeCourses} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                    <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.userName} <span className="text-muted-foreground font-normal">({activity.userRole})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {!recentActivity?.length && (
                  <div className="text-center py-8 text-muted-foreground">No recent activity.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
             {isSecurityLoading ? (
               <div className="space-y-4">
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-8 w-full" />
               </div>
             ) : (
               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium">Failed Login Attempts</span>
                     <span className="font-bold text-destructive">{securityEvents?.failedLoginAttempts || 0}</span>
                   </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-destructive" style={{ width: `${Math.min((securityEvents?.failedLoginAttempts || 0) * 10, 100)}%` }} />
                   </div>
                 </div>
                 
                 <div className="pt-4 border-t border-border">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium">Blocked Users</span>
                     <span className="font-bold">{securityEvents?.blockedUsers?.length || 0}</span>
                   </div>
                 </div>
                 
                 <div className="pt-4 border-t border-border">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium">Device Changes</span>
                     <span className="font-bold">{securityEvents?.deviceChanges || 0}</span>
                   </div>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value?: number, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
