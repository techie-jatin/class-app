import { useState } from "react";
import { useGetCourse, useListLectures, useListNotes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, FileText, PlayCircle, Clock, CheckCircle, ExternalLink, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0", 10);
  const [selectedLectureIdx, setSelectedLectureIdx] = useState(0);

  const { data: course, isLoading: isCourseLoading } = useGetCourse(courseId);
  const { data: lecturesData, isLoading: isLecturesLoading } = useListLectures({ courseId });
  const { data: notesData, isLoading: isNotesLoading } = useListNotes({ courseId });

  const selectedLecture = lecturesData?.[selectedLectureIdx];

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
    return <div className="p-6 text-muted-foreground">Course not found.</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="uppercase text-[10px] tracking-widest">
            {course.status}
          </Badge>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{course.name}</h2>
        <p className="text-lg text-muted-foreground mt-2">{course.description}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <Video className="h-4 w-4" /> {lecturesData?.length || 0} Lectures
          </span>
          {course.facultyName && (
            <span>Instructor: <span className="text-foreground">{course.facultyName}</span></span>
          )}
        </div>
      </div>

      <Tabs defaultValue="lectures" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="lectures" className="gap-2">
            <PlayCircle className="h-4 w-4" /> Lectures
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" /> Study Materials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lectures" className="mt-6 space-y-8">
          {isLecturesLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : lecturesData?.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Player */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="overflow-hidden border-border bg-black">
                  <div className="aspect-video w-full relative">
                    {selectedLecture?.youtubeVideoId ? (
                      <iframe
                        key={selectedLecture.youtubeVideoId}
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedLecture.youtubeVideoId}?rel=0&modestbranding=1&autoplay=0`}
                        title={selectedLecture.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white/50 bg-black">
                        <PlayCircle className="h-16 w-16 mb-4 opacity-30" />
                        <p className="text-sm">No video available for this lecture</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Lecture info below player */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Lecture {selectedLectureIdx + 1} of {lecturesData.length}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">{selectedLecture?.title}</h3>
                        {selectedLecture?.description && (
                          <p className="text-sm text-muted-foreground mt-1">{selectedLecture.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedLectureIdx === 0}
                        onClick={() => setSelectedLectureIdx(i => Math.max(0, i - 1))}
                      >
                        ← Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedLectureIdx === lecturesData.length - 1}
                        onClick={() => setSelectedLectureIdx(i => Math.min(lecturesData.length - 1, i + 1))}
                      >
                        Next →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lecture List Sidebar */}
              <div className="lg:col-span-1">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="py-4 border-b border-border shrink-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      Course Content
                    </CardTitle>
                  </CardHeader>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {lecturesData.map((lecture, i) => (
                      <button
                        key={lecture.id}
                        onClick={() => setSelectedLectureIdx(i)}
                        className={`w-full text-left p-3 rounded-md transition-all duration-150 hover:bg-muted group ${
                          i === selectedLectureIdx
                            ? "bg-primary/10 border border-primary/30"
                            : "border border-transparent"
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className="shrink-0 mt-0.5">
                            {i === selectedLectureIdx ? (
                              <PlayCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              i === selectedLectureIdx ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            }`}>
                              {i + 1}. {lecture.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/60">
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
                <Card key={note.id} className="hover:border-primary/50 transition-colors group">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors shrink-0">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{note.fileName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded {new Date(note.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {note.driveViewUrl && (
                      <div className="mt-4 pt-3 border-t border-border flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" asChild>
                          <a href={note.driveViewUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3 w-3" /> View
                          </a>
                        </Button>
                        <Button size="sm" variant="default" className="flex-1 gap-1.5 text-xs" asChild>
                          <a href={note.driveViewUrl} target="_blank" rel="noreferrer" download>
                            <Download className="h-3 w-3" /> Download
                          </a>
                        </Button>
                      </div>
                    )}
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
