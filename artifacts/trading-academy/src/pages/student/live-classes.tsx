import { useListLiveClasses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonitorPlay, Clock, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function StudentLiveClasses() {
  const { data, isLoading } = useListLiveClasses({ upcoming: true });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Live Classes</h2>
        <p className="text-muted-foreground">Join upcoming scheduled live sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))
        ) : data?.length ? (
          data.map((cls) => (
            <Card key={cls.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-semibold text-primary">{cls.courseName}</div>
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    {new Date(cls.scheduledAt).toLocaleString()}
                  </div>
                </div>
                <CardTitle className="text-lg">{cls.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">{cls.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-4">
                  Instructor: {cls.facultyName}
                </div>
                <Button asChild className="w-full gap-2">
                  <a href={cls.youtubeUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> Join Session
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
            <MonitorPlay className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground">No Upcoming Classes</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              There are no live classes scheduled at this time. Check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
