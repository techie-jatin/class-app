import { useGetStudentDashboardStats, useListCourses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, MonitorPlay, Video, FileText, Award, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetStudentDashboardStats();
  const { data: coursesData, isLoading: isCoursesLoading } = useListCourses({ status: 'active' });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Student Dashboard</h2>
        <p className="text-muted-foreground">Welcome back to your learning portal.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Enrolled" value={stats?.enrolledCourses} icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Live Classes" value={stats?.upcomingLiveClasses} icon={<MonitorPlay className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Lectures" value={stats?.totalLectures} icon={<Video className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Notes" value={stats?.totalNotes} icon={<FileText className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Certificates" value={stats?.totalCertificates} icon={<Award className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
        <StatCard title="Notifications" value={stats?.unreadNotifications} icon={<Bell className="h-4 w-4 text-muted-foreground" />} loading={isStatsLoading} />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCoursesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <Skeleton className="h-32 w-full rounded-t-xl" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))
          ) : coursesData?.length ? (
            coursesData.map((course) => (
              <Card key={course.id} className="flex flex-col hover:border-primary/50 transition-colors">
                {course.thumbnail ? (
                  <div className="h-32 w-full bg-muted rounded-t-xl overflow-hidden">
                    <img src={course.thumbnail} alt={course.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-secondary rounded-t-xl flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4 flex gap-2">
                  <Button asChild className="w-full">
                    <Link href={`/student/courses/${course.id}`}>Enter Course</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-muted/20 rounded-xl border border-dashed border-border">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No Courses Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                You haven't been enrolled in any active courses yet. Contact the administration for access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value?: number, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading ? (
          <Skeleton className="h-6 w-12" />
        ) : (
          <div className="text-xl font-bold">{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
