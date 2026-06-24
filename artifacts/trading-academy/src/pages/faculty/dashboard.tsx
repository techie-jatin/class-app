import { useGetFacultyDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Video, MonitorPlay, FileText, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FacultyDashboard() {
  const { data: stats, isLoading } = useGetFacultyDashboardStats();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h2>
        <p className="text-muted-foreground">Overview of your courses, lectures, and live sessions.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Assigned Courses" value={stats?.assignedCourses} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} loading={isLoading} />
        <StatCard title="Uploaded Lectures" value={stats?.uploadedLectures} icon={<Video className="h-4 w-4 text-muted-foreground" />} loading={isLoading} />
        <StatCard title="Upcoming Live Classes" value={stats?.upcomingLiveClasses} icon={<MonitorPlay className="h-4 w-4 text-muted-foreground" />} loading={isLoading} />
        <StatCard title="Uploaded Notes" value={stats?.uploadedNotes} icon={<FileText className="h-4 w-4 text-muted-foreground" />} loading={isLoading} />
        <StatCard title="Unread Notifications" value={stats?.unreadNotifications} icon={<Bell className="h-4 w-4 text-muted-foreground" />} loading={isLoading} />
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
