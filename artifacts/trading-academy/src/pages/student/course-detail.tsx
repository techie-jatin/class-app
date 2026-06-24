import { useGetCourse, useListLectures, useListNotes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, PlayCircle, Clock } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0", 10);

  const { data: course, isLoading: isCourseLoading } = useGetCourse(courseId);
  const { data: lecturesData, isLoading: isLecturesLoading } = useListLectures({ courseId });
  const { data: notesData, isLoading: isNotesLoading } = useListNotes({ courseId });

  if (isCourseLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!course) {
    return <div className="p-6">Course not found.</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{course.name}</h2>
        <p className="text-lg text-muted-foreground mt-2">{course.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1"><Video className="h-4 w-4"/> {course.lectureCount || 0} Lectures</span>
          <span>Instructor: {course.facultyName || "Unassigned"}</span>
        </div>
      </div>

      <Tabs defaultValue="lectures" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="notes">Study Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lectures" className="mt-6 space-y-8">
          {isLecturesLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : lecturesData?.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Main player area - showing first lecture by default or placeholder */}
                <Card className="overflow-hidden border-border bg-black">
                  <div className="aspect-video w-full relative">
                    {lecturesData[0]?.youtubeVideoId ? (
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${lecturesData[0].youtubeVideoId}?rel=0&modestbranding=1`}
                        title="Course Lecture"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white/50">
                        <PlayCircle className="h-16 w-16 mb-4 opacity-50" />
                        <p>Select a lecture to begin</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-card text-card-foreground">
                    <h3 className="font-semibold text-lg">{lecturesData[0]?.title || "Course Introduction"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{lecturesData[0]?.description || "Welcome to the course."}</p>
                  </div>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="py-4 border-b border-border shrink-0">
                    <CardTitle className="text-base">Course Content</CardTitle>
                  </CardHeader>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {lecturesData.map((lecture, i) => (
                      <button 
                        key={lecture.id}
                        className={`w-full text-left p-3 rounded-md transition-colors hover:bg-muted ${i === 0 ? 'bg-muted border border-border' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="shrink-0 mt-0.5">
                            <PlayCircle className={`h-5 w-5 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {i + 1}. {lecture.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No lectures have been uploaded for this course yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notes" className="mt-6">
          {isNotesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : notesData?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notesData.map((note) => (
                <Card key={note.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">{note.fileName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Uploaded {new Date(note.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No study materials available for this course.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
