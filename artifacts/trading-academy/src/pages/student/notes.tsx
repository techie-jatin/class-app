import { useListNotes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function StudentNotes() {
  const { data, isLoading } = useListNotes({});

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Study Materials</h2>
        <p className="text-muted-foreground">Access your course notes and resources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : data?.length ? (
          data.map((note) => (
            <Card key={note.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{note.fileName}</h4>
                  <p className="text-xs text-muted-foreground">{note.courseName}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.uploadedAt).toLocaleDateString()}
                  </span>
                  {note.driveViewUrl && (
                    <Button size="sm" variant="ghost" className="h-8 gap-1" asChild>
                      <a href={note.driveViewUrl} target="_blank" rel="noreferrer">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Materials Available</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              There are no notes or study materials available for your enrolled courses yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
