import { useGetDashboardStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Layers, UserCheck, Activity, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats();
  const { data: recentActivity, isLoading: isActivityLoading } = useGetRecentActivity({ limit: 10 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents} icon={<Users className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Total Faculty" value={stats?.totalFaculty} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Pending Approvals" value={stats?.pendingApprovals} icon={<Bell className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Total Courses" value={stats?.totalCourses} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Total Batches" value={stats?.totalBatches} icon={<Layers className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Notifications Sent" value={stats?.totalNotifications} icon={<Bell className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
      </div>

      <Card>
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
