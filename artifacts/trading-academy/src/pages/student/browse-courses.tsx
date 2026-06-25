import { useBrowseCourses, useEnrollInCourse } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, Video, CheckCircle2, Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";

export default function BrowseCourses() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const { data: courses, isLoading, refetch } = useBrowseCourses(
    debouncedSearch ? { search: debouncedSearch } : {}
  );
  const enrollMutation = useEnrollInCourse();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((handleSearch as any)._timer);
    (handleSearch as any)._timer = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const handleEnroll = async (courseId: number, courseName: string) => {
    setEnrollingId(courseId);
    try {
      await enrollMutation.mutateAsync({ id: courseId });
      toast({ title: "Enrolled!", description: `You're now enrolled in "${courseName}".` });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["listCourses"] });
      queryClient.invalidateQueries({ queryKey: ["getStudentDashboardStats"] });
    } catch {
      toast({ title: "Enrollment failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setEnrollingId(null);
    }
  };

  const unenrolled = courses?.filter(c => !c.enrolled) ?? [];
  const enrolled = courses?.filter(c => c.enrolled) ?? [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Browse Courses</h2>
        <p className="text-muted-foreground">Discover and enroll in available programs.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-40 w-full rounded-t-xl" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="mt-auto pt-4 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {unenrolled.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Available Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unenrolled.map(course => (
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
                      <CardTitle className="text-lg leading-snug">{course.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-2 flex flex-col gap-4">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {course.lectureCount} lectures</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.studentCount} students</span>
                        {course.facultyName && <span className="truncate">{course.facultyName}</span>}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course.id, course.name)}
                        disabled={enrollingId === course.id}
                      >
                        {enrollingId === course.id ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enrolling...</>
                        ) : "Enroll Now"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {enrolled.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Already Enrolled
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolled.map(course => (
                  <Card key={course.id} className="flex flex-col border-green-500/30 bg-green-500/5">
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
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-snug">{course.name}</CardTitle>
                        <Badge variant="outline" className="text-green-600 border-green-500/50 shrink-0 mt-0.5">Enrolled</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-2 flex flex-col gap-4">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {course.lectureCount} lectures</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.studentCount} students</span>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/student/courses/${course.id}`}>Go to Course</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {!isLoading && unenrolled.length === 0 && enrolled.length === 0 && (
            <div className="py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
              <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-2">
                {debouncedSearch ? "Try a different search term." : "No active courses are available right now."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
