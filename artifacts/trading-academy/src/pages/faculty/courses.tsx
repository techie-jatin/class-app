import { useListCourses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function FacultyCourses() {
  const { data: coursesData, isLoading } = useListCourses({});

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
        ) : coursesData?.length ? (
          coursesData.map((course) => (
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
    </div>
  );
}
