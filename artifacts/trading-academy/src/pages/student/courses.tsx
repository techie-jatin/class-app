import { useListCourses, useGetCourseProgress } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PAGE_LIMIT = 9;

function CourseProgressBar({ courseId }: { courseId: number }) {
  const { data: progress } = useGetCourseProgress(courseId);
  if (!progress || progress.total === 0) return null;
  const pct = Math.round((progress.completed / progress.total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{pct === 100 ? (
          <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
          </span>
        ) : `${progress.completed}/${progress.total} lectures`}</span>
        <span className={pct === 100 ? "text-green-600 dark:text-green-400 font-semibold" : ""}>{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

export default function StudentCourses() {
  const [page, setPage] = useState(1);
  const { data: coursesData, isLoading } = useListCourses({ status: 'active', page, limit: PAGE_LIMIT });

  const totalPages = Math.max(1, Math.ceil((coursesData?.total ?? 0) / PAGE_LIMIT));
  const from = (coursesData?.total ?? 0) === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const to = Math.min(page * PAGE_LIMIT, coursesData?.total ?? 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">My Courses</h2>
        <p className="text-muted-foreground">Access your enrolled programs and learning materials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-40 w-full rounded-t-xl" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="mt-auto pt-4 space-y-3">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))
        ) : coursesData?.courses.length ? (
          coursesData.courses.map((course) => (
            <Card key={course.id} className="flex flex-col hover:border-primary/50 transition-colors">
              {course.thumbnail ? (
                <div className="h-40 w-full bg-muted rounded-t-xl overflow-hidden">
                  <img src={course.thumbnail} alt={course.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-40 w-full bg-secondary rounded-t-xl flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{course.name}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 flex flex-col gap-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{course.lectureCount || 0} Lectures</span>
                  <span>{course.facultyName}</span>
                </div>
                <CourseProgressBar courseId={course.id} />
                <Button asChild className="w-full">
                  <Link href={`/student/courses/${course.id}`}>Enter Course</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Courses Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              You haven't been enrolled in any active courses yet. Contact the administration for access.
            </p>
          </div>
        )}
      </div>

      {(coursesData?.total ?? 0) > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {coursesData?.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm font-medium px-2">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
