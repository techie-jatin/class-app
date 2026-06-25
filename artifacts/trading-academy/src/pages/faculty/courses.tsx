import { useListCourses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PAGE_LIMIT = 9;

export default function FacultyCourses() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListCourses({ page, limit: PAGE_LIMIT });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_LIMIT));
  const from = (data?.total ?? 0) === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const to = Math.min(page * PAGE_LIMIT, data?.total ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assigned Courses</h2>
          <p className="text-muted-foreground">Manage materials for the courses you instruct.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-40 w-full rounded-t-xl" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))
        ) : data?.courses.length ? (
          data.courses.map((course) => (
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
                  <span>{course.studentCount || 0} Students</span>
                  <span>{course.lectureCount || 0} Lectures</span>
                </div>
                <Button className="w-full" variant="outline">
                  Manage Content
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Assigned Courses</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              You haven't been assigned to any courses yet.
            </p>
          </div>
        )}
      </div>

      {(data?.total ?? 0) > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {data?.total}
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
