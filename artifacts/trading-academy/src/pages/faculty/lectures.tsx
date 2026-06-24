import { useListLectures } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function FacultyLectures() {
  const { data, isLoading } = useListLectures({});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lectures</h2>
          <p className="text-muted-foreground">Manage your uploaded video content.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Upload Lecture
        </Button>
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
            </Card>
          ))
        ) : data?.length ? (
          data.map((lecture) => (
            <Card key={lecture.id} className="flex flex-col overflow-hidden">
              <div className="aspect-video w-full bg-muted relative group cursor-pointer">
                {lecture.thumbnail ? (
                  <img src={lecture.thumbnail} alt={lecture.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-black/90">
                    <Video className="h-10 w-10 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">Edit Lecture</Button>
                </div>
              </div>
              <CardHeader className="py-4">
                <div className="text-xs font-semibold text-primary mb-1">{lecture.courseName}</div>
                <CardTitle className="text-lg line-clamp-1">{lecture.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{lecture.description}</p>
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Lectures Uploaded</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
              You haven't uploaded any video content yet. Click the button above to add your first lecture.
            </p>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Upload Lecture
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
